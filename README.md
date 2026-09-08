# monte carlo risk engine

> a full-stack portfolio simulator and historical bootstrapping engine.

an interactive risk analytics tool designed to model multi-asset portfolio trajectories under historical market distributions. runs correlated monte carlo scenario simulations to quantify tail risk, drawdowns, and distribution percentiles. i intend to add more models later on.

---

### what it does

- **custom allocations:** pick your tickers and assign portfolio weights.
- **correlated bootstrapping:** resamples historical daily returns across all assets on the exact same days. this keeps the real-world correlation between your assets intact.
- **risk metrics:** calculates expected terminal value, 95% value-at-risk (var), and conditional var (cvar / expected shortfall).
- **percentile paths:** generates p5 to p95 fan-charts so you can visualize the spread of best and worst-case scenarios.
- **ticker validation:** checks if a ticker is real and grabs its basic info for the frontend.
- **asset metadata:** provides quote type, industry, sector, exchange, currency, and validity information for each ticker.
- **local portfolio saving:** saves the current allocation list in the browser and restores it after refresh.
- **run history:** automatically saves completed simulations locally and lets you reopen their metrics and percentile charts.

---

### tech stack

| layer        | tech                                                             |
| :----------- | :--------------------------------------------------------------- |
| **backend**  | python 3.11+, fastapi, pydantic, numpy, pandas, yfinance, pytest |
| **frontend** | react 19, typescript, vite, tailwind css, recharts, axios        |
| **model**    | historical bootstrap (multivariate resampling with replacement)  |

---

### project structure

```text
monte-carlo-risk-engine/
├── backend/
│   ├── main.py              # fastapi app & route endpoints
│   ├── schemas.py           # pydantic models for validation
│   ├── database.py          # SQLite-backed completed simulation history
│   ├── data/
│   │   └── fetcher.py       # yfinance data fetching & quote lookups
│   ├── engine/
│   │   └── engine.py        # core monte carlo path generator
│   ├── metrics/
│   │   └── risk.py          # calculates var, cvar, and percentiles
│   ├── models/
│   │   ├── base.py          # abstract engine class
│   │   └── bootstrap.py     # historical bootstrap logic
│   └── tests/               # pytest suite
└── frontend/
    ├── src/                 # react components, hooks, charts
    └── package.json
```

---

### api reference

#### `post /api/simulate`

runs the monte carlo simulation based on your requested weights and timeframe.

The frontend starts with an empty portfolio. Add at least one asset before running a simulation. Portfolio allocations are saved locally in the browser under the `monte-carlo-risk-engine:portfolio` storage key.

- **request body**

```json
{
  "tickers": ["SPY", "NVDA"],
  "weights": {
    "SPY": 0.6,
    "NVDA": 0.4
  },
  "lookback_period": "5y",
  "forecasted_days": 252,
  "num_simulations": 1000
}
```

- **response body**

```json
{
  "status": "success",
  "data": {
    "models": [
      {
        "model_id": "historical_bootstrap",
        "display_name": "Historical Bootstrap",
        "summary": {
          "expected_terminal_value": 1.1084,
          "expected_return": 0.1084,
          "loss_var_95": 0.1421,
          "loss_cvar_95": 0.2018
        },
        "percentile_paths": [
          {
            "day": 1,
            "p5": 0.98,
            "p25": 0.995,
            "p50": 1.002,
            "p75": 1.01,
            "p95": 1.025,
            "mean": 1.003
          },
          {
            "day": 2,
            "p5": 0.97,
            "p25": 0.99,
            "p50": 1.005,
            "p75": 1.018,
            "p95": 1.04,
            "mean": 1.007
          }
        ],
        "simulation_time_ms": 12.5
      }
    ]
  }
}
```

---

#### saved runs

Every successful `post /api/simulate` response includes a `run_id` and is stored in a local SQLite database at `backend/data/simulation_runs.sqlite3`. The database is excluded from Git. Set `SIMULATION_DB_PATH` to place it elsewhere.

| endpoint | purpose |
| :--- | :--- |
| `get /api/runs?limit=25&offset=0` | list saved runs, newest first |
| `get /api/runs/{run_id}` | load one run's inputs, metrics, and percentile paths |
| `delete /api/runs/{run_id}` | permanently delete a saved run |

The frontend exposes these in the **Saved runs** card beside the distribution results.

---

#### `get /api/assets`

grabs the security information used for ui tags and basic validation.

- **query parameters**

| parameter | type       | required | description                                                           |
| :-------- | :--------- | :------- | :-------------------------------------------------------------------- |
| `tickers` | `string[]` | yes      | repeat the key for each ticker, for example ?tickers=SPY&tickers=NVDA |

- **example request**

```http
GET /api/assets?tickers=SPY&tickers=NVDA&tickers=BTC-USD HTTP/1.1
Host: localhost:8000
Accept: application/json
```

- **response body**

```json
{
  "assets": {
    "SPY": {
      "symbol": "SPY",
      "short_name": "SPDR S&P 500 ETF Trust",
      "quote_type": "ETF",
      "industry": null,
      "sector": "Financial Services",
      "exchange": "NYQ",
      "currency": "USD",
      "is_valid": true
    },
    "NVDA": {
      "symbol": "NVDA",
      "short_name": "NVIDIA Corporation",
      "quote_type": "STOCK",
      "industry": "Semiconductors",
      "sector": "Technology",
      "exchange": "NMS",
      "currency": "USD",
      "is_valid": true
    },
    "BTC-USD": {
      "symbol": "BTC-USD",
      "short_name": "Bitcoin USD",
      "quote_type": "CRYPTOCURRENCY",
      "industry": null,
      "sector": null,
      "exchange": "CCC",
      "currency": "USD",
      "is_valid": true
    }
  }
}
```

---

### getting started

#### backend setup

```bash
cd backend
python -m venv .venv

# macos / linux
source .venv/bin/activate

# windows powershell
./.venv/Scripts/Activate.ps1

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- local api: `http://localhost:8000`
- docs: `http://localhost:8000/docs`

#### frontend setup

```bash
cd frontend
npm install
npm run dev
```

- web app: `http://localhost:5173`

---

### running tests

```bash
cd backend
python -m pytest -v
```

---

### a quick note

- **portfolio:** the monte carlo engine is _long-only_, meaning it only applies to investment portfolios that buy and hold assets
- **disclaimer:** this is built for exploratory scenario testing. it is not actual financial advice.
- project is in development, it is incomplete
