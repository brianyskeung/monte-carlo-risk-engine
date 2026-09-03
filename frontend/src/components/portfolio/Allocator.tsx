import { Trash2 } from "lucide-react";
import type { Allocation } from "../../types";

export default function Allocator({
  allocations,

  setAllocations,
}: {
  allocations: Allocation[];

  setAllocations: (allocations: Allocation[]) => void;
}) {
  const updateWeight = (index: number, nextWeight: number) => {
    const otherWeight = allocations.reduce(
      (sum, allocation, allocationIndex) =>
        allocationIndex === index ? sum : sum + allocation.weight,
      0,
    );
    const maximumWeight = Math.max(0, 100 - otherWeight);
    const weight = Math.min(Math.max(0, nextWeight), maximumWeight);
    const updatedAllocations = [...allocations];

    updatedAllocations[index] = {
      ...updatedAllocations[index],
      weight,
    };

    setAllocations(updatedAllocations);
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white/45 p-4">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Portfolio Allocation
        </label>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-emerald-700">
          {allocations.reduce((sum, allocation) => sum + allocation.weight, 0)}%
        </span>
      </div>

      <div className="space-y-2.5">
        {allocations.map((allocation, index) => (
          <div
            key={index}
            className="flex gap-2 rounded-xl bg-white/70 p-1.5 shadow-sm ring-1 ring-black/5"
          >
            <input
              type="text"
              value={allocation.ticker}
              onChange={(event) => {
                const updatedAllocations = [...allocations];

                updatedAllocations[index] = {
                  ...updatedAllocations[index],
                  ticker: event.target.value.toUpperCase(),
                };

                setAllocations(updatedAllocations);
              }}
              placeholder="Ticker"
              className="min-w-0 flex-1 rounded-lg border-0 bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-text-muted/60 focus:ring-2 focus:ring-mint/20"
              required
            />

            <input
              type="range"
              min="0"
              max={Math.max(
                0,
                100 -
                  allocations.reduce(
                    (sum, currentAllocation, allocationIndex) =>
                      allocationIndex === index
                        ? sum
                        : sum + currentAllocation.weight,
                    0,
                  ),
              )}
              step="1"
              value={allocation.weight}
              onChange={(event) =>
                updateWeight(index, Number(event.target.value))
              }
              aria-label={`${allocation.ticker || "Asset"} allocation weight`}
              className="min-w-20 flex-1 cursor-pointer accent-mint"
            />

            <input
              type="number"
              min="0"
              max={Math.max(
                0,
                100 -
                  allocations.reduce(
                    (sum, currentAllocation, allocationIndex) =>
                      allocationIndex === index
                        ? sum
                        : sum + currentAllocation.weight,
                    0,
                  ),
              )}
              value={allocation.weight === 0 ? "" : allocation.weight}
              onChange={(event) => {
                const nextWeight =
                  event.target.value === "" ? 0 : Number(event.target.value);
                updateWeight(
                  index,
                  Number.isFinite(nextWeight) ? nextWeight : 0,
                );
              }}
              className="w-24 rounded-lg border-0 bg-bg/70 px-2.5 py-2 text-right text-sm outline-none focus:ring-2 focus:ring-mint/20"
              required
            />

            <button
              type="button"
              onClick={() =>
                setAllocations(
                  allocations.filter(
                    (_, allocationIndex) => allocationIndex !== index,
                  ),
                )
              }
              className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-rose-50 hover:text-coral"
              title={`Remove ${allocation.ticker || "asset"}`}
              aria-label={`Remove ${allocation.ticker || "asset"}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setAllocations([...allocations, { ticker: "", weight: 0 }])
        }
        className="mt-4 cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-mint transition-colors hover:bg-emerald-50"
      >
        + Add asset
      </button>
    </div>
  );
}
