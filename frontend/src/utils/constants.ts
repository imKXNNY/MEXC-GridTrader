// API base URL
export const API_BASE_URL = 'http://localhost:5000';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT_BY = 'timestamp';
export const DEFAULT_SORT_ORDER = 'desc';

// Chart defaults
export const DEFAULT_CHART_HEIGHT = 400;
export const DEFAULT_CHART_WIDTH = '100%';

// Strategy types
export const STRATEGY_TYPES = {
  MOMENTUM: 'momentum',
  INSIDE_BAR: 'ib_price_action',
  GRID: 'grid'
};

// Timeframes
export const TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' }
];

// Default strategy parameters
export const DEFAULT_MOMENTUM_PARAMS = {
  rsi_length: 14,
  macd_fast: 12,
  macd_slow: 26,
  macd_signal: 9
};

export const DEFAULT_INSIDE_BAR_PARAMS = {
  minInsideBarSize: 0.5,
  useTrendFilter: true,
  useVolumeFilter: true,
  volMultiplier: 1.1,
  useATRTP: true,
  atrLength: 14,
  atrMult: 1.5,
  rr_ratio: 2.5
};

// Theme colors (for charts and UI)
export const THEME_COLORS = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
  background: 'var(--color-background)',
  text: 'var(--color-text)'
};
