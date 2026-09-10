import type { Allocation } from "../../types";
import SectionHeader from "../ui/SectionHeader";
import AllocationRow from "./AllocationRow";

export default function Allocator({
  allocations,

  setAllocations,
}: {
  allocations: Allocation[];

  setAllocations: (allocations: Allocation[]) => void;
}) {
  const updateWeight = (index: number, nextWeight: number) => {
    const maximumWeight = getMaximumWeight(index);
    const weight = Math.min(Math.max(0, nextWeight), maximumWeight);
    const updatedAllocations = [...allocations];

    updatedAllocations[index] = {
      ...updatedAllocations[index],
      weight,
    };

    setAllocations(updatedAllocations);
  };

  const getMaximumWeight = (index: number) =>
    Math.max(
      0,
      100 -
        allocations.reduce(
          (sum, allocation, allocationIndex) =>
            allocationIndex === index ? sum : sum + allocation.weight,
          0,
        ),
    );

  const updateTicker = (index: number, ticker: string) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index] = {
      ...updatedAllocations[index],
      ticker,
    };
    setAllocations(updatedAllocations);
  };

  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/45 p-4">
      <SectionHeader
        label="Portfolio Allocation"
        value={`${allocations.reduce((sum, allocation) => sum + allocation.weight, 0)}%`}
      />

      <div className="scroll-area grid min-h-0 flex-1 content-start grid-cols-1 gap-2.5 overflow-y-auto pb-1 pl-1 sm:grid-cols-2">
        {allocations.map((allocation, index) => (
          <AllocationRow
            key={index}
            allocation={allocation}
            maximumWeight={getMaximumWeight(index)}
            onTickerChange={(ticker) => updateTicker(index, ticker)}
            onWeightChange={(weight) => updateWeight(index, weight)}
            onRemove={() =>
              setAllocations(
                allocations.filter(
                  (_, allocationIndex) => allocationIndex !== index,
                ),
              )
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setAllocations([...allocations, { ticker: "", weight: 0 }])
        }
        className="mt-4 shrink-0 cursor-pointer rounded-lg px-2 py-1 text-sm font-medium text-mint transition-colors hover:bg-emerald-50"
      >
        + Add asset
      </button>
    </div>
  );
}
