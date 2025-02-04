import numpy as np
from typing import List, Dict, Any

def calculate_advanced_metrics(
    orders: List[Dict[str, Any]],
    equity_curve: List[float],
    initial_capital: float
) -> Dict[str, float]:
    """
    Calculate a suite of advanced performance metrics based on trading orders
    and the equity curve.
    
    :param orders: A list of executed orders (buy/sell).
    :param equity_curve: The equity values at each simulation step.
    :param initial_capital: Starting capital for the backtest.
    :return: Dictionary of performance metrics.
    """
    metrics = {}
    if not equity_curve:
        # If no equity data, return empty metrics
        return metrics

    final_equity = equity_curve[-1]
    total_profit = final_equity - initial_capital
    metrics["total_profit"] = total_profit

    sell_orders = [o for o in orders if o.get("type") == "sell"]
    num_trades = len(sell_orders)
    metrics["num_trades"] = num_trades

    wins = [o for o in sell_orders if o.get("profit", 0) > 0]
    win_rate = len(wins) / num_trades if num_trades > 0 else 0.0
    metrics["win_rate"] = win_rate

    # Average profit per sell
    if num_trades > 0:
        avg_profit = float(np.mean([o.get("profit", 0) for o in sell_orders]))
    else:
        avg_profit = 0.0
    metrics["avg_profit_per_trade"] = avg_profit

    equity_array = np.array(equity_curve)
    running_max = np.maximum.accumulate(equity_array)
    drawdowns = (running_max - equity_array) / running_max
    max_drawdown = float(np.max(drawdowns)) if drawdowns.size > 0 else 0.0
    metrics["max_drawdown"] = max_drawdown

    # Sharpe ratio (assuming 0% risk-free rate)
    returns = np.diff(equity_array) / equity_array[:-1]
    if len(returns) > 1 and np.std(returns) > 0:
        sharpe_ratio = float(np.mean(returns) / np.std(returns))
    else:
        sharpe_ratio = 0.0
    metrics["sharpe_ratio"] = sharpe_ratio

    return metrics
