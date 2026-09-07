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
    assert "Portfolio allocation must reach 100%" in response.json()["detail"]


def test_empty_portfolio_is_rejected():
    response = client.post(
        "/api/simulate",
        json={"tickers": [], "weights": {}},
    )

    assert response.status_code == 422


@patch("main.get_historical_returns")
def test_unavailable_ticker_returns_bad_request(mock_get_returns):
    mock_get_returns.side_effect = ValueError(
        "Unknown or unavailable ticker(s): NOT-A-TICKER"
    )

    response = client.post(
        "/api/simulate",
        json={
            "tickers": ["NOT-A-TICKER"],
            "weights": {"NOT-A-TICKER": 1.0},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unknown or unavailable ticker(s): NOT-A-TICKER"


@patch("main.get_asset_info")
def test_assets_include_industry_and_sector(mock_get_asset_info):
    mock_get_asset_info.return_value = {
        "AAPL": {
            "symbol": "AAPL",
            "short_name": "Apple Inc.",
            "quote_type": "STOCK",
            "industry": "Consumer Electronics",
            "sector": "Technology",
            "exchange": "NMS",
            "currency": "USD",
            "is_valid": True,
        }
    }

    response = client.get("/api/assets", params={"tickers": ["AAPL"]})

    assert response.status_code == 200
    asset = response.json()["assets"]["AAPL"]
    assert asset["industry"] == "Consumer Electronics"
    assert asset["sector"] == "Technology"