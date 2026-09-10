export function formatPercent(value: number) {
  const percent = value * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

// loss_var_95 / loss_cvar_95 are stored as a positive loss magnitude;
// negate so losses read as negative
export function formatLossPercent(lossMagnitude: number) {
  return formatPercent(-lossMagnitude);
}

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

export function formatAssetType(quoteType: string) {
  const normalized = quoteType.trim().toUpperCase();
  if (ASSET_TYPE_LABELS[normalized]) return ASSET_TYPE_LABELS[normalized];

  return normalized
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
