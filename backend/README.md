# TradeSage - Backend

## Overview
The backend is a Flask-based Python application that provides the core functionality for TradeSage. It includes backtesting capabilities, trading strategy implementations, and integration with cryptocurrency exchange APIs.

## Key Features
- **Backtesting Framework**: Simulate trading strategies on historical data
- **Trading Strategies**:
  - MomentumTrendStrategy
  - BoxMacdRsiStrategy
- **API Integration**: Connect with cryptocurrency exchanges
- **Visualization**: Plotly-based charting of trading results
- **Configuration**: Environment variables for easy setup

## Installation
1. Install Poetry (if not already installed):
   ```bash
   pip install poetry
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create and activate the virtual environment:
   ```bash
   poetry env use python3.12
   poetry shell
   ```

4. Install dependencies:
   ```bash
   poetry install
   ```

## Configuration
Create a `.env` file in the backend directory with the following variables:
```
EXCHANGE_API_KEY=your_api_key
EXCHANGE_API_SECRET=your_api_secret
FLASK_DEBUG=True
LOG_LEVEL=INFO
RESULTS_DIR=results
```

## Running the Application
### Local Development
```bash
poetry run python app.py
```

### Docker
```bash
docker build -t tradesage-backend .
docker run -p 5000:5000 tradesage-backend
```

## API Documentation
The backend provides the following endpoints:
- `/`: Main dashboard
- `/view/<timestamp>`: View specific backtest results
- `/account_info`: Get exchange account information
- `/docs`: View project documentation

## Contributing
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License
MIT License
