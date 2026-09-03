import type { Allocation } from "../../types";

export default function Allocator({
  allocations,

  setAllocations,
}: {
  allocations: Allocation[];

  setAllocations: (allocations: Allocation[]) => void;
}) {
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
              type="number"
              min="0"
              max="100"
              value={allocation.weight === 0 ? "" : allocation.weight}
              onChange={(event) => {
                const updatedAllocations = [...allocations];

                updatedAllocations[index] = {
                  ...updatedAllocations[index],

                  weight:
                    event.target.value === "" ? 0 : Number(event.target.value),
                };

                setAllocations(updatedAllocations);
              }}
              className="w-24 rounded-lg border-0 bg-bg/70 px-2.5 py-2 text-right text-sm outline-none focus:ring-2 focus:ring-mint/20"
              required
            />
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
