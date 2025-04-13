# CHANGELOG - Updated 2025-05-13

## [1.0.0] - 2025-05-13
### Changed
- Rebranded project from "MEXC GridTrader" to "TradeSage"
- Updated all documentation to reflect new project name
- Standardized naming conventions across the codebase
- Improved code organization for better maintainability

## [0.8.0] - 2025-05-13
### Added
- Enhanced technical indicators with multiple options (SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic)
- Zoom and pan functionality for charts with keyboard shortcuts
- Parameter customization for technical indicators
- Improved indicator visualization with separate panes for different indicator types
- Time range selection for quick navigation (1D, 1W, 1M, 1Y, All)

### Changed
- Refactored indicator calculations for better performance and reliability
- Enhanced UI for indicator management with edit and remove buttons
- Improved chart responsiveness and interaction
- Updated documentation to reflect new features

## [0.7.0] - 2025-05-01
### Added
- Strategy optimization with grid search and genetic algorithms
- Pagination and sorting for backtest results
- Backtest management API endpoints (save, archive, delete)
- End-to-end testing with Playwright
- Component testing for React components
- Technical indicators in chart visualization

### Changed
- Improved error handling and loading states
- Enhanced documentation with testing instructions
- Refactored frontend code for better maintainability
- Updated dependencies to latest versions

## [0.6.0] - 2025-04-15
### Added
- Dynamic strategy selection UI with strategy-specific parameters
- Interactive candlestick charts with volume overlay in React frontend
- Backtest management features (saving, notes, archiving, deletion)
- Comprehensive error handling and loading states
- Tooltips for all parameters with explanations

### Changed
- Improved UI organization with better component structure
- Enhanced responsive design across all components
- Updated documentation to reflect new features
- Optimized chart rendering with lightweight-charts library

## [0.5.0] - 2025-03-10
### Added
- Inside Bar Price Action strategy implementation
- Strategy-specific parameter validation
- Enhanced error handling in API calls
- Improved loading states and user feedback

### Changed
- Refactored strategy implementation for better modularity
- Updated UI components for better user experience
- Improved documentation with strategy details

## [0.4.0] - 2025-02-20
### Added
- strategy selection check in backend
- Parameter organization and tooltips in backtest form
- Candlestick charts with volume overlay in basic backtest template
- Enhanced backtest management features (renaming, notes, archiving)
- Improved centralized theme and replaced default components styles with proper UI-kits (MUI + TailwindCSS)
- Improved Responsivness through proper use of central theme and new UI-Kit components

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
