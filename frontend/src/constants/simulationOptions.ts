import type { ModelId } from "../types";

/** A selectable simulation model as presented in the UI. */
export interface ModelOption {
  id: ModelId;
  name: string;
  description: string;
}

/** Catalogue of models; drives the model pickers and the info modal. */
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

/** Display name for a model id, falling back to the raw id. */
export function getModelLabel(modelId: ModelId): string {
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.name ?? modelId;
}

/** Short model explanation, shown in the info modal. */
export function getModelDescription(modelId: ModelId): string {
  return MODEL_OPTIONS.find((model) => model.id === modelId)?.description ?? "";
}

/** Readable labels for the yfinance lookback period codes. */
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

/** Label for a lookback code (e.g. "5y" -> "5 years"). */
export function getLookbackLabel(period: string): string {
  return LOOKBACK_LABELS[period] ?? period;
}
