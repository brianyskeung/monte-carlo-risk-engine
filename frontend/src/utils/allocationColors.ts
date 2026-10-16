// Allocation slices are shaded along a single mint ramp: the smallest weight
// in the portfolio gets the lightest tint, the largest gets the darkest.
const LIGHT_COLOR = { r: 0xe9, g: 0xfb, b: 0xf4 };
const DARK_COLOR = { r: 0x04, g: 0x78, b: 0x57 };

/** Blends the two ramp endpoints; t is clamped to 0-1. */
function interpolateColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(LIGHT_COLOR.r + (DARK_COLOR.r - LIGHT_COLOR.r) * clamped);
  const g = Math.round(LIGHT_COLOR.g + (DARK_COLOR.g - LIGHT_COLOR.g) * clamped);
  const b = Math.round(LIGHT_COLOR.b + (DARK_COLOR.b - LIGHT_COLOR.b) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Smallest and largest weight in a portfolio, used to scale the ramp. */
export function getWeightRange(weights: number[]): { min: number; max: number } {
  if (weights.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...weights), max: Math.max(...weights) };
}

/** Ramp colour for one weight, relative to the portfolio weight range. */
export function getAllocationColor(
  weight: number,
  minWeight: number,
  maxWeight: number,
): string {
  if (maxWeight <= minWeight) return interpolateColor(1);
  return interpolateColor((weight - minWeight) / (maxWeight - minWeight));
}
