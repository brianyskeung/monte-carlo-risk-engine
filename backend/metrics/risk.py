import numpy as np
import pandas as pd


def calculate_portfolio_metrics(daily_return_paths: np.ndarray) -> dict:
    """
    Takes raw daily return paths (num_simulations, forecasted_days),
    accumulates them into cumulative trajectories and computes stats.
    """
    # convert daily returns into compounded values 
    cumulative_paths = np.cumprod(1.0 + daily_return_paths, axis=1)

    # extract total final values 
    final_values = cumulative_paths[:, -1]

    # compute tail risk metrics
    var_95 = float(np.percentile(final_values, 5))
    cvar_95 = float(np.mean(final_values[final_values <= var_95]))

    # compute daily percentile trajectories
    df = pd.DataFrame(cumulative_paths)
    percentiles_df = df.quantile([0.05, 0.25, 0.50, 0.75, 0.95], axis=0).T
    percentiles_df.columns = ["p5", "p25", "p50", "p75", "p95"]

    percentiles_df["mean"] = df.mean(axis=0).values
    percentiles_df["day"] = range(1, len(percentiles_df) + 1)

    return {
        "summary": {
            "expected_return": float(np.mean(final_values)),
            "median_return": float(np.median(final_values)),
            "value_at_risk_95": var_95,
            "conditional_var_95": cvar_95,
        },
        "percentile_paths": percentiles_df.to_dict(orient="records"),
    }