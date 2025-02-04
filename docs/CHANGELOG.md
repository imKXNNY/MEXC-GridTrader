# CHANGELOG

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-XX-XX
### Added
- Stored candle data in each simulation’s JSON so results are fully self-contained.
- Display of price line + buy/sell markers on the result detail page.
- CSV caching for OHLCV data to improve performance and reduce API calls.

### Changed
- Updated the UI to show both the equity curve and the price/orders chart.
- Refactored `BaseDataHandler` to handle incremental fetch & merging.

### Fixed
- Chart issues where orders didn’t show if no trades were triggered.

## [0.1.0] - 2025-XX-XX
### Added
- Initial dynamic grid strategy (`dynamic_grid_strategy.py`).
- Basic Flask UI (`index.html` / `results.html` / `result_detail.html`).
- CCXT-based data fetching and MEXC integration skeleton.
- JSON result saving, listing, and detail page for backtest results.

