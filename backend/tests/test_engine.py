import numpy as np
import pytest
from models.bootstrap import HistoricalBootstrapModel
from engine import SimulationEngine


@pytest.fixture
def bootstrap_model():
    daily_returns = np.array([
        [0.01,  0.02],
        [0.03, -0.01],
        [-0.02, 0.04],
        [0.00,  0.01],
        [0.05, -0.02],
    ])
    return HistoricalBootstrapModel(daily_returns=daily_returns, tickers=["AAPL", "MSFT"])


def test_engine_portfolio_math_deterministic(bootstrap_model):
    # check that key order doesn't matter
    weights = {"MSFT": 0.4, "AAPL": 0.6}

    # (indices [3, 4, 2])
    np.random.seed(42)
    expected_rows = bootstrap_model.daily_returns[[3, 4, 2]]
    weights_array = np.array([0.6, 0.4])  
    expected_path = (expected_rows @ weights_array).reshape(1, 3)

    np.random.seed(42)
    engine = SimulationEngine(model=bootstrap_model)
    paths = engine.run(weights=weights, num_simulations=1, forecasted_days=3)

    np.testing.assert_array_almost_equal(paths, expected_path)


def test_engine_output_shape(bootstrap_model):
    engine = SimulationEngine(model=bootstrap_model)
    weights = {"AAPL": 0.5, "MSFT": 0.5}

    paths = engine.run(weights=weights, num_simulations=50, forecasted_days=10)
    assert paths.shape == (50, 10)


def test_engine_missing_ticker_raises_error(bootstrap_model):
    engine = SimulationEngine(model=bootstrap_model)
    invalid_weights = {"AAPL": 1.0}

    with pytest.raises(ValueError) as exc_info:
        engine.run(weights=invalid_weights, num_simulations=10, forecasted_days=5)

    assert "missing weight allocation" in str(exc_info.value)


def test_engine_invalid_weight_sum_raises_error(bootstrap_model):
    engine = SimulationEngine(model=bootstrap_model)
    invalid_weights = {"AAPL": 0.5, "MSFT": 0.8}

    with pytest.raises(ValueError) as exc_info:
        engine.run(weights=invalid_weights, num_simulations=10, forecasted_days=5)

    assert "must sum to 1.0" in str(exc_info.value)