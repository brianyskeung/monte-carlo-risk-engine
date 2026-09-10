import type { ModelId } from "../types";

export interface ModelOption {
  id: ModelId;
  name: string;
  description: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "historical_bootstrap",
    name: "Historical Bootstrap",
    description: "Resamples observed market return patterns.",
  },
  {
    id: "geometric_brownian_motion",
    name: "Geometric Brownian Motion",
    description: "Fits a statistical distribution to historical returns.",
  },
  {
    id: "block_bootstrap",
    name: "Block Bootstrap",
    description: "Resamples multi-day chunks to preserve volatility clustering.",
  },
  {
    id: "jump_diffusion",
    name: "Jump Diffusion (Merton)",
    description: "Adds sudden crash/spike risk on top of a diffusion model.",
  },
];

export function getModelLabel(modelId: ModelId): string {
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.name ?? modelId;
}

export const LOOKBACK_LABELS: Record<string, string> = {
  "1mo": "1 month",
  "3mo": "3 months",
  "6mo": "6 months",
  "1y": "1 year",
  "2y": "2 years",
  "5y": "5 years",
  "10y": "10 years",
  max: "Maximum available",
};

export function getLookbackLabel(period: string): string {
  return LOOKBACK_LABELS[period] ?? period;
}
