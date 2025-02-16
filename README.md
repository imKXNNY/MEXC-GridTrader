<!-- HEADER SECTION -->
<div align="center">

  <!-- LOGO (adjust width as needed) -->
  <img src="assets/logo.webp" alt="Logo" width="120" style="margin-bottom: 20px;" />

  <!-- PROJECT TITLE -->
  <h1>MEXC GridTrader 🚀</h1>

  <!-- BADGES -->
  <!-- You can comment those in when repo goes public, right now they are just placeholders and wont link anywhere -->
  
  <!-- <p>
    <a href="https://github.com/imKXNNY/MEXC-GridTrader">
      <img alt="GitHub stars" src="https://img.shields.io/github/stars/YourUser/mexc-gridtrader.svg?style=social" />
    </a>
    <a href="https://github.com/imKXNNY/MEXC-GridTrader/issues">
      <img alt="GitHub issues" src="https://img.shields.io/github/issues/YourUser/mexc-gridtrader.svg" />
    </a>
    <a href="LICENSE">
      <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
    </a>
    <img alt="Python 3.8+" src="https://img.shields.io/badge/Python-3.8%2B-blue.svg" />
  </p> -->

  <!-- BANNER (optional) -->
  <!-- PROJECT DESCRIPTION -->
  <p>
    <strong>MEXC GridTrader</strong> is an algorithmic trading bot for <strong>dynamic grid trading</strong> on <strong>MEXC Exchange</strong>, featuring <strong>backtesting</strong>, <strong>performance analysis</strong>, and (soon) <strong>live trading</strong>. It includes <strong>historical data caching</strong>, <strong>trade simulations</strong>, and an interactive <strong>web interface</strong> for running and reviewing backtests.
  </p>

  <!-- You could also set width="75%" or any suitable size -->
  <img src="assets/banner.webp" alt="Banner" width="800" style="margin-top: 20px;" />

</div>
<!-- END HEADER SECTION -->

### **🚧 Work in Progress! 🚧**
**This is an actively developed project aimed at improving automated grid trading strategies with scalable, flexible, and user-friendly functionality.**

## Key Features
- **Backtesting Framework** – Quickly simulate grid strategies on historical data, with equity curve tracking and trade logs.  
- **Interactive Charts** – View price movements, equity curves, and trade executions via an intuitive web UI.  
- **Trade Analysis** – Automatic calculation of performance metrics (profit, drawdown, Sharpe, etc.).  
- **OHLCV Data Caching** – Efficiently fetch and store candle data, reducing API usage.  
- **Dynamic Grid Adjustments** – Automatically adjusts grid spacing based on market volatility using ATR and standard deviation.
- **Adaptive Pivot Logic** – Uses moving averages to dynamically adjust pivot points for grid levels.
- **Advanced Risk Management** – Includes stop-loss, trailing stops, and position sizing based on volatility.


## Roadmap
![Mermaid Gantt Chart](assets/ROADMAP-MERMAID-1.png)

### Current Phase: Backtesting Framework Development
- Historical Data Acquisition
- Simulation Engine

### Next Phase: Paper Trading Mode
- Sandbox Environment
- Integration Testing

For more details, see the [Project Roadmap](docs/ROADMAP.md)


## Recent Enhancements
- **Improved Error Handling & Logging** – Better debugging and analysis.  
- **Enhanced UI** – Modern interface with dynamic parameter controls and real-time feedback.
- **Search & Filtering** – Advanced filtering by date range, profit, and volatility metrics.
- **Parameter Presets** – Save and load common parameter sets for quick backtesting.


**[CHANGELOG](docs/CHANGELOG.md)** – Check the changelog for recent improvements and bug fixes.

## Future Work
- **Parameter Optimization** – Automated grid search for optimal parameter combinations.
- **Enhanced Analytics** – Expanded performance metrics including volatility-adjusted returns.
- **Paper & Live Trading** – Connect to MEXC’s paper/real environment for real-time operations.


**[TODO](docs/TODO.md)** – Check the TODO list for upcoming tasks and features.

---

## Getting Started

1. **Clone the Repo**  
   ```bash
   git clone https://github.com/YourUsername/mexc-gridtrader.git
   cd mexc-gridtrader
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
   - Create a `.env` file (copy from `.env.example`) and fill in your MEXC API keys.  
   - Check or adjust settings (like `FLASK_DEBUG` or `LOG_LEVEL`) to your preference.

5. **Run with Docker Compose** *(recommended)*
   ```bash
   docker-compose up --build
   ```
   Access the app at:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

6. **Run Locally** *(alternative)*
   ```bash
   # Backend
   cd backend
   poetry run python app.py

   # Frontend (in separate terminal)
   cd frontend
   npm install
   npm run dev
   ```

The application will be available at:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000


## Contributing
We welcome contributions via Pull Requests. Please open an Issue first to discuss changes or features.

---

**MEXC GridTrader** is actively maintained and evolving; stay tuned for further updates, and feel free to submit feature requests or bug reports!

### Development Setup

1. **Install Pre-commit Hooks**
   ```bash
   pre-commit install
   ```

2. **Running Tests**
   ```bash
   poetry run pytest
   ```

3. **Building for Production**
   ```bash
   # Backend
   poetry build

   # Frontend
   cd frontend
   npm run build
   ```

 
<p align="center">
  <a href="https://github.com/imKXNNY">
    <img src="https://img.shields.io/badge/Author-imKXNNY-blueviolet?style=for-the-badge&logo=github" />
  </a>
  <p align="center">Happy Trading!</p>
</p>
