export interface Allocation {
  ticker: string;
  weight: number;
}

export type ModelId = "historical_bootstrap" | "geometric_brownian_motion";

export interface PathData {
  day: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  mean: number;
}

export interface SimulationSummary {
  expected_terminal_value: number;
  expected_return: number;
  loss_var_95: number;
  loss_cvar_95: number;
}

export interface ModelResult {
  model_id: ModelId;
  display_name: string;
  summary: SimulationSummary;
  percentile_paths: PathData[];
  simulation_time_ms: number;
}

export interface SimulationResults {
  models: ModelResult[];
}

export interface AssetInfo {
  symbol: string;
  short_name: string | null;
  quote_type: string;
  exchange: string | null;
  currency: string | null;
  is_valid: boolean;
}

export type AssetInfoMap = Record<string, AssetInfo>;
