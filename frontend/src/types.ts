/** One portfolio holding: a ticker and its weight in percent (0-100). */
export interface Allocation {
  ticker: string;
  weight: number;
}

/** Identifiers of the simulation models the backend can run. */
export type ModelId =
  | "historical_bootstrap"
  | "geometric_brownian_motion"
  | "block_bootstrap"
  | "jump_diffusion"
  | "heston";

/** One day of the percentile fan chart. Values are net returns (0.05 = +5%). */
export interface PathData {
  day: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  mean: number;
}

/** Headline risk/return figures for a single model run. */
export interface SimulationSummary {
  expected_terminal_value: number;
  expected_return: number;
  loss_var_95: number;
  loss_cvar_95: number;
  forecasted_days: number;
}

/** Everything one model produced: summary stats plus its percentile paths. */
export interface ModelResult {
  model_id: ModelId;
  display_name: string;
  summary: SimulationSummary;
  percentile_paths: PathData[];
  simulation_time_ms: number;
}

/** Response payload of POST /api/simulate. */
export interface SimulationResults {
  models: ModelResult[];
}

/** Metadata for a persisted run, as returned by the saved-run list. */
export interface SavedRun {
  id: number;
  created_at: string;
  name: string | null;
  tickers: string[];
  weights: Record<string, number>;
  models: ModelId[];
  lookback_period: string;
  forecasted_days: number;
  num_simulations: number;
}

/** A saved run plus the stored chart data needed to re-render it. */
export interface SavedRunDetail extends SavedRun {
  data: SimulationResults;
}

/** Reference data for one ticker, looked up by the backend via yfinance. */
export interface AssetInfo {
  symbol: string;
  short_name: string | null;
  quote_type: string;
  sector: string | null;
  exchange: string | null;
  currency: string | null;
  is_valid: boolean;
}

/** Asset reference data keyed by uppercase ticker. */
export type AssetInfoMap = Record<string, AssetInfo>;

/** One autocomplete suggestion from the ticker search endpoint. */
export interface TickerMatch {
  symbol: string;
  name: string | null;
  exchange: string | null;
  quote_type: string;
}
