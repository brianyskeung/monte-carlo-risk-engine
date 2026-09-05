import numpy as np
import pytest

from models.gbm import GeometricBrownianMotionModel


@pytest.fixture
def dummy_returns():
    return np.array([
        [0.01, -0.02],
        [0.03, 0.01],
        [-0.01, 0.04],
        [0.02, -0.01],
        [0.00, 0.02],
    ])


def test_generated_path_shape(dummy_returns):
    model = GeometricBrownianMotionModel(dummy_returns)

    path = model.generate_path(forecasted_days=12)

    assert path.shape == (12, 2)
    assert np.isfinite(path).all()


def test_generated_paths_shape(dummy_returns):
    model = GeometricBrownianMotionModel(dummy_returns)

    paths = model.generate_paths(num_simulations=4, forecasted_days=12)

    assert paths.shape == (4, 12, 2)
    assert np.isfinite(paths).all()


def test_generated_paths_reproducible_with_seed(dummy_returns):
    model = GeometricBrownianMotionModel(dummy_returns)

    np.random.seed(42)
    paths_one = model.generate_paths(num_simulations=2, forecasted_days=4)

    np.random.seed(42)
    paths_two = model.generate_paths(num_simulations=2, forecasted_days=4)

    np.testing.assert_array_equal(paths_one, paths_two)


def test_custom_tickers(dummy_returns):
    model = GeometricBrownianMotionModel(dummy_returns, tickers=["SPY", "QQQ"])

    assert model.tickers == ["SPY", "QQQ"]


def test_rejects_invalid_inputs():
    with pytest.raises(ValueError, match="2D array"):
        GeometricBrownianMotionModel(np.array([0.01, 0.02]))

    with pytest.raises(ValueError, match="at least 2 observations"):
        GeometricBrownianMotionModel(np.array([[0.01, 0.02]]))


def test_rejects_invalid_generation_parameters(dummy_returns):
    model = GeometricBrownianMotionModel(dummy_returns)

    with pytest.raises(ValueError, match="num_simulations"):
        model.generate_paths(num_simulations=0, forecasted_days=10)

    with pytest.raises(ValueError, match="forecasted_days"):
        model.generate_paths(num_simulations=10, forecasted_days=0)
