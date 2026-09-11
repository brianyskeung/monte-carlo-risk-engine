from typing import Any, Literal
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    tickers: list[str] = Field(
        ..., min_length=1, description="List of ticker symbols"
    )
    weights: dict[str, float] = Field(
        ..., min_length=1, description="Portfolio weights per ticker"
    )
    models: list[Literal[
        "historical_bootstrap",
        "geometric_brownian_motion",
        "block_bootstrap",
        "jump_diffusion",
        "heston",
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
        le=7560,
        description="Trading days to project forward",
    )
    num_simulations: int = Field(
        1000,
        gt=0,
        le=100000,
        description="Number of Monte Carlo paths",
    )


class SaveRunRequest(SimulationRequest):
    data: dict[str, Any] = Field(
        ..., description="Simulation results produced by /api/simulate"
    )
    name: str | None = Field(
        None, max_length=200, description="Optional display name for the saved run"
    )