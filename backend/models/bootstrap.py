import numpy as np
from models.base import BaseSimulationModel


class HistoricalBootstrapModel(BaseSimulationModel):
    """
    Generates return paths by sampling historical daily return rows with replacement.
    Preserves multi-asset correlation by sampling entire daily rows.
    """

    def __init__(self, daily_returns: np.ndarray):
        """
            daily_returns (np.ndarray): 2D array of historical returns 
                                        with shape (historical_days, num_assets).
        """
        self.daily_returns = daily_returns
    
    def generate_path(self, forecasted_days: int) -> np.ndarray:
        pass 