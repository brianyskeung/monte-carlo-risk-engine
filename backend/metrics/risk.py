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
    terminal_values = cumulative_paths[:, -1]
    final_returns = terminal_values - 1.0
    
    # compute tail risk metrics
    terminal_var_95 = float(np.percentile(terminal_values, 5))
    terminal_cvar_95 = float(np.mean(terminal_values[terminal_values <= terminal_var_95]))

    loss_var_95 = 1.0 - terminal_var_95
    loss_cvar_95 = 1.0 - terminal_cvar_95

    # compute daily percentile trajectories
    df = pd.DataFrame(cumulative_paths)
    percentiles_df = df.quantile([0.05, 0.25, 0.50, 0.75, 0.95], axis=0).T
    percentiles_df.columns = ["p5", "p25", "p50", "p75", "p95"]

    percentiles_df["mean"] = df.mean(axis=0).values
    percentiles_df["day"] = range(1, len(percentiles_df) + 1)

    return {
        "summary": {
            "expected_terminal_value": float(np.mean(terminal_values)),
            "expected_return": float(np.mean(final_returns)),
            "loss_var_95": float(loss_var_95),
            "loss_cvar_95": float(loss_cvar_95),
        },
        "percentile_paths": percentiles_df.to_dict(orient="records"),
    }