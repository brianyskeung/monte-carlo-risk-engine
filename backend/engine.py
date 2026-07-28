import yfinance as yf
import numpy as np
import pandas as pd

# runs the monte carlo simulation using selected ticke
def monte_carlo_sim(
    portfolio: dict[str, float] =  {"NVDA": 1.0},
    initial_capital: float = 10000.0,
    target_goal: float = 11000.0,
    downside_limit: float = 8500.0,
    forecasted_days: int = 252,
    num_simulations: int = 1000
) -> dict:
    
   pass