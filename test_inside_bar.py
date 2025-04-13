# test_inside_bar.py
from backend.src.grid_backtester import GridBacktester

# Parameters for the Inside Bar Strategy
symbol = 'BTCUSDT'
interval = '1h'
initial_capital = 10000
risk_percent = 1.0

# Inside Bar specific parameters
ib_params = {
    'minInsideBarSize': 0.5,
    'useTrendFilter': True,
    'useVolumeFilter': True,
    'volMultiplier': 1.1,
    'useATRTP': True,
    'atrLength': 14,
    'atrMult': 1.5,
    'rr_ratio': 2.5
}

# Create the backtester with Inside Bar strategy
backtester = GridBacktester(
    symbol=symbol,
    interval=interval,
    initial_capital=initial_capital,
    risk_percent=risk_percent,
    strategy_type='ib_price_action',
    box_params=ib_params
)

# Fetch data and run the backtest
print("Fetching data...")
backtester.fetch_and_store_data()
print("Running backtest...")
try:
    orders, final_value, trade_analysis, drawdown_analysis, sharpe_analysis = backtester.simulate()
    
    # Print results
    print(f"Initial capital: {initial_capital}")
    print(f"Final value: {final_value}")
    print(f"Profit: {final_value - initial_capital}")
    print(f"Profit %: {((final_value - initial_capital) / initial_capital) * 100}%")
    print(f"Number of trades: {len(orders)}")
    print(f"Trade analysis: {trade_analysis}")
    print(f"Drawdown analysis: {drawdown_analysis}")
    print(f"Sharpe ratio: {sharpe_analysis}")
except Exception as e:
    print(f"Error running backtest: {str(e)}")
