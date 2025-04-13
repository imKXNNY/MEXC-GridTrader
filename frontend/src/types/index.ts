// Candle data structure
export interface CandleData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Trade order structure
export interface TradeOrder {
  time: string;
  price: number;
  type: string;
}

// Technical indicator options
export interface IndicatorOptions {
  enabled: boolean;
  type: IndicatorType;
  params: Record<string, number>;
  color: string;
}

// Available indicator types
export enum IndicatorType {
  SMA = 'sma',
  EMA = 'ema',
  RSI = 'rsi',
  MACD = 'macd',
  BOLLINGER_BANDS = 'bollinger',
  STOCHASTIC_RSI = 'stochastic'
}

// Backtest parameters
export interface BacktestParams {
  symbol: string;
  interval: string;
  initial_capital: number;
  risk_percent: number;
  strategy_type: string;
  strategy_params: Record<string, any>;
  start_date?: string;
  end_date?: string;
}

// Backtest result
export interface BacktestResult {
  timestamp: string;
  name: string;
  notes: string;
  params: {
    symbol: string;
    interval: string;
    initial_capital: number;
    risk_percent: number;
    strategy_type: string;
    [key: string]: any;
  };
  orders: Array<{
    time: string;
    type: string;
    price: number;
    size: number;
    profit: number;
  }>;
  final_value: number;
  equity: {
    initial: number;
    final: number;
  };
  metrics: {
    total_profit: number;
    win_rate: number;
    max_drawdown: number;
    sharpe_ratio: number;
    total_trades: number;
    [key: string]: any;
  };
  candles?: CandleData[];
  archived: boolean;
}
