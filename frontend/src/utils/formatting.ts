/** Formats a millisecond duration, switching to seconds past 1000 ms. */
export function formatDurationMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${ms.toFixed(2)} ms`;
}

/** Formats a decimal ratio as a signed percentage (0.0512 -> "+5.12%"). */
export function formatPercent(value: number, decimals = 2) {
  const percent = value * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(decimals)}%`;
}

/**
 * Formats a loss metric as a percentage. loss_var_95 / loss_cvar_95 are
 * stored as positive loss magnitudes, so negate them to read as losses.
 */
export function formatLossPercent(lossMagnitude: number) {
  return formatPercent(-lossMagnitude);
}

/** Maps the sign of a value to the tone used for colouring numbers. */
export function getReturnTone(
  value: number,
): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

// quote_type values come straight from yfinance (e.g. "MUTUALFUND"); map the
// ones we know about to a readable label and title-case anything else.
const ASSET_TYPE_LABELS: Record<string, string> = {
  EQUITY: "Stock",
  ETF: "ETF",
  CRYPTOCURRENCY: "Cryptocurrency",
  MUTUALFUND: "Mutual Fund",
  INDEX: "Index",
  CURRENCY: "Currency",
  FUTURE: "Future",
  OPTION: "Option",
  UNKNOWN: "Unknown",
};

/** Readable label for a raw quote_type value. */
export function formatAssetType(quoteType: string) {
  const normalized = quoteType.trim().toUpperCase();
  if (ASSET_TYPE_LABELS[normalized]) return ASSET_TYPE_LABELS[normalized];

  return normalized
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
