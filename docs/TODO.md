# TODO & Future Enhancements

## 1. Strategy & Features

- **Dynamic Parameters**  
  - [ ] Add volatility-based grid spacing (e.g. using ATR or standard deviation).  
  - [ ] Implement adaptive pivot logic (e.g. moving average or local min/max).  

- **Risk Management**  
  - [ ] Configure stop-loss or trailing stop features for open positions.  
  - [ ] Introduce position sizing rules based on volatility or maximum risk per trade.  
  - [ ] Add a maximum drawdown limit or circuit-breaker during backtests.  

- **Advanced Analytics**  
  - [ ] Expand performance metrics (e.g., daily PnL, monthly breakdown, MAR ratio, sortino ratio).  
  - [ ] Show advanced charts (like candlestick view or volume overlays).  
  - [ ] Compare results across multiple parameter sets in a single UI.  

## 2. Front-End & User Experience

### **2.1 Core UI/UX Enhancements**
- **Modern Layout & Theming**  
  - [ ] Adopt a more comprehensive UI kit (e.g. Tailwind components, Bootstrap, Material, etc.).  
  - [ ] Use a consistent color scheme and typography that reflects a “trading/analytical” vibe.  
  - [ ] Break the single-page forms into multiple sections or a wizard if there are many parameters.

- **Responsive & Mobile-Friendly**  
  - [ ] Verify that all pages scale gracefully on various screen sizes (phones, tablets, desktop).  
  - [ ] Add responsive navigation (hamburger menu, collapsible sidebars) if needed.

### **2.2 Backtest Management**
- **Renaming & Notes**  
  - [ ] Let users give each simulation/backtest a **custom name** or add a **description** (e.g. “HighVolTest_2025”).  
  - [ ] Provide a note-taking field for specific remarks about conditions, observations, or results.

- **Deletion & Archiving**  
  - [ ] Implement a **delete** button next to each backtest in the results list, with a confirmation prompt.  
  - [ ] Optionally allow **archiving** older results instead of permanent deletion, so they’re hidden but not lost.

- **Search & Filtering**  
  - [ ] Extend the search bar (currently by symbol) to filter by date range, interval, or profit range.  
  - [ ] Add an advanced filter form or sorting by profit, drawdown, or number of trades.

### **2.3 Enhanced Backtest Form**
- **Parameter Organization**  
  - [ ] Group grid-related inputs (levels, percent_range) together.  
  - [ ] Group capital-related inputs (initial_capital, order_size) together.  
  - [ ] Possibly add dynamic tooltips explaining each parameter or a help icon (“?”).

- **Validation & Feedback**  
  - [ ] Perform **client-side** checks (e.g., no negative capital) before submitting.  
  - [ ] Show **inline error messages** if a field is left empty or out of range.  
  - [ ] Show a **progress/loading indicator** while data is fetched or the backtest is running (so the user knows the app is working).

- **Parameter Presets**  
  - [ ] Let users save and load **common parameter sets** (e.g. “ShortTerm_Grid5%”, “LongTerm_Grid10%”).  
  - [ ] Provide a dropdown of recommended intervals or popular symbols.

### **2.4 Results Viewing**
- **Pagination & Sorting**  
  - [ ] Allow user to choose how many backtests per page (10, 25, 50).  
  - [ ] Sort results by date, profit, trades, or symbol with a simple click on column headers.

- **Comparison Mode**  
  - [ ] Let users select multiple backtests and **compare** equity curves or performance metrics side by side.  
  - [ ] Provide a multi-chart display or a single chart overlay for direct visual comparison.

### **2.5 Data Visualization**
- **Candlestick Charts**  
  - [ ] Replace the simple line chart with a Plotly candlestick chart for daily/hourly bars.  
  - [ ] Add volume bars or overlays to show trading volume on the same chart.

- **Customizable Chart Options**  
  - [ ] Include toggleable overlays (e.g., show/hide trades, show/hide moving averages).  
  - [ ] Provide a date range slider or “zoom” functionality for large data sets.  

- **Metric Drill-Down**  
  - [ ] Show per-candle or per-trade details on hover (like a mini tooltip with trade ID, PnL, etc.).  
  - [ ] Plot equity curve **alongside** the price chart for a single timeline comparison.

### **2.6 Overall Polish**
- **User Onboarding**  
  - [ ] Add a short guide or “Getting Started” modal for newcomers.  
  - [ ] Provide example inputs and default symbols (e.g., BTC/USDT, ETH/USDT).

- **Session & State Management**  
  - [ ] If running multiple backtests in one session, store partial states so user can pick up where they left off.  
  - [ ] Possibly use local storage or a small server-side session store for convenience.

- **Performance Optimization**  
  - [ ] Lazy-load or asynchronously fetch large data sets (only load the chart data when user opens the detail view).  
  - [ ] Cache certain UI elements or chart states if the user navigates back and forth frequently.

## 3. Code Quality & Testing

- **Unit Testing & TDD**  
  - [ ] Write unit tests for `dynamic_grid_strategy` (checking buy/sell logic).  
  - [ ] Add tests for the CSV caching in `BaseDataHandler` (especially incremental fetch logic).  
  - [ ] Integrate a test framework (pytest) and aim for code coverage on key modules.  

- **Optimization**  
  - [ ] Implement parameter sweeps or grid search to find best `(percent_range, grid_levels, order_size, etc.)`.  
  - [ ] Save multiple simulation results in one batch run for easy cross-comparison.

## 4. Paper Trading & Live Integration

- **Paper Trading**  
  - [ ] Hook into a MEXC paper trading environment (if available) or a simulation environment.  
  - [ ] Reuse the same logic but place test orders on an exchange “sandbox.”  

- **Live Trading**  
  - [ ] Use official MEXC SDK or ccxt to place real orders.  
  - [ ] Ensure robust error handling, connectivity checks, and API key encryption.  

## 5. Deployment & Maintenance

- **Deployment**  
  - [ ] Containerize app via Docker for consistent environment.  
  - [ ] Possibly host on a small VM or PaaS solution with secure API key management.  

- **Ongoing Maintenance**  
  - [ ] Implement logs & alerts for real-time monitoring (Slack/Telegram notifications).  
  - [ ] Maintain a backlog of feature requests, bug fixes, and performance improvements.  