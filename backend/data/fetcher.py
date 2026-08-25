import yfinance as yf
import pandas as pd


def get_historical_returns(tickers: list[str], period: str = "5y") -> pd.DataFrame:
    """
    Downloads historical data and returns a DataFrame of daily percentage changes.
    """
    print(f"Fetching {period} of data for {tickers}...")

    # download data (auto_adjust is True by default)
    data = yf.download(tickers, period=period, progress=False, auto_adjust=True)

    # safety check if the download fails
    if data.empty:
        raise ValueError("Failed to download market data.")

    # extract Adjusted Close prices
    if len(tickers) == 1:
        prices = data[["Close"]].copy()
        prices.columns = tickers
    else:
        prices = data["Close"]

    # sort columns into the order of the requested tickers
    prices = prices[tickers]

    # calculate daily percentage returns and drop the first row
    daily_returns = prices.pct_change().dropna()

    return daily_returns


def get_asset_info(tickers: list[str]) -> dict[str, dict]:
    assets = {}

    for raw_ticker in tickers:
        ticker = raw_ticker.strip().upper()

        try:
            info = yf.Ticker(ticker).info
            quote_type = info.get("quoteType")

            if quote_type == "EQUITY":
                quote_type = "STOCK"

            assets[ticker] = {
                "symbol": ticker,
                "short_name": info.get("shortName"),
                "quote_type": quote_type or "UNKNOWN",
                "exchange": info.get("exchange"),
                "currency": info.get("currency"),
                "is_valid": bool(quote_type),
            }
        except Exception:
            assets[ticker] = {
                "symbol": ticker,
                "short_name": None,
                "quote_type": "UNKNOWN",
                "exchange": None,
                "currency": None,
                "is_valid": False,
            }

    return assets
