# monte carlo risk engine

> a full-stack portfolio simulator and historical bootstrapping engine.

an interactive risk analytics tool designed to model multi-asset portfolio trajectories under historical market distributions. runs correlated monte carlo scenario simulations across five selectable models to quantify tail risk, drawdowns, and distribution percentiles.

---

### what it does

- **custom allocations:** pick your tickers and assign portfolio weights.
- **simulation models:** compare historical bootstrap, geometric Brownian motion, block bootstrap, Merton jump diffusion, and Heston stochastic volatility side by side — pick any combination to run per simulation.
- **correlated resampling:** the bootstrap-based models resample historical daily returns across all assets on the exact same days (or same contiguous blocks), keeping real-world correlation between assets intact.
- **risk metrics:** calculates expected terminal value, 95% value-at-risk (var), and conditional var (cvar / expected shortfall) per model.
- **percentile paths:** generates p5 to p95 fan-charts so you can visualize the spread of best and worst-case scenarios, with a per-chart and a maximize-all fullscreen view.
- **ticker validation:** checks if a ticker is real and grabs its basic info for the frontend.
- **asset metadata:** provides quote type, industry, sector, exchange, currency, and validity information for each ticker.
- **local portfolio saving:** saves the current allocation list in the browser and restores it after refresh.
- **run history:** automatically saves completed simulations and lets you reopen their metrics and percentile charts, search/filter saved runs by name, ticker, or model, and view full run details in a dedicated modal. saved run names must be unique.

---

### tech stack

| layer        | tech                                                                                                  |
| :----------- | :---------------------------------------------------------------------------------------------------- |
| **backend**  | python 3.11+, fastapi, pydantic, numpy, pandas, yfinance, sqlite (libSQL/Turso in production), pytest |
| **frontend** | react 19, typescript, vite, tailwind css, recharts, axios                                             |
| **models**   | historical bootstrap, geometric Brownian motion, block bootstrap, Merton jump diffusion, Heston stochastic volatility |

#### available models

| model id                    | name                      | approach                                                                                            |
| :-------------------------- | :------------------------ | :-------------------------------------------------------------------------------------------------- |
| `historical_bootstrap`      | Historical Bootstrap      | resamples historical daily return rows with replacement, preserving cross-asset correlation         |
| `geometric_brownian_motion` | Geometric Brownian Motion | fits a multivariate normal distribution to historical log returns                                   |
| `block_bootstrap`           | Block Bootstrap           | resamples contiguous multi-day blocks instead of single days, preserving volatility clustering      |
| `jump_diffusion`            | Jump Diffusion (Merton)   | GBM diffusion plus a per-asset compound-Poisson jump component, calibrated from historical outliers |
| `heston`                    | Heston                    | mean-reverting stochastic volatility (CIR variance process) per asset, with a calibrated leverage correlation between price and volatility shocks and cross-asset price correlation from historical returns |

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
│   │   ├── base.py             # abstract engine class
│   │   ├── bootstrap.py        # historical bootstrap logic
│   │   ├── gbm.py               # geometric Brownian motion logic
│   │   ├── block_bootstrap.py  # multi-day block resampling logic
│   │   ├── jump_diffusion.py   # Merton jump-diffusion logic
│   │   └── heston.py           # Heston stochastic-volatility logic
│   └── tests/               # pytest suite
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── simulation/    # form, charts, run history
    │   │   ├── portfolio/     # allocation editor & charts
    │   │   ├── layout/        # shell, sidebar, top bar
    │   │   └── ui/            # shared primitives (modal header, scroll area, search input)
    │   ├── hooks/             # useSimulation, useAssets
    │   ├── constants/         # model & lookback-period option lists
    │   └── utils/             # formatting & validation helpers
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
  "models": ["historical_bootstrap", "geometric_brownian_motion"],
  "lookback_period": "5y",
  "forecasted_days": 252,
  "num_simulations": 1000
}
```

`models` accepts any combination of `historical_bootstrap`, `geometric_brownian_motion`, `block_bootstrap`, `jump_diffusion`, and `heston`; if omitted from the request, the API defaults to the first two. The frontend always sends this field explicitly and only pre-selects `historical_bootstrap` by default. `forecasted_days` must be greater than 0 and at most `7560`; `num_simulations` must be greater than 0 and at most `100000`.

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
          "loss_cvar_95": 0.2018,
          "forecasted_days": 252
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

A completed simulation is saved by explicitly `post`ing it (along with the response `data`) to `/api/runs`. Saved runs are persisted to a Turso (libSQL) database when `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set — this is what production (e.g. Vercel) uses, since local disk isn't persistent there. Without those set, it falls back to a local SQLite file at `backend/data/simulation_runs.sqlite3` (excluded from Git; set `SIMULATION_DB_PATH` to place it elsewhere).

| endpoint                          | purpose                                              |
| :-------------------------------- | :--------------------------------------------------- |
| `post /api/runs`                  | save a completed simulation, optionally with a name  |
| `get /api/runs?limit=25&offset=0` | list saved runs, newest first                        |
| `get /api/runs/{run_id}`          | load one run's inputs, metrics, and percentile paths |
| `delete /api/runs/{run_id}`       | permanently delete a saved run                       |

Run names are optional but must be unique (case-insensitive) — saving with a name that already exists returns `400`. Unnamed runs never collide with each other.

The frontend exposes these in the **Saved runs** panel beside the distribution results, which can be expanded into a full search-and-filter modal (filter by model, search by name/ticker) and maximized per-run to see full portfolio, model, and horizon details before opening it.

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

#### `get /api/tickers/search`

returns the closest matching tickers for a partial query, for autocomplete while allocating a ticker to the portfolio.

- **query parameters**

| parameter | type     | required | description                                |
| :-------- | :------- | :------- | :------------------------------------------ |
| `q`       | `string` | yes      | partial ticker or company name to match on |
| `limit`   | `int`    | no       | max results to return, 1-20 (default 8)    |

- **example request**

```http
GET /api/tickers/search?q=appl&limit=5 HTTP/1.1
Host: localhost:8000
Accept: application/json
```

- **response body**

```json
{
  "matches": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "quote_type": "EQUITY"
    }
  ]
}
```

The frontend calls this endpoint (debounced) as you type into a ticker field in the portfolio allocator, showing a dropdown of the closest matches to pick from.

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
- project is being actively developed
