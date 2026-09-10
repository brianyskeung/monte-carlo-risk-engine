import numpy as np

from models.base import BaseSimulationModel


class JumpDiffusionModel(BaseSimulationModel):
    """
    Merton jump-diffusion: a geometric Brownian motion diffusion (correlated
    across assets, same as GeometricBrownianMotionModel) plus an independent
    compound-Poisson jump component per asset, layered on top to model sudden
    crashes/spikes that a pure diffusion underestimates.

    Jump parameters are calibrated per asset from historical daily log returns
    using a simple sigma-threshold classification: any day whose log return is
    more than JUMP_THRESHOLD_STD standard deviations from that asset's mean is
    treated as a jump. Assets with too few detected jumps to fit a distribution
    fall back to zero jump intensity (pure diffusion for that asset).
    """

    JUMP_THRESHOLD_STD = 3.0
    MIN_JUMP_OBSERVATIONS = 2

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

        self.jump_intensity, self.jump_mean, self.jump_std = self._calibrate_jumps()

    def _calibrate_jumps(self) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        num_assets = self.daily_log_returns.shape[1]

        asset_std = np.std(self.daily_log_returns, axis=0)
        # avoid dividing by zero for a zero-variance asset
        safe_asset_std = np.where(asset_std == 0, 1.0, asset_std)

        z_scores = np.abs(self.daily_log_returns - self.mean_log_returns) / safe_asset_std
        is_jump = z_scores > self.JUMP_THRESHOLD_STD

        jump_intensity = np.mean(is_jump, axis=0)
        jump_mean = np.zeros(num_assets)
        jump_std = np.zeros(num_assets)

        for asset_index in range(num_assets):
            jump_values = self.daily_log_returns[is_jump[:, asset_index], asset_index]
            if jump_values.size >= self.MIN_JUMP_OBSERVATIONS:
                jump_mean[asset_index] = np.mean(jump_values)
                jump_std[asset_index] = np.std(jump_values)
            else:
                # not enough data to fit a jump distribution for this asset
                jump_intensity[asset_index] = 0.0

        return jump_intensity, jump_mean, jump_std

    def generate_path(self, forecasted_days: int) -> np.ndarray:
        return self.generate_paths(num_simulations=1, forecasted_days=forecasted_days)[0]

    def generate_paths(
        self,
        num_simulations: int,
        forecasted_days: int,
    ) -> np.ndarray:
        self.validate_num_simulations(num_simulations)
        self.validate_forecasted_days(forecasted_days)

        diffusion_log_returns = np.random.multivariate_normal(
            self.mean_log_returns,
            self.covariance,
            size=(num_simulations, forecasted_days),
        )

        shape = (num_simulations, forecasted_days, len(self.tickers))
        jump_occurs = np.random.random(shape) < self.jump_intensity
        jump_sizes = np.random.normal(self.jump_mean, self.jump_std, size=shape)

        total_log_returns = diffusion_log_returns + jump_occurs * jump_sizes

        return np.expm1(total_log_returns)
