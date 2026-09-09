export function formatPercent(value: number) {
  const percent = value * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

// loss_var_95 / loss_cvar_95 are stored as a positive loss magnitude;
// negate so losses read as negative like every other return figure
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
