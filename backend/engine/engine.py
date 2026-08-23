import numpy as np


class SimulationEngine:
    def __init__(self, model):
        self.model = model

    def run(self, weights: dict[str, float], num_simulations: int, forecasted_days: int) -> np.ndarray:
        # validate ticker coverage
        for ticker in self.model.tickers:
            if ticker not in weights:
                raise ValueError(f"missing weight allocation for ticker: {ticker}")

        # reject weights for tickers not present in the model
        unexpected_tickers = set(weights) - set(self.model.tickers)

        if unexpected_tickers:
         raise ValueError(f"unexpected ticker allocation: {sorted(unexpected_tickers)}")

        # construct ordered weights array matching model column sequence
        weights_array = np.array([weights[ticker] for ticker in self.model.tickers], dtype=float)
        if not np.all(np.isfinite(weights_array)):
            raise ValueError("portfolio weights must be finite")

        if np.any(weights_array < 0):
            raise ValueError("portfolio weights cannot be negative")
        
        # validate weights sum to 1.0
        if not np.isclose(np.sum(weights_array), 1.0):
            raise ValueError(f"portfolio weights must sum to 1.0, got {np.sum(weights_array)}")

        # allocate matrix for simulation paths shape: (num_simulations, forecasted_days)
        portfolio_paths = np.empty((num_simulations, forecasted_days))

        # run matrix dot product across paths (note: major bottleneck right now, use numPY)
        for i in range(num_simulations):
            path = self.model.generate_path(forecasted_days=forecasted_days)
            portfolio_paths[i] = path @ weights_array

        return portfolio_paths
    

    