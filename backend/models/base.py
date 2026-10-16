from abc import ABC, abstractmethod
import numpy as np


class BaseSimulationModel(ABC):
    """
    Abstract base for every return-path simulation model.

    Subclasses calibrate themselves from historical data in __init__ and
    produce *daily return percentages* (not prices, not log returns), with
    assets kept in the same column order as the historical data.
    """

    def __init__(self, num_assets: int, tickers: list[str] | None = None):
        """
        num_assets must match the column count of the historical data.
        tickers label those columns, defaulting to ASSET_0, ASSET_1, ...
        """
        if num_assets <= 0:
            raise ValueError("num_assets must be greater than 0")

        if tickers is None:
            self.tickers = [f"ASSET_{index}" for index in range(num_assets)]
        else:
            if len(tickers) != num_assets:
                raise ValueError(
                    f"ticker count ({len(tickers)}) does not match asset column count ({num_assets})"
                )
            self.tickers = list(tickers)

    @staticmethod
    def validate_forecasted_days(forecasted_days: int) -> None:
        """Rejects a non-positive forecast horizon."""
        if forecasted_days <= 0:
            raise ValueError("forecasted_days must be greater than 0")

    @staticmethod
    def validate_num_simulations(num_simulations: int) -> None:
        """Rejects a non-positive simulation count."""
        if num_simulations <= 0:
            raise ValueError("num_simulations must be greater than 0")

    @abstractmethod
    def generate_path(self, forecasted_days: int) -> np.ndarray:
        
        """
        generates daily return percentages for a single simulated path.

        Must return 2D np.ndarray of shape: (forecasted_days, num_assets)
        """
        pass

    def generate_paths(
        self,
        num_simulations: int,
        forecasted_days: int,
    ) -> np.ndarray:
        """
        generates daily return percentages for a multiple simulated paths.
        
        Must return 3D np.ndarray of shape: (num_simulations, forecasted_days, num_assets)
        """
        pass