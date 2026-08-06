import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import SimulationRequest
from data import get_historical_returns
from engine import SimulationEngine
from models import HistoricalBootstrapModel
from metrics import calculate_portfolio_metrics

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

@app.post("/api/simulate")
def run_simulation(request: SimulationRequest):
    # download market data
    daily_returns_df = get_historical_returns(request.tickers)

    # initialize model using values matrix & ticker sequence
    model = HistoricalBootstrapModel(
        daily_returns=daily_returns_df.values,
        tickers=list(daily_returns_df.columns)
    )

    # instantiate simulation engine
    engine = SimulationEngine(model=model)

    # execute simulation and catch engine validation errors
    try:
        simulated_paths = engine.run(
            weights=request.weights,
            num_simulations=request.num_simulations,
            forecasted_days=request.forecasted_days
        )
    except ValueError as e:
        
        raise HTTPException(status_code=400, detail=str(e))
    
    results = calculate_portfolio_metrics(simulated_paths)

    return {
        "status": "success",
        "data": results
    }