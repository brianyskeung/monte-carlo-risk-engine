import numpy as np
from models.base import BaseSimulationModel


class HestonModel(BaseSimulationModel):
    """
    Multi-asset Heston stochastic-volatility model. Each asset's instantaneous
    variance follows a mean-reverting CIR process (Cox-Ingersoll-Ross), and its
    price shock is correlated with its own variance shock via a calibrated
    leverage coefficient (the empirical tendency for volatility to rise as
    prices fall). Variance processes are simulated independently across assets.

    All parameters (drift, long-run variance, mean-reversion speed,
    vol-of-vol, and leverage) are calibrated per asset from historical daily
    log returns -- no options data is used. Variance paths use a
    full-truncation Euler scheme so variance never goes negative.
    """

    REALIZED_VOL_WINDOW = 20
    MIN_VARIANCE = 1e-10
    MIN_CALIBRATION_OBSERVATIONS = 3
    MIN_MEAN_REVERSION = 0.01
    MAX_MEAN_REVERSION = 5.0

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

        # shrink the realized-vol window for short histories
        num_days = self.daily_log_returns.shape[0]
        self.realized_vol_window = max(2, min(self.REALIZED_VOL_WINDOW, num_days // 2))

        correlation = np.atleast_2d(np.corrcoef(self.daily_log_returns, rowvar=False))
        self.price_cholesky = self._safe_cholesky(correlation)

        (
            self.initial_variance,
            self.long_run_variance,
            self.mean_reversion,
            self.vol_of_vol,
            self.leverage,
            self.drift,
        ) = self._calibrate()

    @staticmethod
    def _safe_cholesky(correlation: np.ndarray) -> np.ndarray:
        # a correlation matrix estimated from little/degenerate data can fail
        # to be positive-definite; nudge it back with increasing jitter
        # rather than crashing the simulation
        num_assets = correlation.shape[0]
        jitter = 0.0
        for _ in range(8):
            try:
                return np.linalg.cholesky(correlation + jitter * np.eye(num_assets))
            except np.linalg.LinAlgError:
                jitter = max(jitter * 10, 1e-10)
        return np.eye(num_assets)

    def _calibrate(
        self,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        log_returns = self.daily_log_returns
        num_days, num_assets = log_returns.shape
        window = self.realized_vol_window

        squared_dev = (log_returns - self.mean_log_returns) ** 2
        long_run_variance = np.maximum(np.mean(squared_dev, axis=0), self.MIN_VARIANCE)

        padded_cumsum = np.concatenate(
            [np.zeros((1, num_assets)), np.cumsum(squared_dev, axis=0)], axis=0
        )
        # realized_variance[k] = mean(squared_dev[k : k + window]), i.e. the
        # variance estimate as of day (k + window - 1)
        realized_variance = (padded_cumsum[window:] - padded_cumsum[:-window]) / window
        initial_variance = np.maximum(realized_variance[-1], self.MIN_VARIANCE)

        mean_reversion = np.ones(num_assets)
        vol_of_vol = np.zeros(num_assets)
        leverage = np.zeros(num_assets)

        if realized_variance.shape[0] > self.MIN_CALIBRATION_OBSERVATIONS:
            v_t = realized_variance[:-1]
            v_next = realized_variance[1:]
            # the return that "enters" the window going from v_t to v_next
            new_return = log_returns[window:] - self.mean_log_returns

            for asset_index in range(num_assets):
                theta = long_run_variance[asset_index]
                centered = theta - v_t[:, asset_index]
                delta = v_next[:, asset_index] - v_t[:, asset_index]

                # OLS slope (no intercept) of the CIR drift:
                # v_next - v_t = kappa * (theta - v_t) + noise
                denom = np.sum(centered ** 2)
                kappa = float(np.sum(centered * delta) / denom) if denom > 0 else 1.0
                kappa = float(
                    np.clip(kappa, self.MIN_MEAN_REVERSION, self.MAX_MEAN_REVERSION)
                )

                residual = delta - kappa * centered
                safe_v_t = np.maximum(v_t[:, asset_index], self.MIN_VARIANCE)
                xi = float(np.std(residual / np.sqrt(safe_v_t)))
                # soft Feller-condition cap to keep the discretized CIR
                # process from hitting zero too often
                xi = min(xi, np.sqrt(2 * kappa * theta))

                asset_return = new_return[:, asset_index]
                if np.std(asset_return) > 0 and np.std(delta) > 0:
                    rho = float(np.corrcoef(asset_return, delta)[0, 1])
                else:
                    rho = 0.0

                mean_reversion[asset_index] = kappa
                vol_of_vol[asset_index] = xi
                leverage[asset_index] = np.clip(rho, -0.99, 0.99)

        # drift calibrated so the average simulated log return matches the
        # empirical mean once variance settles at its long-run level
        drift = self.mean_log_returns + 0.5 * long_run_variance

        return (
            initial_variance,
            long_run_variance,
            mean_reversion,
            vol_of_vol,
            leverage,
            drift,
        )

    def generate_path(self, forecasted_days: int) -> np.ndarray:
        return self.generate_paths(num_simulations=1, forecasted_days=forecasted_days)[0]

    def generate_paths(
        self,
        num_simulations: int,
        forecasted_days: int,
    ) -> np.ndarray:
        self.validate_num_simulations(num_simulations)
        self.validate_forecasted_days(forecasted_days)

        num_assets = len(self.tickers)
        variance = np.tile(self.initial_variance, (num_simulations, 1))
        log_returns = np.empty((num_simulations, forecasted_days, num_assets))

        for day in range(forecasted_days):
            price_shocks = (
                np.random.standard_normal((num_simulations, num_assets))
                @ self.price_cholesky.T
            )
            variance_noise = np.random.standard_normal((num_simulations, num_assets))
            variance_shocks = (
                self.leverage * price_shocks
                + np.sqrt(np.maximum(1 - self.leverage ** 2, 0.0)) * variance_noise
            )

            vol = np.sqrt(variance)
            log_returns[:, day, :] = self.drift - 0.5 * variance + vol * price_shocks

            variance = (
                variance
                + self.mean_reversion * (self.long_run_variance - variance)
                + self.vol_of_vol * vol * variance_shocks
            )
            # full-truncation scheme: floor variance above zero
            variance = np.maximum(variance, self.MIN_VARIANCE)

        return np.expm1(log_returns)
