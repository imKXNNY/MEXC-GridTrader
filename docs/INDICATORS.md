# TradeSage: Technical Indicators Documentation

## Overview

TradeSage supports a variety of technical indicators to help traders analyze price movements and identify potential trading opportunities. These indicators can be added to the candlestick chart and customized according to the trader's preferences.

## Available Indicators

### Simple Moving Average (SMA)

The Simple Moving Average (SMA) is calculated by adding the closing prices of a security over a specific number of periods and then dividing the sum by the number of periods.

**Parameters:**
- **Period**: The number of periods to include in the calculation (default: 20)

**Formula:**
```
SMA = (P1 + P2 + ... + Pn) / n
```
Where:
- P1, P2, ..., Pn are the prices of the periods
- n is the number of periods

### Exponential Moving Average (EMA)

The Exponential Moving Average (EMA) gives more weight to recent prices, making it more responsive to new information than the SMA.

**Parameters:**
- **Period**: The number of periods to include in the calculation (default: 21)

**Formula:**
```
EMA = Price(t) * k + EMA(y) * (1 - k)
```
Where:
- Price(t) is the price at time t
- EMA(y) is the EMA of the previous period
- k = 2 / (Period + 1)

### Bollinger Bands

Bollinger Bands consist of a middle band (SMA) with upper and lower bands that are standard deviations away from the middle band.

**Parameters:**
- **Period**: The number of periods for the middle band SMA (default: 20)
- **Standard Deviation**: The number of standard deviations for the upper and lower bands (default: 2)

**Formula:**
```
Middle Band = SMA(Period)
Upper Band = Middle Band + (Standard Deviation * σ)
Lower Band = Middle Band - (Standard Deviation * σ)
```
Where:
- σ is the standard deviation of the closing price over the specified period

### Relative Strength Index (RSI)

The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements on a scale from 0 to 100.

**Parameters:**
- **Period**: The number of periods to include in the calculation (default: 14)

**Formula:**
```
RSI = 100 - (100 / (1 + RS))
RS = Average Gain / Average Loss
```
Where:
- RS is the Relative Strength
- Average Gain is the average of all up moves in the specified period
- Average Loss is the average of all down moves in the specified period

### Moving Average Convergence Divergence (MACD)

The Moving Average Convergence Divergence (MACD) is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price.

**Parameters:**
- **Fast Period**: The period for the fast EMA (default: 12)
- **Slow Period**: The period for the slow EMA (default: 26)
- **Signal Period**: The period for the signal line EMA (default: 9)

**Formula:**
```
MACD Line = EMA(Fast Period) - EMA(Slow Period)
Signal Line = EMA(MACD Line, Signal Period)
Histogram = MACD Line - Signal Line
```

### Stochastic Oscillator

The Stochastic Oscillator is a momentum indicator that compares a particular closing price of a security to a range of its prices over a certain period of time.

**Parameters:**
- **Period**: The number of periods for the %K calculation (default: 14)
- **K Period**: The number of periods for %K smoothing (default: 3)
- **D Period**: The number of periods for %D calculation (default: 3)

**Formula:**
```
%K = 100 * (C - L14) / (H14 - L14)
%D = 3-period SMA of %K
```
Where:
- C is the latest closing price
- L14 is the lowest low of the 14 previous periods
- H14 is the highest high of the 14 previous periods

## Using Indicators in the Application

### Adding Indicators

1. Navigate to the chart view
2. Scroll down to the "Technical Indicators" section
3. Use the dropdown menu to select an indicator to add
4. The indicator will be added to the chart with default parameters

### Customizing Indicators

1. Click the "Edit" button next to an indicator in the "Active Indicators" list
2. Adjust the parameters using the sliders or input fields
3. Click "Save" to apply the changes

### Toggling Indicators

- Use the switch next to each indicator to show or hide it on the chart

### Removing Indicators

- Click the "X" button next to an indicator to remove it from the chart

## Chart Navigation

The application provides several ways to navigate the chart:

### Zoom Controls

- **Zoom In**: Click the "+" button or press the "+" key
- **Zoom Out**: Click the "-" button or press the "-" key
- **Reset Zoom**: Click the reset button or press the "Home" key

### Pan Controls

- **Pan Left**: Click the left arrow button or press the "Left Arrow" key
- **Pan Right**: Click the right arrow button or press the "Right Arrow" key

### Time Range Selection

Use the time range buttons to quickly view specific periods:
- **1D**: Show the last day of data
- **1W**: Show the last week of data
- **1M**: Show the last month of data
- **1Y**: Show the last year of data
- **All**: Show all available data

## Best Practices

### Combining Indicators

Different indicators provide different types of information. Consider using a combination of:
- Trend indicators (e.g., Moving Averages)
- Momentum indicators (e.g., RSI, MACD)
- Volatility indicators (e.g., Bollinger Bands)

### Parameter Optimization

Experiment with different parameter values to find the optimal settings for your trading strategy. The application allows you to easily adjust parameters and see the results in real-time.

### Avoiding Indicator Overload

Using too many indicators can lead to confusion and conflicting signals. Start with a few key indicators and add more only if they provide additional valuable information.
