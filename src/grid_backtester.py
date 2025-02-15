# src/grid_backtester.py
import backtrader as bt
from typing import Tuple, List, Dict, Any
import pandas as pd

from config import logger
from src.data_handler.base_data_handler import BaseDataHandler
from src.trading_strategy import BoxMacdRsiStrategy


class GridBacktester(BaseDataHandler):
    def __init__(
        self,
        symbol: str,
        interval: str,
        initial_capital: float,
        risk_percent: float,
        box_params: Dict[str, Any]
    ):
        super().__init__()
        self.symbol = symbol
        self.interval = interval
        self.initial_capital = initial_capital
        self.risk_percent = risk_percent
        self.box_params = box_params


    def fetch_and_store_data(self, start_time: int = None, end_time: int = None) -> None:
        """
        Fetch historical data and store it in memory using the base class methods.
        """
        data = self.fetch_historical_data(self.symbol, self.interval, start_time, end_time)
        if data.empty:
            logger.warning("No historical data found for symbol: %s", self.symbol)
        else:
            self.store_data(self.symbol, data)

    def simulate(self):
        data = self.get_stored_data(self.symbol)
        if data is None or data.empty:
            raise ValueError("No data to run simulation.")

        logger.info("Data being passed to Backtrader: %s", data.head())

        # Create Cerebro engine
        cerebro = bt.Cerebro()
        # Combine box_params with risk_percent for strategy
        strategy_params = {**self.box_params, 'risk_percent': self.risk_percent}
        cerebro.addstrategy(BoxMacdRsiStrategy, **strategy_params)

        if 'time' in data.columns:
            # Convert time column to datetime if not already
            if not pd.api.types.is_datetime64_any_dtype(data['time']):
                # If timestamps are in milliseconds, convert directly
                if data['time'].dtype == 'int64' and data['time'].max() > 1e12:
                    data['time'] = pd.to_datetime(data['time'], unit='ms')
                else:
                    # Fallback to string parsing with error handling
                    data['time'] = pd.to_datetime(data['time'], errors='coerce')
            # Ensure time is the index for backtrader
            data.set_index('time', inplace=True)
        # Create data feed

        data_feed = bt.feeds.PandasData(dataname=data)
        cerebro.adddata(data_feed)

        # Set initial capital
        cerebro.broker.set_cash(self.initial_capital)

        # Run backtest
        results = cerebro.run()

        # Get results from strategy
        if results:
            strategy = results[0]
            return strategy.orders, cerebro.broker.getvalue()
        
        return [], 0.0
