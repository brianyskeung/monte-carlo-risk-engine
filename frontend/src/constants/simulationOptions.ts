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
    description:
      "Generates simulated price paths by randomly resampling individual historical returns with replacement.",
  },
  {
    id: "geometric_brownian_motion",
    name: "Geometric Brownian Motion",
    description:
      "Models price paths as a continuous-time stochastic process assuming constant drift and volatility.",
  },
  {
    id: "block_bootstrap",
    name: "Block Bootstrap",
    description:
      "Resamples sequential blocks of historical returns to preserve autocorrelation and volatility clustering.",
  },
  {
    id: "jump_diffusion",
    name: "Jump Diffusion (Merton)",
    description:
      "Extends standard diffusion models by incorporating discrete, random jumps to account for extreme market shocks.",
  },
  {
    id: "heston",
    name: "Heston",
    description:
      "Simulates price paths with a mean-reverting stochastic volatility process, capturing volatility clustering and the leverage effect.",
  },
];

export function getModelLabel(modelId: ModelId): string {
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.name ?? modelId;
}

export function getModelDescription(modelId: ModelId): string {
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.description ?? "";
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
