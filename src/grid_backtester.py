import pandas as pd
import matplotlib.pyplot as plt
from typing import Tuple, List

from config import logger
from src.data_handler.base_data_handler import BaseDataHandler
from src.trading_strategy import dynamic_grid_strategy

class GridBacktester(BaseDataHandler):
    """
    Simulates a dynamic grid trading strategy on historical data.
    Inherits from BaseDataHandler for fetching/storing OHLCV data.
    """

    def __init__(
        self,
        symbol: str,
        interval: str,
        grid_levels: int,
        percent_range: float,
        initial_capital: float,
        order_size: float
    ):
        super().__init__()
        self.symbol = symbol
        self.interval = interval
        self.grid_levels = grid_levels
        self.percent_range = percent_range
        self.initial_capital = initial_capital
        self.order_size = order_size

        self.orders = []
        self.equity_curve = []
        self.pivot = None

    def fetch_and_store_data(self, start_time: int = None, end_time: int = None) -> None:
        """
        Fetch historical data and store it in memory using the base class methods.
        """
        data = self.fetch_historical_data(self.symbol, self.interval, start_time, end_time)
        if data.empty:
            logger.warning("No historical data found for symbol: %s", self.symbol)
        else:
            self.store_data(self.symbol, data)

    def simulate(self) -> Tuple[List[dict], List[float]]:
        """
        Run the dynamic grid strategy simulation.
        Returns a tuple of (orders, equity_curve).
        """
        data = self.get_stored_data(self.symbol)
        if data is None or data.empty:
            raise ValueError("No data to run simulation.")

        orders, equity, final_pivot = dynamic_grid_strategy(
            data,
            self.symbol,
            self.interval,
            grid_levels=self.grid_levels,
            percent_range=self.percent_range,
            initial_capital=self.initial_capital,
            order_size=self.order_size
        )

        self.orders = orders
        self.equity_curve = equity
        self.pivot = final_pivot
        return orders, equity

    def plot_equity_curve(self) -> None:
        """
        Quick debug/visualization method to show the equity curve using matplotlib.
        """
        if not self.equity_curve:
            logger.warning("No equity curve data available to plot.")
            return

        plt.figure(figsize=(10, 5))
        plt.plot(self.equity_curve, label="Equity Curve", color='purple')
        plt.xlabel("Time Steps")
        plt.ylabel("Total Equity")
        plt.title("Dynamic Grid Trading Backtest - Equity Curve")
        plt.legend()
        plt.grid(True)
        plt.show()

    def plot_orders(self) -> None:
        """
        Quick debug/visualization method to plot buy/sell points on the historical price chart.
        """
        data = self.get_stored_data(self.symbol)
        if data is None or data.empty:
            logger.warning("No historical data available for plotting.")
            return

        plt.figure(figsize=(12, 6))
        plt.plot(data['time'], data['close'], label="Price", color='blue')

        buys = [order for order in self.orders if order['type'] == 'buy']
        sells = [order for order in self.orders if order['type'] == 'sell']

        if buys:
            plt.scatter(
                [order['time'] for order in buys],
                [order['price'] for order in buys],
                color='green', label="Buy", marker="^", s=100
            )
        if sells:
            plt.scatter(
                [order['time'] for order in sells],
                [order['price'] for order in sells],
                color='red', label="Sell", marker="v", s=100
            )

        plt.xlabel("Time")
        plt.ylabel("Price")
        plt.title(f"Dynamic Grid Trading Orders - {self.symbol}")
        plt.legend()
        plt.grid(True)
        plt.show()
