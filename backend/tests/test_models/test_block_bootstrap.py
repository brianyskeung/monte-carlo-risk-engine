import pytest
import numpy as np
from models.block_bootstrap import BlockBootstrapModel


@pytest.fixture
def dummy_returns():
    # 10-day, 2-asset historical return matrix
    return np.array([
        [0.01, -0.02],
        [0.03, 0.01],
        [-0.01, 0.04],
        [0.02, -0.01],
        [0.00, 0.02],
        [0.01, 0.00],
        [-0.02, 0.03],
        [0.02, -0.02],
        [0.01, 0.01],
        [-0.01, -0.01],
    ])


def test_generated_path_shape(dummy_returns):
    model = BlockBootstrapModel(dummy_returns)
    path = model.generate_path(forecasted_days=12)

    assert path.shape == (12, 2)


def test_generated_paths_shape(dummy_returns):
    model = BlockBootstrapModel(dummy_returns)
    paths = model.generate_paths(num_simulations=4, forecasted_days=17)

    assert paths.shape == (4, 17, 2)


def test_generate_path_reproducibility_with_seed(dummy_returns):
    np.random.seed(42)
    model = BlockBootstrapModel(dummy_returns)
    path_1 = model.generate_path(forecasted_days=9)

    np.random.seed(42)
    path_2 = model.generate_path(forecasted_days=9)

    np.testing.assert_array_equal(path_1, path_2)


def test_block_bootstrap_default_tickers_fallback(dummy_returns):
    model = BlockBootstrapModel(daily_returns=dummy_returns)
    assert model.tickers == ["ASSET_0", "ASSET_1"]


def test_block_bootstrap_custom_tickers(dummy_returns):
    model = BlockBootstrapModel(daily_returns=dummy_returns, tickers=["AAPL", "MSFT"])
    assert model.tickers == ["AAPL", "MSFT"]


def test_block_bootstrap_non_2d_array():
    invalid_1d = np.array([0.01, 0.02, 0.03])
    with pytest.raises(ValueError) as exc_info:
        BlockBootstrapModel(daily_returns=invalid_1d)

    assert "2D array" in str(exc_info.value)


def test_block_bootstrap_shrinks_block_size_for_short_history():
    # only 3 historical days, shorter than the default block size of 5
    short_returns = np.array([
        [0.01, -0.02],
        [0.02, 0.01],
        [-0.01, 0.03],
    ])
    model = BlockBootstrapModel(short_returns)

    assert model.block_size == 3

    path = model.generate_path(forecasted_days=8)
    assert path.shape == (8, 2)


def test_block_bootstrap_preserves_cross_asset_rows(dummy_returns):
    # every row in a generated path must come from an original historical row,
    # preserving the paired asset values (i.e. correlation) within each day
    model = BlockBootstrapModel(daily_returns=dummy_returns)
    path = model.generate_path(forecasted_days=20)

    for row in path:
        matches = np.isclose(dummy_returns, row).all(axis=1)
        assert np.any(matches)


def test_block_bootstrap_rejects_invalid_generation_parameters(dummy_returns):
    model = BlockBootstrapModel(dummy_returns)

    with pytest.raises(ValueError, match="num_simulations"):
        model.generate_paths(num_simulations=0, forecasted_days=10)

    with pytest.raises(ValueError, match="forecasted_days"):
        model.generate_paths(num_simulations=10, forecasted_days=0)
