import type { Allocation } from "../types";

const TARGET_ALLOCATION = 100;
const ALLOCATION_TOLERANCE = 0.0001;

export function validatePortfolioAllocations(
  allocations: Allocation[],
): string | null {
  const tickerCounts = allocations.reduce<Record<string, number>>(
    (counts, allocation) => {
      const ticker = allocation.ticker.trim().toUpperCase();
      if (ticker) counts[ticker] = (counts[ticker] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const duplicateTickers = Object.entries(tickerCounts)
    .filter(([, count]) => count > 1)
    .map(([ticker]) => ticker);

  if (duplicateTickers.length > 0) {
    return `Duplicate ticker${duplicateTickers.length > 1 ? "s" : ""}: ${duplicateTickers.join(", ")}. Remove duplicates before saving.`;
  }

  const totalWeight = allocations.reduce(
    (sum, allocation) => sum + allocation.weight,
    0,
  );
  if (Math.abs(totalWeight - TARGET_ALLOCATION) > ALLOCATION_TOLERANCE) {
    return `Portfolio allocation must equal 100%. Current total: ${totalWeight.toFixed(1)}%.`;
  }

  return null;
}
