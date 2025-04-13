import { CandleData } from '../types';

/**
 * Calculate Simple Moving Average (SMA)
 * @param data Array of candle data
 * @param period Period for SMA calculation
 * @param valueKey Key to use for calculation (default: 'close')
 * @returns Array of SMA values
 */
export const calculateSMA = (
  data: CandleData[],
  period: number,
  valueKey: 'open' | 'high' | 'low' | 'close' = 'close'
): number[] => {
  const values = data.map(candle => candle[valueKey]);
  const result: number[] = [];

  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }

  return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 * @param data Array of candle data
 * @param period Period for EMA calculation
 * @param valueKey Key to use for calculation (default: 'close')
 * @returns Array of EMA values
 */
export const calculateEMA = (
  data: CandleData[],
  period: number,
  valueKey: 'open' | 'high' | 'low' | 'close' = 'close'
): number[] => {
  const values = data.map(candle => candle[valueKey]);
  const result: number[] = [];

  // Calculate multiplier
  const multiplier = 2 / (period + 1);

  // Calculate first EMA using SMA
  const sma = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(sma);

  // Calculate subsequent EMAs
  for (let i = period; i < values.length; i++) {
    const ema = (values[i] - result[result.length - 1]) * multiplier + result[result.length - 1];
    result.push(ema);
  }

  return result;
};

/**
 * Calculate Relative Strength Index (RSI)
 * @param data Array of candle data
 * @param period Period for RSI calculation
 * @param valueKey Key to use for calculation (default: 'close')
 * @returns Array of RSI values
 */
export const calculateRSI = (
  data: CandleData[],
  period: number,
  valueKey: 'open' | 'high' | 'low' | 'close' = 'close'
): number[] => {
  const values = data.map(candle => candle[valueKey]);
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate first average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate first RSI
  let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
  result.push(100 - (100 / (1 + rs)));

  // Calculate subsequent RSIs
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    result.push(100 - (100 / (1 + rs)));
  }

  return result;
};

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param data Array of candle data
 * @param fastPeriod Fast period for MACD calculation
 * @param slowPeriod Slow period for MACD calculation
 * @param signalPeriod Signal period for MACD calculation
 * @param valueKey Key to use for calculation (default: 'close')
 * @returns Object with MACD, signal, and histogram values
 */
export const calculateMACD = (
  data: CandleData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
  valueKey: 'open' | 'high' | 'low' | 'close' = 'close'
): { macd: number[], signal: number[], histogram: number[] } => {
  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriod, valueKey);
  const slowEMA = calculateEMA(data, slowPeriod, valueKey);

  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: number[] = [];
  const offset = slowPeriod - fastPeriod;

  for (let i = 0; i < fastEMA.length; i++) {
    if (i + offset < slowEMA.length) {
      macdLine.push(fastEMA[i + offset] - slowEMA[i]);
    }
  }

  // Calculate signal line (EMA of MACD line)
  const signalLine: number[] = [];
  const multiplier = 2 / (signalPeriod + 1);

  // Calculate first signal using SMA
  const sma = macdLine.slice(0, signalPeriod).reduce((a, b) => a + b, 0) / signalPeriod;
  signalLine.push(sma);

  // Calculate subsequent signals
  for (let i = signalPeriod; i < macdLine.length; i++) {
    const signal = (macdLine[i] - signalLine[signalLine.length - 1]) * multiplier + signalLine[signalLine.length - 1];
    signalLine.push(signal);
  }

  // Calculate histogram (MACD line - signal line)
  const histogram: number[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + signalPeriod - 1] - signalLine[i]);
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
};

/**
 * Calculate Bollinger Bands
 * @param data Array of candle data
 * @param period Period for Bollinger Bands calculation
 * @param stdDev Standard deviation multiplier
 * @param valueKey Key to use for calculation (default: 'close')
 * @returns Object with upper, middle, and lower band values
 */
export const calculateBollingerBands = (
  data: CandleData[],
  period: number = 20,
  stdDev: number = 2,
  valueKey: 'open' | 'high' | 'low' | 'close' = 'close'
): { upper: number[], middle: number[], lower: number[] } => {
  const values = data.map(candle => candle[valueKey]);
  const middle: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;

    // Calculate standard deviation
    const squaredDiffs = slice.map(value => Math.pow(value - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const sd = Math.sqrt(variance);

    middle.push(avg);
    upper.push(avg + (stdDev * sd));
    lower.push(avg - (stdDev * sd));
  }

  return { upper, middle, lower };
};

/**
 * Calculate Stochastic Oscillator
 * @param data Array of candle data
 * @param period Period for Stochastic calculation
 * @param kPeriod K period for Stochastic calculation
 * @param dPeriod D period for Stochastic calculation
 * @returns Object with k and d values
 */
export const calculateStochastic = (
  data: CandleData[],
  period: number = 14,
  kPeriod: number = 3,
  dPeriod: number = 3
): { k: number[], d: number[] } => {
  const highValues = data.map(candle => candle.high);
  const lowValues = data.map(candle => candle.low);
  const closeValues = data.map(candle => candle.close);

  const kValues: number[] = [];

  // Calculate %K values
  for (let i = period - 1; i < closeValues.length; i++) {
    const highestHigh = Math.max(...highValues.slice(i - period + 1, i + 1));
    const lowestLow = Math.min(...lowValues.slice(i - period + 1, i + 1));
    const currentClose = closeValues[i];

    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(k);
  }

  // Calculate %K smoothed (if kPeriod > 1)
  const kSmoothed: number[] = [];
  if (kPeriod > 1) {
    for (let i = kPeriod - 1; i < kValues.length; i++) {
      const avg = kValues.slice(i - kPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / kPeriod;
      kSmoothed.push(avg);
    }
  } else {
    kSmoothed.push(...kValues);
  }

  // Calculate %D (SMA of %K)
  const dValues: number[] = [];
  for (let i = dPeriod - 1; i < kSmoothed.length; i++) {
    const avg = kSmoothed.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / dPeriod;
    dValues.push(avg);
  }

  return {
    k: kSmoothed,
    d: dValues
  };
};
