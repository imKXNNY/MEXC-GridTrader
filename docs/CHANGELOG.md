# CHANGELOG - Updated 2025-02-20

## [0.4.0] - 2025-02-20
### Added
- strategy selection check in backend
- Parameter organization and tooltips in backtest form
- Candlestick charts with volume overlay in basic backtest template
- Enhanced backtest management features (renaming, notes, archiving)

### Changed
- Improved UI consistency across all components
- Optimized chart rendering performance
- Enhanced error handling in API calls
- Updated documentation to reflect new features

## [0.3.1] - 2025-02-16
### Added
- Project structure refactor with backend/frontend separation
- Poetry dependency management implementation
- Docker containerization for both backend and frontend
- Vite + React + TypeScript + SWC frontend bone-setup
- Docker Compose orchestration configuration
- New momentum trend-following strategy implementation

### Changed
- Moved Flask backend to dedicated backend directory
- Updated import paths to reflect new structure
- Migrated from requirements.txt to Poetry pyproject.toml
- Updated documentation to reflect new project structure
- Modified backtester to support both momentum and grid strategies

## [0.3.0] - 2025-02-15
### Added
- Simplified results storage to only track initial and final equity values
- Enhanced trade orders visualization with improved clarity
- Added delete functionality for individual and all results
- Implemented confirmation prompts for deletions
- Added architectural planning for frontend improvements

### Changed
- Removed equity curve tracking to focus on core trading metrics
- Updated result detail page to show only trade orders chart
- Simplified metrics calculation to not depend on equity curve data
- Updated documentation to reflect architectural decisions

## [0.2.0] - 2025-02-01
### Added
- Stored candle data in each simulation's JSON so results are fully self-contained
- Display of price line + buy/sell markers on the result detail page
- CSV caching for OHLCV data to improve performance and reduce API calls

### Changed
- Refactored BaseDataHandler to handle incremental fetch & merging
- Integrated Backtrader framework for backtesting logic instead of custom code
- Updated GridBacktester to utilize Backtrader's Cerebro engine
- Adjusted results storage to accommodate the new output format from Backtrader
- Modified metrics calculation to work with the new results structure

### Fixed
- Chart issues where orders didn't show if no trades were triggered
