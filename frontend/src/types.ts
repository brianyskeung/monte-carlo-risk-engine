export interface Allocation {
  ticker: string;
  weight: number;
}

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

export interface SimulationResults {
  summary: SimulationSummary;
  percentile_paths: PathData[];
  quote_types: Record<string, string>;
}
