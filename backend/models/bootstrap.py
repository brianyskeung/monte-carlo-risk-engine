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

        super().__init__(self.daily_returns.shape[1], tickers)

    def generate_path(self, forecasted_days: int) -> np.ndarray:
        """
        Generates a simulated path of returns for the specified number of days.
        """
        
        self.validate_forecasted_days(forecasted_days)
        
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
    
    
    def generate_paths(
    self,
    num_simulations: int,
    forecasted_days: int,
    ) -> np.ndarray:
        self.validate_num_simulations(num_simulations)
        self.validate_forecasted_days(forecasted_days)

        random_indices = np.random.choice(
            self.daily_returns.shape[0],
            size=(num_simulations, forecasted_days),
            replace=True,
        )

        # Shape: (num_simulations, forecasted_days, num_assets)
        return self.daily_returns[random_indices]
    
 