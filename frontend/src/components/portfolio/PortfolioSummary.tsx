import type { Allocation } from "../../types";

type PortfolioSummaryProps = {
  allocations: Allocation[];
  quoteTypes: Record<string, string>;
  onEdit: () => void;
};

export default function PortfolioSummary({
  allocations,
  quoteTypes,
  onEdit,
}: PortfolioSummaryProps) {
  const exposureByType = allocations.reduce<Record<string, number>>(
    (summary, allocation) => {
      const type = quoteTypes[allocation.ticker] ?? "OTHER";

      summary[type] = (summary[type] ?? 0) + allocation.weight;
      return summary;
    },
    {},
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Portfolio Exposure</h3>

        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-mint hover:"
        >
          Edit portfolio
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {Object.entries(exposureByType).map(([type, weight]) => (
          <div key={type} className="flex justify-between text-sm">
            <span>{type}</span>
            <span>{weight.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
