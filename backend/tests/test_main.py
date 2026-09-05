import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app

# Initialize the test client
client = TestClient(app)

@pytest.fixture
def mock_market_data():

    fixed_data = np.array([
        [ 0.01,  0.02],
        [-0.01, -0.02],
        [ 0.00,  0.01],
        [ 0.02,  0.03],
        [-0.02, -0.01]
    ])
    return pd.DataFrame(fixed_data, columns=["SPY", "QQQ"])


@patch("main.get_historical_returns")
def test_successful_simulation(mock_get_returns, mock_market_data):
    
    mock_get_returns.return_value = mock_market_data
    
    payload = {
        "tickers": ["SPY", "QQQ"],
        "weights": {"SPY": 0.6, "QQQ": 0.4},
        "num_simulations": 100,  
        "forecasted_days": 252
    }
    
    response = client.post("/api/simulate", json=payload)
    
    assert response.status_code == 200
    json_data = response.json()
    
    assert json_data["status"] == "success"
    assert len(json_data["data"]["models"]) == 1
    assert json_data["data"]["models"][0]["model_id"] == "historical_bootstrap"
    assert "summary" in json_data["data"]["models"][0]
    assert "percentile_paths" in json_data["data"]["models"][0]


@patch("main.get_historical_returns")
def test_bad_request_invalid_weights(mock_get_returns, mock_market_data):
    mock_get_returns.return_value = mock_market_data
    
    # improper weights
    payload = {
        "tickers": ["SPY", "QQQ"],
        "weights": {"SPY": 0.6, "QQQ": 0.5},
        "num_simulations": 100,
        "forecasted_days": 252
    }
    
    response = client.post("/api/simulate", json=payload)
    
    assert response.status_code == 400
    assert "portfolio weights must sum to 1.0" in response.json()["detail"]