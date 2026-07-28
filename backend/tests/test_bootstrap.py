import pytest
import numpy as np
from models.bootstrap import HistoricalBootstrapModel


@pytest.fixture
def dummy_returns():
    """
    Creates a dummy 5-day, 2-asset historical return matrix for testing.
    Columns represent assets.
    """
    return np.array([
        [0.01, -0.02],
        [0.03,  0.01],
        [-0.01, 0.04],
        [0.02, -0.01],
        [0.00,  0.02]
    ])

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
