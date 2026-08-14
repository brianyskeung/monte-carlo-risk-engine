import numpy as np
from models.base import BaseSimulationModel


class HistoricalBootstrapModel(BaseSimulationModel):
    """
    Generates return paths by sampling historical daily return rows with replacement.
    Preserves multi-asset correlation by sampling entire daily rows.
    """

    def __init__(self, daily_returns: np.ndarray, tickers: list[str] = None):
        """
            daily_returns (np.ndarray): 2D array of historical returns 
                                        with shape (historical_days, num_assets).
        """
        self.daily_returns = np.asarray(daily_returns, dtype=float)

        # validation
        if self.daily_returns.ndim != 2:
            raise ValueError(f"daily_returns must be a 2D array, got shape {self.daily_returns.shape}")

        num_assets = self.daily_returns.shape[1]

        # ticker assignment & validation
        if tickers is None:
            self.tickers = [f"ASSET_{i}" for i in range(num_assets)]
        else:
            if len(tickers) != num_assets:
                raise ValueError(
                    f"ticker count ({len(tickers)}) does not match asset column count ({num_assets})"
                )
            self.tickers = list(tickers)

    def generate_path(self, forecasted_days: int) -> np.ndarray:
        """
        Generates a simulated path of returns for the specified number of days.
        """

        # get the number of available historical days (TODO: Make this customizable)
        num_historical_days = self.daily_returns.shape[0]

        # randomly sample row indices with replacement
        random_indices = np.random.choice(
            num_historical_days, 
            size=forecasted_days, 
            replace=True
        )

        # return randomly indexed daily returns
        return self.daily_returns[random_indices]
    
 