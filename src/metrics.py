import numpy as np
from typing import List, Dict, Any

def calculate_advanced_metrics(
    orders: List[Dict[str, Any]],
    initial_capital: float,
    final_value: float
) -> Dict[str, float]:


    """
    Calculate a suite of advanced performance metrics based on trading orders
    and the final account value.
    
    :param orders: A list of executed orders (buy/sell).
    :param initial_capital: Starting capital for the backtest.
    :param final_value: The final account value after the backtest.
    :return: Dictionary of performance metrics.
    """
    metrics = {}
    if final_value <= 0:
        # If invalid final value, return empty metrics
        return metrics

    final_equity = final_value

    total_profit = final_equity - initial_capital
    metrics["total_profit"] = total_profit

    sell_orders = [o for o in orders if o.get("type", "").startswith("sell")]
    # Count all trades (both buy and sell)
    num_trades = len(orders)

    metrics["num_trades"] = num_trades

    wins = [o for o in sell_orders if o.get("profit", 0) > 0]
    # Calculate win rate based on profitable trades
    profitable_trades = [order for order in orders if order.get('profit', 0) > 0]
    win_rate = len(profitable_trades) / num_trades if num_trades > 0 else 0.0

    metrics["win_rate"] = win_rate

    # Calculate average profit per trade
    if num_trades > 0:
        total_profit = sum(order.get('profit', 0) for order in orders)
        avg_profit = total_profit / num_trades
    else:
        avg_profit = 0.0
        
    metrics["avg_profit_per_trade"] = avg_profit


    # Simplified max drawdown calculation
    sell_prices = [order['price'] for order in orders if order.get('type', '').startswith('sell')]
    max_drawdown = max(0, (initial_capital - min(sell_prices)) / initial_capital) if sell_prices else 0.0


    # Calculate max drawdown
    if len(orders) > 0:
        equity = initial_capital
        peak = equity
        max_drawdown = 0.0
        
        for order in orders:
            equity += order.get('profit', 0)
            if equity > peak:
                peak = equity
            drawdown = (peak - equity) / peak if peak != 0 else 0.0
            if drawdown > max_drawdown:
                max_drawdown = drawdown
                
    metrics["max_drawdown"] = max_drawdown


    # Calculate Sharpe ratio using order profits
    returns = [order.get('profit', 0) / initial_capital for order in orders if initial_capital > 0]
    if len(returns) > 0:
        avg_return = sum(returns) / len(returns)
        std_dev = (sum((r - avg_return) ** 2 for r in returns) / len(returns)) ** 0.5
        sharpe_ratio = avg_return / std_dev if std_dev != 0 else 0.0
    else:
        sharpe_ratio = 0.0
    
    metrics["sharpe_ratio"] = sharpe_ratio



    return metrics
