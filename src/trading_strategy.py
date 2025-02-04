import pandas as pd
from typing import List, Tuple, Dict, Any

def dynamic_grid_strategy(
    historical_data: pd.DataFrame,
    symbol: str,
    interval: str,
    grid_levels: int,
    percent_range: float,
    initial_capital: float,
    order_size: float
) -> Tuple[List[Dict[str, Any]], List[float], float]:
    """
    Implements the Dynamic Grid Trading Strategy.

    :param historical_data: DataFrame with columns: [time, open, high, low, close, volume].
    :param symbol: Trading pair symbol.
    :param interval: Timeframe for the data.
    :param grid_levels: Number of grid levels (currently unused in basic example, but can be extended).
    :param percent_range: Percentage for grid spacing (e.g., 0.05 for 5%).
    :param initial_capital: Starting capital for the simulation.
    :param order_size: Fixed dollar amount for each buy.
    :return: (orders, equity_curve, final_pivot)
    """
    # Initialize
    pivot = historical_data['close'].iloc[0]
    cooldown = 0
    capital = initial_capital
    orders: List[Dict[str, Any]] = []
    equity_curve = []

    # Track how many units of the asset we hold (since each buy invests "order_size" at that moment)
    units_held = 0.0

    for idx, row in historical_data.iterrows():
        current_price = float(row['close'])
        current_time = row['time']  # Keep as datetime or as-is

        # Check BUY signal
        buy_threshold = pivot * (1 - percent_range)
        if current_price < buy_threshold and cooldown == 0:
            # Enough capital to place a new buy
            if capital >= order_size:
                # Calculate how many coins we get for "order_size" USD
                coins_bought = order_size / current_price
                units_held += coins_bought
                capital -= order_size

                orders.append({
                    'type': 'buy',
                    'time': str(current_time),
                    'price': current_price,
                    'coins': coins_bought
                })

                pivot = current_price  # Update pivot to the new price
                cooldown = 3  # e.g., wait 3 candles before next buy

        # Check SELL signal (for each buy). 
        # In this simplistic approach, we treat the entire held position collectively,
        # but we can also treat each buy separately for partial sells.
        to_remove = []
        for o_idx, order in enumerate(orders):
            if order['type'] == 'buy':
                sell_threshold = order['price'] * (1 + percent_range)
                if current_price > sell_threshold:
                    # We "sell" exactly the coins from that buy
                    coins_sold = order['coins']
                    # Revenue from the sell:
                    revenue = coins_sold * current_price
                    capital += revenue
                    units_held -= coins_sold

                    # Calculate profit in currency
                    cost_basis = order['coins'] * order['price']
                    profit = revenue - cost_basis

                    orders.append({
                        'type': 'sell',
                        'time': str(current_time),
                        'price': current_price,
                        'coins': coins_sold,
                        'profit': profit
                    })
                    pivot = current_price
                    to_remove.append(o_idx)

        # Remove the corresponding buy orders that got sold
        # (so we don't sell them multiple times)
        for idx_to_rm in sorted(to_remove, reverse=True):
            orders.pop(idx_to_rm)

        # Mark-to-market equity
        # capital + (units_held * current_price)
        total_equity = capital + (units_held * current_price)
        equity_curve.append(total_equity)

        # Decrease cooldown
        if cooldown > 0:
            cooldown -= 1

    return orders, equity_curve, pivot
