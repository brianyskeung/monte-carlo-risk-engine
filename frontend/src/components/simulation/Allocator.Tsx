import type { Allocation } from "../../types";

export default function Allocator({
  allocations,
  setAllocations,
}: {
  allocations: Allocation[];
  setAllocations: (allocations: Allocation[]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-text-muted">
          Portfolio Allocation
        </label>

        <span className="text-xs text-text-muted">
          {allocations.reduce((sum, allocation) => sum + allocation.weight, 0)}%
        </span>
      </div>

      <div className="space-y-2">
        {allocations.map((allocation, index) => (
          <div key={index} className="flex gap-2">
            <select
              value={allocation.ticker}
              onChange={(event) => {
                const updatedAllocations = [...allocations];
                updatedAllocations[index] = {
                  ...updatedAllocations[index],
                  ticker: event.target.value,
                };
                setAllocations(updatedAllocations);
              }}
              className="flex-1 bg-bg border border-black/10 rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Select asset</option>
              <option value="SPY">SPY</option>
              <option value="QQQ">QQQ</option>
              <option value="AAPL">AAPL</option>
              <option value="MSFT">MSFT</option>
            </select>

            <input
              type="number"
              min="0"
              max="100"
              value={allocation.weight}
              onChange={(event) => {
                const updatedAllocations = [...allocations];
                updatedAllocations[index] = {
                  ...updatedAllocations[index],
                  weight: Number(event.target.value),
                };
                setAllocations(updatedAllocations);
              }}
              className="w-24 bg-bg border border-black/10 rounded-lg px-3 py-2 text-sm"
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
        className="mt-3 text-sm text-mint"
      >
        + Add asset
      </button>
    </div>
  );
}
