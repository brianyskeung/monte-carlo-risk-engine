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
        raise ValueError(
            f"No market data found for ticker(s): {', '.join(tickers)}"
        )

    # extract Adjusted Close prices
    if len(tickers) == 1:
        prices = data[["Close"]].copy()
        prices.columns = tickers
    else:
        prices = data["Close"]

    missing_tickers = [ticker for ticker in tickers if ticker not in prices.columns]
    if missing_tickers:
        raise ValueError(
            f"Unknown or unavailable ticker(s): {', '.join(missing_tickers)}"
        )

    unavailable_tickers = [
        ticker for ticker in tickers if prices[ticker].dropna().empty
    ]
    if unavailable_tickers:
        raise ValueError(
            f"Unknown or unavailable ticker(s): {', '.join(unavailable_tickers)}"
        )

    # sort columns into the order of the requested tickers
    prices = prices[tickers]

    # calculate daily percentage returns and drop the first row
    daily_returns = prices.pct_change().dropna()

    if daily_returns.empty:
        raise ValueError("No overlapping historical data found for the selected tickers.")

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
                "industry": info.get("industry"),
                "sector": info.get("sector"),
                "exchange": info.get("exchange"),
                "currency": info.get("currency"),
                "is_valid": bool(quote_type),
            }
        except Exception:
            assets[ticker] = {
                "symbol": ticker,
                "short_name": None,
                "quote_type": "UNKNOWN",
                "industry": None,
                "sector": None,
                "exchange": None,
                "currency": None,
                "is_valid": False,
            }

    return assets
