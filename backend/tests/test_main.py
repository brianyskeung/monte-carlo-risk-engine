import pytest
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app

# Initialize the test client
client = TestClient(app)

# two anonymous browsers; saved runs are scoped to whichever one sends them
OWNER = {"X-Client-Id": "11111111-1111-4111-8111-111111111111"}
OTHER_OWNER = {"X-Client-Id": "22222222-2222-4222-8222-222222222222"}

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
def test_completed_runs_can_be_listed_loaded_and_deleted(
    mock_get_returns, mock_market_data, monkeypatch, tmp_path
):
    monkeypatch.setenv("SIMULATION_DB_PATH", str(tmp_path / "runs.sqlite3"))
    mock_get_returns.return_value = mock_market_data
    payload = {
        "tickers": ["SPY", "QQQ"],
        "weights": {"SPY": 0.6, "QQQ": 0.4},
        "models": ["historical_bootstrap"],
        "num_simulations": 10,
        "forecasted_days": 5,
    }

    simulation = client.post("/api/simulate", json=payload)
    assert simulation.status_code == 200
    assert "run_id" not in simulation.json()

    save_response = client.post(
        "/api/runs", json={**payload, "data": simulation.json()["data"]}, headers=OWNER
    )
    assert save_response.status_code == 200
    run_id = save_response.json()["run_id"]

    history = client.get("/api/runs", headers=OWNER)
    assert history.status_code == 200
    assert history.json()["total"] == 1
    assert history.json()["runs"][0]["id"] == run_id

    saved_run = client.get(f"/api/runs/{run_id}", headers=OWNER)
    assert saved_run.status_code == 200
    assert saved_run.json()["tickers"] == ["SPY", "QQQ"]
    assert saved_run.json()["data"]["models"][0]["summary"]["forecasted_days"] == 5
    # forecasted days plus the day-0 baseline point
    assert len(saved_run.json()["data"]["models"][0]["percentile_paths"]) == 6

    assert client.delete(f"/api/runs/{run_id}", headers=OWNER).status_code == 200
    assert client.get(f"/api/runs/{run_id}", headers=OWNER).status_code == 404


@patch("main.get_historical_returns")
def test_duplicate_run_name_is_rejected(
    mock_get_returns, mock_market_data, monkeypatch, tmp_path
):
    monkeypatch.setenv("SIMULATION_DB_PATH", str(tmp_path / "runs.sqlite3"))
    mock_get_returns.return_value = mock_market_data
    payload = {
        "tickers": ["SPY", "QQQ"],
        "weights": {"SPY": 0.6, "QQQ": 0.4},
        "models": ["historical_bootstrap"],
        "num_simulations": 10,
        "forecasted_days": 5,
    }

    simulation = client.post("/api/simulate", json=payload)
    data = simulation.json()["data"]

    first = client.post(
        "/api/runs", json={**payload, "data": data, "name": "My Run"}, headers=OWNER
    )
    assert first.status_code == 200

    duplicate = client.post(
        "/api/runs", json={**payload, "data": data, "name": "My Run"}, headers=OWNER
    )
    assert duplicate.status_code == 400
    assert "already exists" in duplicate.json()["detail"]

    # case-insensitive match is also rejected
    case_variant = client.post(
        "/api/runs", json={**payload, "data": data, "name": "my run"}, headers=OWNER
    )
    assert case_variant.status_code == 400

    # unnamed runs are never treated as duplicates of each other
    unnamed_one = client.post("/api/runs", json={**payload, "data": data}, headers=OWNER)
    unnamed_two = client.post("/api/runs", json={**payload, "data": data}, headers=OWNER)
    assert unnamed_one.status_code == 200
    assert unnamed_two.status_code == 200

    # names only have to be unique per owner
    other_owner_same_name = client.post(
        "/api/runs", json={**payload, "data": data, "name": "My Run"}, headers=OTHER_OWNER
    )
    assert other_owner_same_name.status_code == 200


@patch("main.get_historical_returns")
def test_runs_are_private_to_their_owner(
    mock_get_returns, mock_market_data, monkeypatch, tmp_path
):
    monkeypatch.setenv("SIMULATION_DB_PATH", str(tmp_path / "runs.sqlite3"))
    mock_get_returns.return_value = mock_market_data
    payload = {
        "tickers": ["SPY", "QQQ"],
        "weights": {"SPY": 0.6, "QQQ": 0.4},
        "models": ["historical_bootstrap"],
        "num_simulations": 10,
        "forecasted_days": 5,
    }
    data = client.post("/api/simulate", json=payload).json()["data"]
    run_id = client.post(
        "/api/runs", json={**payload, "data": data}, headers=OWNER
    ).json()["run_id"]

    # another client cannot list, load or delete it
    assert client.get("/api/runs", headers=OTHER_OWNER).json()["total"] == 0
    assert client.get(f"/api/runs/{run_id}", headers=OTHER_OWNER).status_code == 404
    assert client.delete(f"/api/runs/{run_id}", headers=OTHER_OWNER).status_code == 404

    # and the owner still has it
    assert client.get(f"/api/runs/{run_id}", headers=OWNER).status_code == 200


@pytest.mark.parametrize("headers", [{}, {"X-Client-Id": "not-a-uuid"}])
def test_run_routes_require_a_valid_client_id(headers):
    assert client.get("/api/runs", headers=headers).status_code == 422
    assert client.get("/api/runs/1", headers=headers).status_code == 422
    assert client.delete("/api/runs/1", headers=headers).status_code == 422


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
