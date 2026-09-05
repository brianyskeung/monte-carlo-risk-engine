from typing import Literal
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    tickers: list[str] = Field(..., description="List of ticker symbols")
    weights: dict[str, float] = Field(..., description="Portfolio weights per ticker")
    models: list[Literal[
        "historical_bootstrap",
        "geometric_brownian_motion",
    ]] = Field(
        default_factory=lambda: [
            "historical_bootstrap",
            "geometric_brownian_motion",
        ],
        description="Simulation models to run",
    )
    lookback_period: Literal[
        "1mo",
        "3mo",
        "6mo",
        "1y",
        "2y",
        "5y",
        "10y",
        "max",
    ] = Field("5y", description="Historical data period used for bootstrapping")
    forecasted_days: int = Field(
        252,
        gt=0,
        description="Trading days to project forward",
    )
    num_simulations: int = Field(
        1000,
        gt=0,
        le=10000,
        description="Number of Monte Carlo paths",
    )