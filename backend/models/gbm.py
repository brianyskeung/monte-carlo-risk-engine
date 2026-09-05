import numpy as np

from models.base import BaseSimulationModel


class GeometricBrownianMotionModel(BaseSimulationModel):
    """Generates correlated asset-return paths using geometric Brownian motion."""

    def __init__(self, daily_returns: np.ndarray, tickers: list[str] = None):
        self.daily_returns = np.asarray(daily_returns, dtype=float)

        if self.daily_returns.ndim != 2:
            raise ValueError(
                f"daily_returns must be a 2D array, got shape {self.daily_returns.shape}"
            )

        if self.daily_returns.shape[0] < 2:
            raise ValueError("daily_returns must contain at least 2 observations")

        if not np.all(np.isfinite(self.daily_returns)):
            raise ValueError("daily_returns must contain only finite values")

        super().__init__(self.daily_returns.shape[1], tickers)

        self.daily_log_returns = np.log1p(self.daily_returns)
        self.mean_log_returns = np.mean(self.daily_log_returns, axis=0)
        self.covariance = np.atleast_2d(np.cov(self.daily_log_returns, rowvar=False))

    def generate_path(self, forecasted_days: int) -> np.ndarray:
        self.validate_forecasted_days(forecasted_days)

        simulated_log_returns = np.random.multivariate_normal(
            self.mean_log_returns,
            self.covariance,
            size=forecasted_days,
        )
        return np.expm1(simulated_log_returns)

    def generate_paths(
        self,
        num_simulations: int,
        forecasted_days: int,
    ) -> np.ndarray:
        self.validate_num_simulations(num_simulations)
        self.validate_forecasted_days(forecasted_days)

        simulated_log_returns = np.random.multivariate_normal(
            self.mean_log_returns,
            self.covariance,
            size=(num_simulations, forecasted_days),
        )
        return np.expm1(simulated_log_returns)
