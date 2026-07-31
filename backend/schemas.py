from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    tickers: list[str] = Field(..., description="List of ticker symbols")
    weights: dict[str, float] = Field(..., description="Portfolio weights per ticker")
    forecasted_days: int = Field(252, gt=0, description="Trading days to project forward")
    num_simulations: int = Field(1000, gt=0, le=10000, description="Number of Monte Carlo paths")