# test_patched_ib.py
import backtrader as bt
import pandas as pd
from src.data_handler.base_data_handler import BaseDataHandler
from src.patched_strategy import PatchedIBPriceActionStrategy

# Parameters for the Inside Bar Strategy
symbol = 'BTCUSDT'
interval = '1h'
initial_capital = 10000
risk_percent = 1.0

# Inside Bar specific parameters
ib_params = {
    'risk_percent': risk_percent,
    'minInsideBarSize': 0.5,
    'useTrendFilter': True,
    'useVolumeFilter': True,
    'volMultiplier': 1.1,
    'useATRTP': True,
    'atrLength': 14,
    'atrMult': 1.5,
    'rr_ratio': 2.5
}

# Fetch data
data_handler = BaseDataHandler()
print(f"Fetching data for {symbol} with interval {interval}...")
df = data_handler.fetch_historical_data(symbol, interval)

if df is None or df.empty:
    print("Failed to fetch data")
    exit(1)

print(f"Data fetched: {len(df)} candles")
print(df.head())

# Prepare data for backtrader
if 'time' in df.columns:
    df.set_index('time', inplace=True)
elif df.index.name != 'time':
    print("Warning: No time column found in data")

# Create a backtrader data feed
data = bt.feeds.PandasData(dataname=df)

# Create a cerebro instance
cerebro = bt.Cerebro()
cerebro.adddata(data)

# Add the patched strategy
cerebro.addstrategy(PatchedIBPriceActionStrategy, **ib_params)

# Set initial capital
cerebro.broker.setcash(initial_capital)

# Add analyzers
cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')
cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')

# Run the backtest
print("Running backtest...")
try:
    results = cerebro.run()

    # Get results
    strat = results[0]
    final_value = cerebro.broker.getvalue()
    trade_analysis = strat.analyzers.trades.get_analysis()
    drawdown_analysis = strat.analyzers.drawdown.get_analysis()
    sharpe_analysis = strat.analyzers.sharpe.get_analysis()

    # Print results
    print(f"Initial capital: {initial_capital}")
    print(f"Final value: {final_value}")
    print(f"Profit: {final_value - initial_capital}")
    print(f"Profit %: {((final_value - initial_capital) / initial_capital) * 100}%")
    print(f"Number of trades: {len(strat.orders)}")
    print(f"Trade analysis: {trade_analysis}")
    print(f"Drawdown analysis: {drawdown_analysis}")
    print(f"Sharpe ratio: {sharpe_analysis}")

    # Print trades
    print("\nTrades:")
    for i, trade in enumerate(strat.orders):
        print(f"Trade {i+1}: {trade}")

except Exception as e:
    print(f"Error running backtest: {str(e)}")
    import traceback
    traceback.print_exc()
