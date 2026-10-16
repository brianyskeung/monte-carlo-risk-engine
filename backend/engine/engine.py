import numpy as np


class SimulationEngine:
    """
    Collapses a model's per-asset return paths into portfolio return paths.

    The model supplies the randomness; the engine only validates the weight
    allocation and applies it.
    """

    def __init__(self, model):
        self.model = model

    def run(self, weights: dict[str, float], num_simulations: int, forecasted_days: int) -> np.ndarray:
        """
        Validates the weights, then weights the model's per-asset paths into one
        portfolio return series per simulation.

        Returns a 2D array of shape (num_simulations, forecasted_days).
        """
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
            raise ValueError("Portfolio weights must be finite.")

        if np.any(weights_array < 0):
            raise ValueError("Portfolio weights cannot be negative.")
        
        # validate weights sum to 1.0
        if not np.isclose(np.sum(weights_array), 1.0):
            raise ValueError(f"Portfolio allocation must reach 100%, got {np.sum(weights_array)*100}%")
        
        
        # run matrix dot product across paths 
        paths = self.model.generate_paths(
            num_simulations=num_simulations,
            forecasted_days=forecasted_days)
        
        return paths @ weights_array
    

    