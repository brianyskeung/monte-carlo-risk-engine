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
    return HistoricalBootstrapModel(daily_returns=daily_returns)


def test_engine_portfolio_math(bootstrap_model):
    np.random.seed(42)  
    
    engine = SimulationEngine(model=bootstrap_model)
    weights = np.array([0.5, 0.5])  

    
    paths = engine.run(weights=weights, num_simulations=1, forecasted_days=3)

    # seed 42 picks row 3, 4, 2
    # Row 3: [0.00,  0.01] -> portfolio return = (0.00 * 0.5) + (0.01 * 0.5) = 0.005
    # Row 4: [0.05, -0.02] -> portfolio return = (0.05 * 0.5) + (-0.02 * 0.5) = 0.015
    # Row 2: [-0.02, 0.04] -> portfolio return = (-0.02 * 0.5) + (0.04 * 0.5) = 0.010
    expected_path = np.array([[0.005, 0.015, 0.010]])

    np.testing.assert_array_almost_equal(paths, expected_path)


def test_engine_output_shape(bootstrap_model):
    # verify output shape is (num_simulations, forecasted_days).
    engine = SimulationEngine(model=bootstrap_model)
    weights = np.array([0.6, 0.4])

    paths = engine.run(weights=weights, num_simulations=100, forecasted_days=10)

    assert paths.shape == (100, 10)


def test_engine_weight_mismatch(bootstrap_model):
    # verify engine raises ValueError if weight vector dimension doesn't match assets.
    engine = SimulationEngine(model=bootstrap_model)
    invalid_weights = np.array([0.5, 0.3, 0.2])  # 3 weights for 2 assets

    with pytest.raises(ValueError):
        engine.run(weights=invalid_weights, num_simulations=10, forecasted_days=5)

def test_engine_weights_sum_less_than_one(bootstrap_model):
    # verify engine raises ValueError if portfolio weights do not sum to 1.0
    engine = SimulationEngine(model=bootstrap_model)
    invalid_weights = np.array([0.5, 0.49])  # sums to 0.99

    with pytest.raises(ValueError):
        engine.run(weights=invalid_weights, num_simulations=10, forecasted_days=5)

def test_engine_weights_sum_greatrer_than_one(bootstrap_model):
    # verify engine raises ValueError if portfolio weights do not sum to 1.0
    engine = SimulationEngine(model=bootstrap_model)
    invalid_weights = np.array([0.5, 0.51])  # sums to 1.01

    with pytest.raises(ValueError):
        engine.run(weights=invalid_weights, num_simulations=10, forecasted_days=5)