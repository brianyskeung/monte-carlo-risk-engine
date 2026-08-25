# monte carlo risk engine

> a full-stack portfolio simulator and historical bootstrapping engine.

an interactive risk analytics tool designed to model multi-asset portfolio trajectories under historical market distributions. runs correlated monte carlo scenario simulations to quantify tail risk, drawdowns, and distribution percentiles. i intend to add more models later on.

---

### what it does

- **custom allocations:** pick your tickers and assign portfolio weights.
- **correlated bootstrapping:** resamples historical daily returns across all assets on the exact same days. this keeps the real-world correlation between your assets intact.
- **risk metrics:** calculates expected terminal value, 95% value-at-risk (var), and conditional var (cvar / expected shortfall).
- **percentile paths:** generates p5 to p95 fan-charts so you can visualize the spread of best and worst-case scenarios.
- **ticker validation:** checks if a ticker is real and grabs its quote type (etf, crypto, stock) for the frontend.

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

- **request body**

```json
{
  "tickers": ["SPY", "QQQ"],
  "weights": {
    "SPY": 0.6,
    "QQQ": 0.4
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
    "summary": {
      "expected_terminal_value": 1.1084,
      "expected_return": 0.1084,
      "loss_var_95": 0.1421,
      "loss_cvar_95": 0.2018
    },
    "percentile_paths": [
      {
        "day": 1,
        "p5": 1.0,
        "p25": 1.0,
        "p50": 1.0,
        "p75": 1.0,
        "p95": 1.0,
        "mean": 1.0
      },
      {
        "day": 2,
        "p5": 0.998,
        "p25": 1.002,
        "p50": 1.004,
        "p75": 1.007,
        "p95": 1.012,
        "mean": 1.005
      }
    ]
  }
}
```

---

#### `get /api/assets`

grabs the security information used for ui tags and basic validation.

- **query parameters**

| parameter | type       | required | description                                                          |
| :-------- | :--------- | :------- | :------------------------------------------------------------------- |
| `tickers` | `string[]` | yes      | repeat the key for each ticker, for example ?tickers=SPY&tickers=QQQ |

- **example request**

```http
GET /api/assets?tickers=SPY&tickers=QQQ&tickers=BTC-USD HTTP/1.1
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
      "exchange": "NYQ",
      "currency": "USD",
      "is_valid": true
    },
    "QQQ": {
      "symbol": "QQQ",
      "short_name": "Invesco QQQ Trust",
      "quote_type": "ETF",
      "exchange": "NMS",
      "currency": "USD",
      "is_valid": true
    },
    "BTC-USD": {
      "symbol": "BTC-USD",
      "short_name": "Bitcoin USD",
      "quote_type": "CRYPTOCURRENCY",
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
pytest -v
```

---

### a quick note

- **portfolio:** the monte carlo engine is _long-only_, meaning it only applies to investment portfolios that buy and hold assets
- **disclaimer:** this is built for exploratory scenario testing. it is not actual financial advice.
- project is in development, it is incomplete
