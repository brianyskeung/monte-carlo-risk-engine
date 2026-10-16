"""Market data access, re-exported so callers can import from `data`."""

from data.fetcher import get_asset_info, get_historical_returns, search_tickers

__all__ = ["get_asset_info", "get_historical_returns", "search_tickers"]