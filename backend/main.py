import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from schemas import SaveRunRequest, SimulationRequest
from data import get_asset_info, get_historical_returns, search_tickers
from engine import SimulationEngine
from models import (
    HistoricalBootstrapModel,
    GeometricBrownianMotionModel,
    BlockBootstrapModel,
    JumpDiffusionModel,
    HestonModel,
)
from metrics import calculate_portfolio_metrics
from database import delete_run, get_run, list_runs, save_run
import time

app = FastAPI(title="Monte Carlo Risk Engine API")

origins = [
    "http://localhost:5173",
]

prod_origin = os.getenv("FRONTEND_URL")
if prod_origin:
    origins.append(prod_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/assets")
def get_assets_endpoint(tickers: list[str] = Query(...)):
    return {
        "assets": get_asset_info(tickers),
    }


@app.get("/api/tickers/search")
def search_tickers_endpoint(q: str = Query(..., min_length=1), limit: int = Query(8, ge=1, le=20)):
    return {
        "matches": search_tickers(q, limit=limit),
    }


@app.post("/api/simulate")
def run_simulation(request: SimulationRequest):
    # download market data
    try:
        daily_returns_df = get_historical_returns(
            request.tickers, period=request.lookback_period
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    model_types = {
        "historical_bootstrap": (
            HistoricalBootstrapModel,
            "Historical Bootstrap",
        ),
        "geometric_brownian_motion": (
            GeometricBrownianMotionModel,
            "Geometric Brownian Motion",
        ),
        "block_bootstrap": (
            BlockBootstrapModel,
            "Block Bootstrap",
        ),
        "jump_diffusion": (
            JumpDiffusionModel,
            "Jump Diffusion (Merton)",
        ),
        "heston": (
            HestonModel,
            "Heston",
        ),
    }
    results = {"models": []}
    
    # run simulation for each model requested
    for model_id in request.models:
        model_class, display_name = model_types[model_id]
        model = model_class(
            daily_returns=daily_returns_df.values,
            tickers=list(daily_returns_df.columns),
        )
        
        engine = SimulationEngine(model=model)
        
        # start time counter
        start = time.perf_counter()
        
         # execute simulation and catch engine validation errors
        try:
            simulated_paths = engine.run(
                weights=request.weights,
                num_simulations=request.num_simulations,
                forecasted_days=request.forecasted_days,
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        simulation_time_ms = (time.perf_counter() - start) * 1000
        metrics = calculate_portfolio_metrics(simulated_paths)
        results["models"].append(
            {
                "model_id": model_id,
                "display_name": display_name,
                **metrics,
                "simulation_time_ms": simulation_time_ms,
            }
        )

    return {
        "status": "success",
        "data": results,
    }


@app.post("/api/runs")
def save_run_endpoint(request: SaveRunRequest):
    name = request.name.strip() if request.name else None
    try:
        run_id = save_run(request, request.data, name or None)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        "status": "success",
        "run_id": run_id,
    }


@app.get("/api/runs")
def get_runs(limit: int = Query(25, ge=1, le=100), offset: int = Query(0, ge=0)):
    return list_runs(limit, offset)


@app.get("/api/runs/{run_id}")
def get_run_endpoint(run_id: int):
    run = get_run(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Simulation run not found")
    return run


@app.delete("/api/runs/{run_id}")
def delete_run_endpoint(run_id: int):
    if not delete_run(run_id):
        raise HTTPException(status_code=404, detail="Simulation run not found")
    return {"status": "success"}
