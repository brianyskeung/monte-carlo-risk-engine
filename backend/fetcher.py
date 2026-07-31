import yfinance as yf
import pandas as pd

def get_historical_returns(tickers: list[str], period: str = "5y") -> pd.DataFrame:
    """
    Downloads historical data and returns a DataFrame of daily percentage changes.
    """

    print(f"Fetching {period} of data for {tickers}...")
    
    # download data 
    data = yf.download(tickers, period=period, progress=False)
    
    # extract Adjusted Close prices 
    if len(tickers) == 1:
        adj_close = data[['Adj Close']].copy()
        adj_close.columns = tickers
    else:
        adj_close = data['Adj Close']
        
    # sort columns into the order of the requested tickers
    adj_close = adj_close[tickers]
    
    # calculate daily percentage returns and drop the first row (as no previous data availble)
    daily_returns = adj_close.pct_change().dropna()
    
    return daily_returns
