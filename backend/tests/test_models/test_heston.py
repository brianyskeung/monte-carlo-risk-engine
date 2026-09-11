import numpy as np
import pytest

from models.heston import HestonModel


@pytest.fixture
def dummy_returns():
    return np.array([
        [0.01, -0.02],
        [0.03, 0.01],
        [-0.01, 0.04],
        [0.02, -0.01],
        [0.00, 0.02],
    ])


@pytest.fixture
def longer_returns():
    # a longer, synthetic history so calibration has enough observations to
    # fit mean-reversion/vol-of-vol/leverage instead of falling back to
    # the degenerate short-history defaults
    rng = np.random.default_rng(7)
    days = 120
    variance = np.full(2, 0.0004)
    returns = np.empty((days, 2))
    for day in range(days):
        shock = rng.standard_normal(2)
        returns[day] = shock * np.sqrt(variance)
        variance = np.maximum(
            variance + 0.05 * (0.0004 - variance) + 0.01 * shock ** 2, 1e-8
        )
    return returns


def test_generated_path_shape(dummy_returns):
    model = HestonModel(dummy_returns)

    path = model.generate_path(forecasted_days=12)

    assert path.shape == (12, 2)
    assert np.isfinite(path).all()


def test_generated_paths_shape(dummy_returns):
    model = HestonModel(dummy_returns)

    paths = model.generate_paths(num_simulations=4, forecasted_days=12)

    assert paths.shape == (4, 12, 2)
    assert np.isfinite(paths).all()


def test_generated_paths_reproducible_with_seed(dummy_returns):
    model = HestonModel(dummy_returns)

    np.random.seed(42)
    paths_one = model.generate_paths(num_simulations=2, forecasted_days=4)

    np.random.seed(42)
    paths_two = model.generate_paths(num_simulations=2, forecasted_days=4)

    np.testing.assert_array_equal(paths_one, paths_two)


def test_custom_tickers(dummy_returns):
    model = HestonModel(dummy_returns, tickers=["SPY", "QQQ"])

    assert model.tickers == ["SPY", "QQQ"]


def test_rejects_invalid_inputs():
    with pytest.raises(ValueError, match="2D array"):
        HestonModel(np.array([0.01, 0.02]))

    with pytest.raises(ValueError, match="at least 2 observations"):
        HestonModel(np.array([[0.01, 0.02]]))


def test_rejects_invalid_generation_parameters(dummy_returns):
    model = HestonModel(dummy_returns)

    with pytest.raises(ValueError, match="num_simulations"):
        model.generate_paths(num_simulations=0, forecasted_days=10)

    with pytest.raises(ValueError, match="forecasted_days"):
        model.generate_paths(num_simulations=10, forecasted_days=0)


def test_variance_never_goes_negative(dummy_returns):
    model = HestonModel(dummy_returns)

    paths = model.generate_paths(num_simulations=50, forecasted_days=200)

    # a return of exactly -100% would only happen at zero/negative variance
    # with a runaway shock; more usefully, every path must stay finite and
    # above the -100% floor implied by a valid variance process
    assert np.isfinite(paths).all()
    assert (paths > -1.0).all()


def test_calibration_produces_bounded_parameters(longer_returns):
    model = HestonModel(longer_returns)

    assert model.mean_reversion.shape == (2,)
    assert np.all(model.mean_reversion >= HestonModel.MIN_MEAN_REVERSION)
    assert np.all(model.mean_reversion <= HestonModel.MAX_MEAN_REVERSION)
    assert np.all(model.vol_of_vol >= 0)
    assert np.all(np.abs(model.leverage) <= 0.99)
    assert np.all(model.initial_variance > 0)
    assert np.all(model.long_run_variance > 0)
    assert np.isfinite(model.drift).all()


def test_short_history_falls_back_to_stable_defaults():
    # only 2 observations -> too few realized-variance points to fit CIR
    # parameters, so calibration falls back to pure mean-reverting defaults
    # (kappa=1, vol-of-vol=0, leverage=0) rather than a crash
    minimal_returns = np.array([
        [0.01, -0.02],
        [0.02, 0.01],
    ])
    model = HestonModel(minimal_returns)

    assert np.all(model.mean_reversion == 1.0)
    assert np.all(model.vol_of_vol == 0.0)
    assert np.all(model.leverage == 0.0)
