# TradeSage: TODO & Future Enhancements - Updated 2025-05-13

## 1. Strategy & Features

- **Dynamic Strategy Selection**
  - [x] Implement strategy selection UI component
  - [x] Create strategy-specific parameter inputs
  - [x] Add strategy validation and configuration
  - [x] Enable switching between different trading strategies
    - [x] Variant 1: Hardcoded if-checks (Fast&Easy, but requires readjustment on strategy change)
    - [x] Variant 2: Dynamic Selection/Switching (More flexible, but requires more setup time)

- **Dynamic Parameters**
  - [x] Add volatility-based grid spacing (e.g. using ATR or standard deviation).
  - [x] Implement adaptive pivot logic (e.g. moving average or local min/max).

- **Risk Management**
  - [x] Configure stop-loss or trailing stop features for open positions.
  - [x] Introduce position sizing rules based on volatility or maximum risk per trade.
  - [ ] Add a maximum drawdown limit or circuit-breaker during backtests.

- **Advanced Analytics**
  - [x] Basic performance metrics implemented (total profit, win rate, max drawdown, etc.)
  - [x] Trade execution visualization implemented
  - [ ] Expand metrics with daily PnL, monthly breakdown, MAR ratio, sortino ratio
  - [ ] Compare results across multiple parameter sets in a single UI

## 2. Frontend Architecture
  - [x] Document frontend architecture options
  - [x] Implement React frontend with Flask backend
  - [x] Maintain modular architecture for future flexibility

## 3. Front-End & User Experience

### **Core UI/UX Enhancements**
- **Modern Layout & Theming**
  - [x] Adopt and integrate more comprehensive UI kit (e.g. Tailwind components, Bootstrap, Material, etc.).
  - [x] Use a consistent color scheme and typography that reflects a "trading/analytical" vibe.
  - [x] Create, enhance & utilize centralized theming for styling of components and pages.
  - [ ] Break the single-page forms into multiple sections or a wizard if there are many parameters.

- **Responsive & Mobile-Friendly**
  - [x] Verify that all pages scale gracefully on various screen sizes (phones, tablets, desktop).
  - [ ] Add responsive navigation (hamburger menu, collapsible sidebars) if needed.

### **Backtest Management**
- **Renaming & Notes**
  - [x] Let users give each simulation/backtest a custom name or add a description
  - [x] Provide a note-taking field for specific remarks about conditions, observations, or results.

- **Deletion & Archiving**
  - [x] Implement a delete button next to each backtest in the results list, with a confirmation prompt.
    - [x] in Backend - Basic Template
    - [x] in React Frontend
  - [x] Optionally allow archiving older results instead of permanent deletion

### **Enhanced Backtest Form**
- **Parameter Organization**
  - [x] Group grid-related inputs together
  - [x] Group capital-related inputs together
  - [x] Add dynamic tooltips explaining each parameter

### **Results Viewing**
- **Pagination & Sorting**
  - [x] Allow user to choose how many backtests per page
  - [x] Sort results by date, profit, trades, or symbol

### **Data Visualization**
- **Candlestick Charts**
  - [x] Replace the simple line chart with a Plotly candlestick chart
    - [x] in Backend - Basic Template
    - [x] in React Frontend
  - [x] Add volume bars or overlays to show trading volume
  - [x] Add more technical indicators (RSI, MACD, etc.)
  - [x] Implement zoom and pan functionality
  - [x] Add parameter customization for indicators

## 4. Code Quality & Testing

- **Unit Testing & TDD**
  - [ ] Write unit tests for trading strategies
  - [ ] Add tests for data handling
  - [ ] Integrate test framework (pytest)

## 5. Paper Trading & Live Integration

- **Paper Trading**
  - [ ] Hook into exchange paper trading environments
  - [ ] Reuse the same logic but place test orders on an exchange "sandbox"
  - [ ] Implement real-time tracking of paper trades
  - [ ] Add performance comparison between backtest and paper trading

- **Live Trading**
  - [ ] Use ccxt to place real orders on supported exchanges
  - [ ] Ensure robust error handling, connectivity checks, and API key encryption.

## 6. Deployment & Maintenance

- **Deployment**
  - [x] Containerize app via Docker for consistent environment.
  - [ ] Possibly host on a small VM or PaaS solution with secure API key management.

## 7. System Architecture & Performance

- **Decoupled Trading Engine**
  - [ ] Refactor trading signal and calculation logic to run in a separate thread/process
  - [ ] Ensure asynchronous communication between frontend and trading engine

- **Testing Framework**
  - [x] Implement end-to-end testing with Playwright
  - [x] Add component testing for React components
  - [x] Enhance backend unit tests with pytest
  - [ ] Add integration tests for API endpoints
  - [ ] Implement continuous integration with GitHub Actions
  - [ ] Add test coverage reporting

## 8. Advanced Features

- **Strategy Optimization**
  - [x] Implement parameter optimization using grid search or genetic algorithms
  - [x] Add visualization of optimization results
  - [x] Allow saving and comparing multiple optimization runs
  - [ ] Add more optimization algorithms (e.g., Bayesian optimization)
  - [ ] Implement parallel processing for faster optimization

- **Portfolio Management**
  - [ ] Support for multi-asset backtesting
  - [ ] Portfolio-level risk management
  - [ ] Correlation analysis between assets

- **Advanced Analytics**
  - [ ] Implement Monte Carlo simulations for risk assessment
  - [ ] Add custom performance metrics (Calmar ratio, Omega ratio, etc.)
  - [ ] Generate detailed PDF reports for backtests
