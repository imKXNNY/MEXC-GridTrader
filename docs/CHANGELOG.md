# CHANGELOG

All notable changes to this project will be documented in this file.

## [0.3.0] - 2025-02-15
### Added
- Simplified results storage to only track initial and final equity values
- Enhanced trade orders visualization with improved clarity

### Changed
- Removed equity curve tracking to focus on core trading metrics
- Updated result detail page to show only trade orders chart
- Simplified metrics calculation to not depend on equity curve data

## [0.2.0] - 2025-02-01
### Added
- Stored candle data in each simulation’s JSON so results are fully self-contained.
- Display of price line + buy/sell markers on the result detail page.
- CSV caching for OHLCV data to improve performance and reduce API calls.

### Changed

- Refactored `BaseDataHandler` to handle incremental fetch & merging.
- Integrated Backtrader framework for backtesting logic instead of custom code.
- Updated GridBacktester to utilize Backtrader's Cerebro engine.
- Adjusted results storage to accommodate the new output format from Backtrader.
- Modified metrics calculation to work with the new results structure.

### Fixed
- Chart issues where orders didn’t show if no trades were triggered.
