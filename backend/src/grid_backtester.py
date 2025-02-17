# src/grid_backtester.py
import backtrader as bt
from typing import Tuple, List, Dict, Any
import pandas as pd

from config import logger
from src.data_handler.base_data_handler import BaseDataHandler
from src.trading_strategy import BoxMacdRsiStrategy, MomentumTrendStrategy

class GridBacktester(BaseDataHandler):
    def __init__(
        self,
        symbol: str,
        interval: str,
        initial_capital: float,
        risk_percent: float,
        box_params: Dict[str, Any],
        strategy_type: str = 'momentum'  # 'momentum' or 'grid'
    ):

        super().__init__()
        self.symbol = symbol
        self.interval = interval
        self.initial_capital = initial_capital
        self.risk_percent = risk_percent
        self.box_params = box_params
        self.strategy_type = strategy_type


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

        # Validate required columns
        required_columns = ['open', 'high', 'low', 'close']
        missing_columns = [col for col in required_columns if col not in data.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")

        # Ensure sufficient data length
        min_data_length = 500  # Minimum bars needed for indicators
        if len(data) < min_data_length:
            raise ValueError(f"Insufficient data length: {len(data)}. Need at least {min_data_length} bars")

        logger.info("Data being passed to Backtrader: %s", data.head())

        # Create Cerebro engine
        cerebro = bt.Cerebro()
        # Combine box_params with risk_percent for strategy
        if self.strategy_type == 'momentum':
            strategy_params = {
                'stop_loss_perc': self.risk_percent,
                'take_profit_perc': self.risk_percent * 3  # 3:1 reward ratio
            }
            cerebro.addstrategy(MomentumTrendStrategy, **strategy_params)
        else:
            strategy_params = {**self.box_params, 'risk_percent': self.risk_percent}
            cerebro.addstrategy(BoxMacdRsiStrategy, **strategy_params)


        # Handle time column
        if 'time' not in data.columns:
            if data.index.name == 'time':
                data = data.reset_index()
            else:
                raise ValueError("No time column found in data")
                
        # Convert time column to datetime
        try:
            if data['time'].dtype == 'int64' and data['time'].max() > 1e12:
                data['time'] = pd.to_datetime(data['time'], unit='ms')
            else:
                data['time'] = pd.to_datetime(data['time'], errors='coerce')
            
            # Drop rows with invalid timestamps
            data = data[data['time'].notna()]
            
            # Ensure time is the index for backtrader
            data.set_index('time', inplace=True)
        except Exception as e:
            raise ValueError(f"Failed to process time column: {str(e)}")

        # Create data feed with explicit column mapping
        data_feed = bt.feeds.PandasData(
            dataname=data,
            open=0,
            high=1,
            low=2,
            close=3,
            volume=4,
            openinterest=-1
        )
        cerebro.adddata(data_feed)

        # Set initial capital
        cerebro.broker.set_cash(self.initial_capital)

        # Add analyzer for debugging
        cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')
        cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
        cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')

        # Run backtest with error handling
        try:
            logger.info("Starting backtest simulation...")
            results = cerebro.run()
            logger.info("Backtest completed successfully")
            
            # Log trade analysis
            strat = results[0]
            trade_analysis = strat.analyzers.trades.get_analysis()
            drawdown_analysis = strat.analyzers.drawdown.get_analysis()
            sharpe_analysis = strat.analyzers.sharpe.get_analysis()
            
            logger.info(f"Trade analysis: {trade_analysis}")
            logger.info(f"Drawdown analysis: {drawdown_analysis}")
            logger.info(f"Sharpe Ratio: {sharpe_analysis}")
        except Exception as e:
            logger.error(f"Backtest simulation failed: {str(e)}", exc_info=True)
            raise ValueError(f"Backtest simulation error: {str(e)}")

        # Get results from strategy
        if results:
            strategy = results[0]
            return strategy.orders, cerebro.broker.getvalue(), trade_analysis, drawdown_analysis, sharpe_analysis
        
        return [], 0.0
