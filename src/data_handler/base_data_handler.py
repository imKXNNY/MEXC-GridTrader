import os
import pandas as pd
import ccxt
from typing import Dict, Optional
from config import logger

class BaseDataHandler:
    """
    Base class for fetching and storing OHLCV data in memory,
    now with CSV caching support.
    """

    CACHE_DIR = "ohlcv_cache"  # Folder where CSV files will be stored

    def __init__(self):
        self.data_store: Dict[str, pd.DataFrame] = {}

        # Ensure the cache directory exists
        if not os.path.exists(self.CACHE_DIR):
            os.makedirs(self.CACHE_DIR)

    def _get_csv_path(self, symbol: str, interval: str) -> str:
        """
        Generate a cache filename based on the symbol and interval.
        Example: symbol='BTC/USDT', interval='1h' => 'ohlcv_cache/BTC-USDT_1h.csv'
        """
        symbol_sanitized = symbol.replace("/", "-")
        return os.path.join(self.CACHE_DIR, f"{symbol_sanitized}_{interval}.csv")

    def _load_from_csv(self, csv_path: str) -> pd.DataFrame:
        """
        Loads a CSV file into a DataFrame, if it exists.
        Expects a 'time' column for date parsing.
        """
        if not os.path.exists(csv_path):
            return pd.DataFrame()
        try:
            df = pd.read_csv(csv_path, parse_dates=['time'])
            df.sort_values('time', inplace=True)
            df.reset_index(drop=True, inplace=True)
            logger.info("Loaded %d rows from cache: %s", len(df), csv_path)
            return df
        except Exception as e:
            logger.error("Error loading CSV at %s: %s", csv_path, e)
            return pd.DataFrame()

    def _save_to_csv(self, df: pd.DataFrame, csv_path: str):
        """
        Saves a DataFrame to CSV, overwriting existing file.
        """
        try:
            df.to_csv(csv_path, index=False)
            logger.info("Saved %d rows to CSV: %s", len(df), csv_path)
        except Exception as e:
            logger.error("Error saving CSV to %s: %s", csv_path, e)

    def fetch_historical_data(
        self,
        symbol: str,
        interval: str = '1h',
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Fetch historical OHLCV data from MEXC (via ccxt), with CSV caching and incremental updates.
        """

        csv_path = self._get_csv_path(symbol, interval)
        cached_df = self._load_from_csv(csv_path)

        # If we have cached data, determine our start_time from the last candle + 1 interval
        if not cached_df.empty:
            cached_df.sort_values('time', inplace=True)
            latest_time_in_cache = cached_df['time'].iloc[-1]
            # Convert that timestamp to ms
            last_ts_ms = int(latest_time_in_cache.value // 10**6)  # pd.Timestamp => nanoseconds, so // 1e6 => ms
            if start_time is None:
                # If user didn't pass a specific start_time, let's fetch from the last known timestamp
                start_time = last_ts_ms
        else:
            # If we have no cached data, we'll fetch from whatever start_time was given
            last_ts_ms = start_time or None

        exchange = ccxt.mexc({'enableRateLimit': True})
        all_dfs = [cached_df]

        # Keep fetching until we’ve gotten up to 'end_time' or no more new data.
        while True:
            # We might pass start_time=last_ts_ms + 1 to avoid re-downloading the last candle, for instance
            since = last_ts_ms + 1 if last_ts_ms else None

            # If end_time is in ms and we’re already past it, break
            if end_time and since and since > end_time:
                break

            try:
                ohlcv = exchange.fetch_ohlcv(symbol, timeframe=interval, since=since, limit=1000)
            except Exception as e:
                logger.error("Error fetching CCXT data: %s", e)
                break

            if not ohlcv:
                # No more data returned => we’ve fetched everything
                logger.info("No additional candles returned from exchange.")
                break

            fresh_df = pd.DataFrame(ohlcv, columns=['time', 'open', 'high', 'low', 'close', 'volume'])
            fresh_df['time'] = pd.to_datetime(fresh_df['time'], unit='ms')

            # If user specified end_time, cut off any candles beyond it
            if end_time is not None:
                end_dt = pd.to_datetime(end_time, unit='ms')
                fresh_df = fresh_df[fresh_df['time'] <= end_dt]

            if fresh_df.empty:
                break

            logger.info("Fetched %d new candles starting at %s.", len(fresh_df), fresh_df['time'].iloc[0])

            # Append to our list
            all_dfs.append(fresh_df)

            # Update last_ts_ms for next iteration
            last_ts_ms = int(fresh_df['time'].iloc[-1].value // 10**6)

            # If we got fewer than 1000 candles, likely we’ve reached the latest data
            if len(fresh_df) < 1000:
                break

        # Merge everything
        merged = pd.concat(all_dfs, ignore_index=True).drop_duplicates(subset=['time']).sort_values('time')
        merged.reset_index(drop=True, inplace=True)

        # Save merged result back to CSV
        if not merged.empty:
            self._save_to_csv(merged, csv_path)

        return merged

    def store_data(self, symbol: str, data: pd.DataFrame) -> None:
        """
        Store historical data in memory for quick access within the app.
        """
        self.data_store[symbol] = data
        logger.info("Data stored for %s with %d records.", symbol, len(data))

    def get_stored_data(self, symbol: str) -> Optional[pd.DataFrame]:
        """
        Retrieve stored historical data for a symbol, if any.
        """
        return self.data_store.get(symbol)

    def clear_data(self) -> None:
        """
        Clear all in-memory stored data.
        Does not delete cached CSV files on disk.
        """
        self.data_store.clear()
        logger.info("Data store cleared.")
