import numpy as np
import pytest

from models.jump_diffusion import JumpDiffusionModel


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
    model = JumpDiffusionModel(dummy_returns)

    path = model.generate_path(forecasted_days=12)

    assert path.shape == (12, 2)
    assert np.isfinite(path).all()


def test_generated_paths_shape(dummy_returns):
    model = JumpDiffusionModel(dummy_returns)

    paths = model.generate_paths(num_simulations=4, forecasted_days=12)

    assert paths.shape == (4, 12, 2)
    assert np.isfinite(paths).all()


def test_generated_paths_reproducible_with_seed(dummy_returns):
    model = JumpDiffusionModel(dummy_returns)

    np.random.seed(42)
    paths_one = model.generate_paths(num_simulations=2, forecasted_days=4)

    np.random.seed(42)
    paths_two = model.generate_paths(num_simulations=2, forecasted_days=4)

    np.testing.assert_array_equal(paths_one, paths_two)


def test_custom_tickers(dummy_returns):
    model = JumpDiffusionModel(dummy_returns, tickers=["SPY", "QQQ"])

    assert model.tickers == ["SPY", "QQQ"]


def test_rejects_invalid_inputs():
    with pytest.raises(ValueError, match="2D array"):
        JumpDiffusionModel(np.array([0.01, 0.02]))

    with pytest.raises(ValueError, match="at least 2 observations"):
        JumpDiffusionModel(np.array([[0.01, 0.02]]))


def test_rejects_invalid_generation_parameters(dummy_returns):
    model = JumpDiffusionModel(dummy_returns)

    with pytest.raises(ValueError, match="num_simulations"):
        model.generate_paths(num_simulations=0, forecasted_days=10)

    with pytest.raises(ValueError, match="forecasted_days"):
        model.generate_paths(num_simulations=10, forecasted_days=0)


def test_no_jumps_detected_falls_back_to_pure_diffusion():
    # a tightly clustered return series has no 3-sigma outliers, so jump
    # intensity should calibrate to zero for every asset
    calm_returns = np.array([
        [0.001, -0.002],
        [0.002, 0.001],
        [-0.001, 0.002],
        [0.001, -0.001],
        [0.000, 0.001],
        [0.001, 0.000],
    ])
    model = JumpDiffusionModel(calm_returns)

    np.testing.assert_array_equal(model.jump_intensity, np.zeros(2))


def test_jump_calibrated_from_historical_outlier():
    # asset 0 has two clear outlier days far beyond the rest of its distribution
    # (a longer calm history, plus >= MIN_JUMP_OBSERVATIONS outliers, keeps them
    # from inflating asset 0's own std away and satisfies the min-sample floor);
    # asset 1 stays calm throughout and should calibrate to zero jump intensity
    calm_block = np.array([
        [0.001, -0.001],
        [-0.001, 0.001],
        [0.002, 0.000],
        [0.000, 0.002],
        [-0.002, -0.001],
    ])
    returns_with_outlier = np.concatenate(
        [np.tile(calm_block, (4, 1)), [[0.5, 0.001], [0.5, -0.001]]]
    )
    model = JumpDiffusionModel(returns_with_outlier)

    assert model.jump_intensity[0] > 0
    assert model.jump_intensity[1] == 0
