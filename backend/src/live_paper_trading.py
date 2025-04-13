# live_paper_trading.py

import threading
import json
import backtrader as bt
import pandas as pd
from config import logger
from queue import Queue
from datetime import datetime, timezone
from src.data_handler.live_data_websocket import LiveDataWebSocketHandler
from src.data_handler.exchange_live_feed import ExchangeLiveData
from src.trading_strategy import BoxMacdRsiStrategy
from src.data_handler.base_data_handler import BaseDataHandler

class LivePaperTrading:
    """
    A class to simulate live trading (paper trading) using live data from exchange WebSocket APIs to test strategies.
    """

    def __init__(self, symbols, live_data_queue, strategy_events_queue, strategy=None,
                 interval='15m', start_time=None, end_time=None, strategy_params=None):
        self.symbols = symbols
        self.strategy = strategy or BoxMacdRsiStrategy
        self.live_data_queue = live_data_queue  # SSE queue for *live* data
        self.historical_data_queue = Queue()    # SSE queue for *historical* data
        self.strategy_params = strategy_params or {}

        self.data_handler = BaseDataHandler()
        self.live_feed = ExchangeLiveData()

        # Backtrader engine
        self.cerebro = bt.Cerebro()
        self.cerebro.adddata(self.live_feed)

        # Add strategy with parameters
        strategy_kwargs = {'strategy_events': strategy_events_queue}
        if self.strategy_params:
            strategy_kwargs.update(self.strategy_params)
        self.cerebro.addstrategy(self.strategy, **strategy_kwargs)

        # 1) Fetch, store, and queue historical data before starting
        for symbol in self.symbols:
            df = self.data_handler.fetch_historical_data(symbol, interval, start_time, end_time)
            if df is None or df.empty:
                continue

            # Ensure we have a 'time' column and it's datetime
            if 'time' not in df.columns:
                # If the index is named 'time', reset it
                if df.index.name == 'time':
                    df = df.reset_index()
                else:
                    raise ValueError("No 'time' column found in historical data")

            # Convert to datetime
            # If your timestamps are in ms:
            if df['time'].dtype == 'int64' and df['time'].max() > 1e12:
                df['time'] = pd.to_datetime(df['time'], unit='ms')
            else:
                df['time'] = pd.to_datetime(df['time'], errors='coerce')

            df.dropna(subset=['time'], inplace=True)
            df.set_index('time', inplace=True)

            # This is optional: limit to last 250 bars
            df_recent = df.tail(250)

            # Prepare a list of dict for SSE
            historical_list = []
            for ts, row in df_recent.iterrows():
                historical_list.append({
                    "time": ts.isoformat(),
                    "open":  row['open'],
                    "high":  row['high'],
                    "low":   row['low'],
                    "close": row['close']
                })

            # Put that entire list in the historical_data_queue
            self.historical_data_queue.put(historical_list)

            # 2) Also add a backtrader data feed from the *same* df
            data_feed = bt.feeds.PandasData(dataname=df)
            self.cerebro.adddata(data_feed)

        # 3) Setup the WebSocket handler for live data
        self.ws_handler = LiveDataWebSocketHandler(
            symbols=self.symbols,
            on_message_callback=self.on_message_callback
        )

    def on_message_callback(self, data: dict):
        """
        Called by the WebSocket whenever a new candle (partial or closed) arrives.
        """
        try:
            # Convert the timestamp to a timezone-aware datetime
            timestamp = datetime.fromtimestamp(data.windowStart, tz=timezone.utc)
            bar = {
                "time": timestamp.isoformat(),
                "open": data.openingPrice,
                "high": data.highestPrice,
                "low":  data.lowestPrice,
                "close": data.closingPrice,
                "volume": data.volume
            }

            # Update the live feed (Backtrader) + push to SSE queue
            self.live_feed.update_bar(bar)
            self.live_data_queue.put(bar)  # Single-candle push
            # logger.info("LivePaperTrading: updated bar %s", bar)  # Debugging
        except KeyError as e:
            logger.error("Missing field in ticker data: %s", e)

    def run(self):
        # Launch the WebSocket thread
        ws_thread = threading.Thread(target=self.ws_handler.run, daemon=True)
        ws_thread.start()

        # Now run backtrader in "live" mode
        logger.info("Starting Backtrader in live (paper) mode...")
        self.cerebro.run(runonce=False, preload=False, live=True)

    def stop(self):
        logger.info("Stopping LivePaperTrading...")
        self.cerebro.runstop()
        self.ws_handler.stop()
