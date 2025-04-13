<!-- HEADER SECTION -->
<div align="center">

  <!-- LOGO -->
  <img src="assets/logo.webp" alt="Logo" width="120" style="margin-bottom: 20px;" />

  <!-- PROJECT TITLE -->
  <h1>TradeSage 📊</h1>

  <!-- PROJECT DESCRIPTION -->
  <p>
    <strong>TradeSage</strong> is an advanced crypto trading platform featuring <strong>multiple trading strategies</strong>, <strong>comprehensive backtesting</strong>, <strong>performance analysis</strong>, and <strong>strategy optimization</strong>. It includes <strong>technical indicators</strong>, <strong>historical data caching</strong>, <strong>trade simulations</strong>, and an interactive <strong>web interface</strong> for running and reviewing backtests.
  </p>

  <img src="assets/banner.webp" alt="Banner" width="800" style="margin-top: 20px;" />

</div>

## Current Status
**Version 1.0.0** - TradeSage has evolved from a simple grid trading bot to a comprehensive trading platform. The system is stable and feature-rich, with integrated live data capabilities via WebSocket, dynamic strategy selection, interactive candlestick charts with technical indicators, backtest management features, strategy optimization capabilities, and enhanced chart visualization with zoom/pan functionality.


## Key Features
- **Backtesting Framework** - Simulate multiple trading strategies on historical data with detailed trade logs
- **Interactive Charts** - View price movements and trade executions with interactive candlestick charts and volume overlay
- **Technical Indicators** - Visualize SMA, EMA, RSI, MACD, Bollinger Bands, and Stochastic with customizable parameters
- **Chart Navigation** - Zoom and pan functionality with keyboard shortcuts and time range selection
- **Trade Analysis** - Automatic calculation of performance metrics (profit, drawdown, Sharpe ratio)
- **OHLCV Data Caching** - Efficiently fetch and store candle data, reducing API usage
- **Dynamic Strategy Selection** - Choose between grid, momentum, and inside bar price action strategies with strategy-specific parameters
- **Backtest Management** - Save, archive, and delete backtests with custom names and notes
- **Strategy Optimization** - Optimize strategy parameters using grid search or genetic algorithms
- **Pagination and Sorting** - Efficiently browse and sort backtest results
- **Responsive Design** - Optimized for desktop and mobile devices
- **Containerized Deployment** - Easy setup with Docker and Docker Compose
- **Comprehensive Testing** - End-to-end testing with Playwright and unit testing with pytest

## Recent Enhancements
- Enhanced technical indicators with multiple options (SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic)
- Added zoom and pan functionality for charts with keyboard shortcuts
- Implemented parameter customization for technical indicators
- Improved indicator visualization with separate panes for different indicator types
- Added time range selection for quick navigation (1D, 1W, 1M, 1Y, All)
- Implemented strategy optimization with grid search and genetic algorithms
- Added pagination and sorting for backtest results
- Implemented backtest management API endpoints
- Added end-to-end testing with Playwright
- Improved error handling and loading states

## Getting Started with Live Data


1. **Clone the Repo**
   ```bash
   git clone https://github.com/imKXNNY/TradeSage.git
   cd TradeSage
   ```

2. **Install Poetry** *(dependency management)*
   ```bash
   pip install poetry
   ```

3. **Install Dependencies**
   ```bash
   poetry install
   ```

4. **Configure Environment**
   - Create a `.env` file (copy from `.env.example`) and fill in your exchange API keys.
   - Check or adjust settings (like `FLASK_DEBUG` or `LOG_LEVEL`) to your preference.

5. **Run with Docker Compose** *(recommended)*
   - Ensure you have the necessary WebSocket library installed (e.g., `websocket-client`).
   ```bash
   docker-compose up --build
   ```
   Access the app at:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## Development Roadmap
![Roadmap Visual](assets/ROADMAP-MERMAID-1.png)

For detailed information about our development plans and progress, see the [Project Roadmap](docs/ROADMAP.md)

## Current Tasks and Todos
For a comprehensive list of tasks and todos, see the [Project Tasks](docs/TODO.md)

## Technical Indicators
For detailed information about the available technical indicators and how to use them, see the [Technical Indicators Documentation](docs/INDICATORS.md)

## Changelog
For a detailed history of changes, see the [Changelog](docs/CHANGELOG.md)

## Contributing
We welcome contributions via Pull Requests. Please open an Issue first to discuss changes or features.

---

**TradeSage** is actively maintained and evolving. Stay tuned for further updates, and feel free to submit feature requests or bug reports!

<p align="center">
  <a href="https://github.com/imKXNNY">
    <img src="https://img.shields.io/badge/Author-imKXNNY-blueviolet?style=for-the-badge&logo=github" />
  </a>
  <p align="center">Happy Trading!</p>
</p>
