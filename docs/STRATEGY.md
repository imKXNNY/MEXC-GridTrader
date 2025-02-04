# Strategy Documentation: Dynamic Grid Trading Strategy

## 1. Overview

The Dynamic Grid Trading Strategy is designed to profit from market volatility by placing buy and sell orders at predetermined grid levels. The strategy updates its grid dynamically using a pivot price, which gets recalculated as trades are executed, to capture short-term price fluctuations while managing risk and preserving capital.

## 2. Strategy Outline

### 2.1 Initialization
- **Historical Data**: The strategy fetches historical OHLCV data (candlestick data) for a specified trading pair and interval.
- **Pivot Price**: The initial pivot is set to the closing price of the first candle. This pivot acts as a reference point for defining grid thresholds.
- **Cooldown Mechanism**: A cooldown is used to prevent rapid repeated entries.

### 2.2 Buy Signal (Entry)
- **Condition**: A buy order is triggered when the current price falls below a threshold:
  \[
  \text{buy\_threshold} = \text{pivot} \times (1 - \text{grid\_spacing})
  \]
- **Order Execution**: When the condition is met and sufficient capital is available, a fixed dollar amount (`order_size`) is used to buy the asset. Units purchased = `order_size / current_price`.
- **Pivot Update**: The pivot is updated to the new (lower) price.
- **Cooldown**: After a buy, a cooldown period is set (e.g., 3 candles) before the next buy can occur.

### 2.3 Sell Signal (Exit)
- **Condition**: For each buy order (or collectively), a sell order is triggered if the current price rises above:
  \[
  \text{sell\_threshold} = \text{buy\_price} \times (1 + \text{grid\_spacing})
  \]
- **Order Execution**: The position is sold at that grid level, capital is increased by `coins_sold * sell_price`.
- **Pivot Update**: Pivot is updated to the current price after the sell.

### 2.4 Dynamic Adjustments
- **Adaptive Grid Spacing**: You can dynamically change `percent_range` based on market volatility (e.g., using ATR).
- **Pivot Refinement**: Use a rolling pivot (e.g., short-term moving average) for dynamic updates.
- **Risk Controls**: Add max drawdown or stop-loss limits, etc.

### 2.5 Mark-to-Market & Equity Calculation
- At each time step, total equity = capital + (units_held * current_price). This forms the equity curve.

## 3. Parameters
- **symbol** (str): e.g., "BTC/USDT"
- **interval** (str): e.g., "1h", "15m"
- **grid_levels** (int): Number of grid levels (in this demo code, used less explicitly, but can be extended).
- **percent_range** (float): e.g., 0.05 for 5%.
- **initial_capital** (float): e.g., 10,000.
- **order_size** (float): e.g., 100 per buy order.

## 4. Execution Flow
1. **Fetch Data**: Historical data is fetched and stored.
2. **Simulation**: Each candle triggers potential buy/sell checks.
3. **Results Storage**: Orders, equity curve, and metrics are saved.

## 5. Future Enhancements
- Automatic parameter optimization (grid search or GA).
- Real-time streaming data for live trading, hooking up to actual MEXC account with robust error handling.
- More sophisticated risk management (stop-loss, trailing stops, position sizing adjustments).
