import numpy as np
import pytest
from metrics import calculate_portfolio_metrics


@pytest.fixture
def fixed_daily_returns():

    return np.array([
        [0.01,  0.02, -0.01],  # Sim 1: +1%, +2%, -1%
        [0.00, -0.01,  0.01],  # Sim 2:  0%, -1%, +1%
        [-0.02, 0.03,  0.02],  # Sim 3: -2%, +3%, +2%
    ])


def test_output_structure(fixed_daily_returns):
    
    results = calculate_portfolio_metrics(fixed_daily_returns)
    
    assert "summary" in results
    assert "percentile_paths" in results

    paths = results["percentile_paths"]
    
    # 3 days of forecasted returns should yield 3 days of chart data
    assert len(paths) == 3
    
    # Check that day indexing starts at 1 and correctly increments
    assert paths[0]["day"] == 1
    assert paths[2]["day"] == 3

    # Check that keys are present in the day dictionaries
    expected_keys = {"day", "p5", "p25", "p50", "p75", "p95", "mean"}
    assert set(paths[0].keys()) == expected_keys


def test_accumulation_trajectories(fixed_daily_returns):
    # verifies accurate compounding
    results = calculate_portfolio_metrics(fixed_daily_returns)
    paths = results["percentile_paths"]
    
    # Day 1 values: [1.01, 1.00, 0.98]
    # Expected mean = (1.01 + 1.00 + 0.98) / 3 = 0.99666...
    assert pytest.approx(paths[0]["mean"], abs=1e-4) == 0.9967
    
    # Day 2 values: 
    # Sim 1: 1.01 * 1.02 = 1.0302
    # Sim 2: 1.00 * 0.99 = 0.99
    # Sim 3: 0.98 * 1.03 = 1.0094
    # Expected mean = (1.0302 + 0.99 + 1.0094) / 3 = 1.009866...
    assert pytest.approx(paths[1]["mean"], abs=1e-4) == 1.0099


def test_terminal_risk_metrics(fixed_daily_returns):
    # verifies expected returns, medians, and tail risk on the final day
    results = calculate_portfolio_metrics(fixed_daily_returns)
    summary = results["summary"]
    
    expected_final_values = [1.019898, 0.9999, 1.029588]
    
    # mean return
    expected_mean = np.mean(expected_final_values)
    assert pytest.approx(summary["expected_return"], abs=1e-4) == expected_mean
    
    # median return
    expected_median = np.median(expected_final_values)
    assert pytest.approx(summary["median_return"], abs=1e-4) == expected_median
    
    # VaR 95
    expected_var = np.percentile(expected_final_values, 5)
    assert pytest.approx(summary["value_at_risk_95"], abs=1e-4) == expected_var
    
    # CVaR 95
    cvar_mask = np.array(expected_final_values) <= expected_var
    expected_cvar = np.mean(np.array(expected_final_values)[cvar_mask])
    assert pytest.approx(summary["conditional_var_95"], abs=1e-4) == expected_cvar


def test_percentile_ordering(fixed_daily_returns):
    # verifies percentile is in increasing order
    results = calculate_portfolio_metrics(fixed_daily_returns)
    
    for daily_data in results["percentile_paths"]:

        assert daily_data["p5"] <= daily_data["p25"]
        assert daily_data["p25"] <= daily_data["p50"]
        assert daily_data["p50"] <= daily_data["p75"]
        assert daily_data["p75"] <= daily_data["p95"]