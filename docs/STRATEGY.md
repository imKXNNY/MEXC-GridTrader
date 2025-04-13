# TradeSage: Strategy Documentation

# Current Strategies (App Version 1.0.0)

## Current Strategy of Focus

### FOUNDATIONAL STRATEGY: Momentum Trend-Following

Below is a PineScript V6 implementation of the strategy outlined above. This script is designed to be run on a chart with the specified parameters. It will display the buy and sell signals. The Strategy was built and simple-tested for basic parameterization on the 1H Timeframe of the BTC/USDT pair.

```pinescript (v6)
// This Pine Script™ code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © itzK

//@version=6
strategy("Trend-Following Momentum Strategy (Custom ADX)", overlay=true)

// === INPUTS ===
ema_short_length    = input.int(50,  title="Short EMA Length")
ema_long_length     = input.int(200, title="Long EMA Length")
rsi_length          = input.int(14,  title="RSI Length")
stoch_length        = input.int(14,  title="Stochastic RSI Length")

// Custom ADX inputs
di_len              = input.int(14,  title="DI Length")
adx_smoothing       = input.int(14,  title="ADX Smoothing")

stop_loss_perc      = input.float(1.0, title="Stop Loss (%)") / 100
take_profit_perc    = input.float(3.0, title="Take Profit (%)") / 100

// === 1) DEFINE CUSTOM ADX FUNCTIONS ===
// This replicates your ADX indicator logic inside the strategy

// Function to calculate +DI and -DI
dirmov(len) =>
    up      = ta.change(high)
    down    = -ta.change(low)
    plusDM  = na(up)   ? na : (up > down and up > 0     ? up   : 0)
    minusDM = na(down) ? na : (down > up and down > 0   ? down : 0)
    truerange = ta.rma(ta.tr, len)
    plus  = fixnan(100 * ta.rma(plusDM,  len) / truerange)
    minus = fixnan(100 * ta.rma(minusDM, len) / truerange)
    [plus, minus]

// Function to calculate ADX from +DI and -DI
adxFunc(_diLen, _adxSmooth) =>
    [plus, minus] = dirmov(_diLen)
    sum = plus + minus
    // If sum == 0, prevent division by zero by using 1
    adxVal = 100 * ta.rma(math.abs(plus - minus) / (sum == 0 ? 1 : sum), _adxSmooth)
    [adxVal, plus, minus]

// === 2) CALCULATE INDICATORS ===
// EMAs
ema_short = ta.ema(close, ema_short_length)
ema_long  = ta.ema(close, ema_long_length)

// RSI
rsi = ta.rsi(close, rsi_length)

// Stochastic RSI (smoothed K & D)
kValue   = ta.stoch(close, high, low, stoch_length)
stoch_k  = ta.sma(kValue, 3)
stoch_d  = ta.sma(stoch_k, 3)

// Custom ADX (+DI, -DI)
[myAdx, di_plus, di_minus] = adxFunc(di_len, adx_smoothing)

// === 3) DEFINE CONDITIONS ===
// Crossovers
stoch_cross_up  = ta.crossover(stoch_k, stoch_d)       // Stoch K crossing above D
ema_cross_under = ta.crossunder(ema_short, ema_long)   // 50 EMA crosses below 200 EMA

// Trend Check: Uptrend if short EMA > long EMA and price above long EMA
bullish_trend = (ema_short > ema_long) and (close > ema_long)

// Long Entry Conditions
long_entry = bullish_trend and rsi > 40 and rsi < 70 and stoch_cross_up and stoch_k < 20 and myAdx > 17

// Long Exit Conditions
long_exit = (rsi > 80) or (ema_cross_under)

// === 4) RISK MANAGEMENT (Stop Loss & Take Profit) ===
long_stop_loss   = close * (1.0 - stop_loss_perc)
long_take_profit = close * (1.0 + take_profit_perc)

// === 5) STRATEGY EXECUTION ===
if long_entry
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", from_entry="Long", stop=long_stop_loss, limit=long_take_profit)

// Additional exit signal (if not already stopped/taken profit)
if long_exit
    strategy.close("Long")

// === 6) PLOT EMAs & VISUAL SIGNALS ===
plot(ema_short, color=color.blue,   title="EMA 50")
plot(ema_long,  color=color.orange, title="EMA 200")

// Highlight bars where signals occur (use color.new() for transparency)
bgcolor(long_entry ? color.new(color.green, 80) : na)
bgcolor(long_exit  ? color.new(color.red,   80) : na)
```

## DEPRECATED (Grid Documentation)

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
    - Real-time streaming data for live trading, hooking up to exchange accounts with robust error handling.
    - More sophisticated risk management (stop-loss, trailing stops, position sizing adjustments).