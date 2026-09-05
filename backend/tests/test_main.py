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
    models = json_data["data"]["models"]
    assert [model["model_id"] for model in models] == [
        "historical_bootstrap",
        "geometric_brownian_motion",
    ]
    assert all("summary" in model for model in models)
    assert all("percentile_paths" in model for model in models)


@patch("main.get_historical_returns")
def test_simulation_can_select_one_model(mock_get_returns, mock_market_data):
    mock_get_returns.return_value = mock_market_data

    payload = {
        "tickers": ["SPY", "QQQ"],
        "weights": {"SPY": 0.6, "QQQ": 0.4},
        "models": ["geometric_brownian_motion"],
        "num_simulations": 10,
        "forecasted_days": 5,
    }

    response = client.post("/api/simulate", json=payload)

    assert response.status_code == 200
    assert [
        model["model_id"] for model in response.json()["data"]["models"]
    ] == ["geometric_brownian_motion"]


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