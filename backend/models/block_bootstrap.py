import numpy as np
from models.base import BaseSimulationModel


class BlockBootstrapModel(BaseSimulationModel):
    """
    Generates return paths by resampling contiguous blocks of historical daily
    return rows with replacement, instead of single days. Preserves short-term
    autocorrelation and volatility clustering that plain day-by-day bootstrapping
    destroys, while still preserving multi-asset correlation within each block.
    """

    BLOCK_SIZE = 5

    def __init__(self, daily_returns: np.ndarray, tickers: list[str] = None):
        """
            daily_returns (np.ndarray): 2D array of historical returns
                                        with shape (historical_days, num_assets).
        """
        self.daily_returns = np.asarray(daily_returns, dtype=float)

        if self.daily_returns.ndim != 2:
            raise ValueError(f"daily_returns must be a 2D array, got shape {self.daily_returns.shape}")

        # shrink the block size for short histories rather than failing outright
        self.block_size = max(1, min(self.BLOCK_SIZE, self.daily_returns.shape[0]))

        super().__init__(self.daily_returns.shape[1], tickers)

    def generate_path(self, forecasted_days: int) -> np.ndarray:
        """
        Generates a simulated path of returns for the specified number of days.
        """
        return self.generate_paths(num_simulations=1, forecasted_days=forecasted_days)[0]

    def generate_paths(
        self,
        num_simulations: int,
        forecasted_days: int,
    ) -> np.ndarray:
        self.validate_num_simulations(num_simulations)
        self.validate_forecasted_days(forecasted_days)

        num_historical_days = self.daily_returns.shape[0]
        block_size = self.block_size
        num_blocks = -(-forecasted_days // block_size)  # ceil division

        # random starting index for each block, per simulation
        start_indices = np.random.randint(
            0,
            num_historical_days - block_size + 1,
            size=(num_simulations, num_blocks),
        )

        # expand each start index into a full block of consecutive day indices
        block_offsets = np.arange(block_size)
        day_indices = start_indices[:, :, None] + block_offsets
        day_indices = day_indices.reshape(num_simulations, num_blocks * block_size)

        # trim to exactly the requested number of days
        day_indices = day_indices[:, :forecasted_days]

        # Shape: (num_simulations, forecasted_days, num_assets)
        return self.daily_returns[day_indices]
