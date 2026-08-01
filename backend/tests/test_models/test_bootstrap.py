import pytest
import numpy as np
from models.bootstrap import HistoricalBootstrapModel


@pytest.fixture
def dummy_returns():
    # 5-day, 2-asset historical return matrix
    return np.array([
        [0.01, -0.02],
        [0.03,  0.01],
        [-0.01, 0.04],
        [0.02, -0.01],
        [0.00,  0.02]
    ])

# shape and output structure tests

def test_generated_path_same_days(dummy_returns):
    model = HistoricalBootstrapModel(dummy_returns)
    forecasted_days = 2
    path = model.generate_path(forecasted_days)

    assert path.shape == (2, 2)


def test_generated_path_shapes(dummy_returns):
    model = HistoricalBootstrapModel(dummy_returns)
    forecasted_days = 252
    path = model.generate_path(forecasted_days)

    assert path.shape == (252, 2)


def test_generate_path_reproducibility_with_seed(dummy_returns):
    np.random.seed(42)
    model = HistoricalBootstrapModel(daily_returns=dummy_returns)
    path_1 = model.generate_path(forecasted_days=5)

    np.random.seed(42)
    path_2 = model.generate_path(forecasted_days=5)

    np.testing.assert_array_equal(path_1, path_2)


# ticker tests 

def test_bootstrap_default_tickers_fallback(dummy_returns):
    # when no tickers are provided, it auto-generates ASSET_0, ASSET_1, etc.
    model = HistoricalBootstrapModel(daily_returns=dummy_returns)
    assert model.tickers == ["ASSET_0", "ASSET_1"]


def test_bootstrap_custom_tickers(dummy_returns):
    # explicit tickers match what was passed in
    model = HistoricalBootstrapModel(daily_returns=dummy_returns, tickers=["AAPL", "MSFT"])
    assert model.tickers == ["AAPL", "MSFT"]


def test_bootstrap_mismatched_tickers(dummy_returns):
    # passing 3 tickers for a 2-column return matrix must raise ValueError
    with pytest.raises(ValueError) as exc_info:
        HistoricalBootstrapModel(daily_returns=dummy_returns, tickers=["AAPL", "MSFT", "GOOGL"])

    assert "ticker count" in str(exc_info.value)


# input dimension & edge case validation tests

def test_bootstrap_non_2d_array():
    # 1d array should fail
    invalid_1d = np.array([0.01, 0.02, 0.03])
    with pytest.raises(ValueError) as exc_info:
        HistoricalBootstrapModel(daily_returns=invalid_1d)

    assert "2D array" in str(exc_info.value)


def test_bootstrap_resampled_values_exist(dummy_returns):
    # ensures that every row in the generated path comes from original historical rows
    model = HistoricalBootstrapModel(daily_returns=dummy_returns)
    path = model.generate_path(forecasted_days=20)

    for row in path:
        # verify each row exists somewhere in the dummy_returns matrix
        matches = np.isclose(dummy_returns, row).all(axis=1)
        assert np.any(matches)