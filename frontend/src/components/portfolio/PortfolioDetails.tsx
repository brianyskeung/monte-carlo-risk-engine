import type { Allocation, AssetInfoMap } from "../../types";

type PortfolioDetailsProps = {
  allocations: Allocation[];
  assets: AssetInfoMap;
};

export default function PortfolioDetails({
  allocations,
  assets,
}: PortfolioDetailsProps) {
  const totalWeight = allocations.reduce(
    (sum, allocation) => sum + allocation.weight,
    0,
  );
  const topHolding = [...allocations].sort((a, b) => b.weight - a.weight)[0];
  const sectorDetails = allocations.reduce<
    Record<string, { weight: number; holdings: number }>
  >((summary, allocation) => {
    const sector = assets[allocation.ticker]?.sector || "Non-sectors assets";

    summary[sector] = {
      weight: (summary[sector]?.weight ?? 0) + allocation.weight,
      holdings: (summary[sector]?.holdings ?? 0) + 1,
    };

    return summary;
  }, {});

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-black/5 bg-slate-50/70 p-4">
      <p className="shrink-0 text-xs font-semibold uppercase tracking-label text-text-muted">
        Portfolio details
      </p>

      <dl className="mt-4 shrink-0 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Holdings</dt>
          <dd className="font-semibold text-text-primary">
            {allocations.length}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Allocated</dt>
          <dd className="font-semibold text-text-primary">
            {totalWeight.toFixed(1)}%
          </dd>
        </div>
        {topHolding && (
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Largest holding</dt>
            <dd className="text-right font-semibold text-text-primary">
              {topHolding.ticker || "Unnamed"} ({topHolding.weight.toFixed(1)}%)
            </dd>
          </div>
        )}
      </dl>

      {Object.keys(sectorDetails).length > 0 && (
        <div className="mt-6 flex min-h-0 flex-1 flex-col border-t border-black/5 pt-4">
          <p className="shrink-0 text-xs font-semibold uppercase tracking-label text-text-muted">
            Sector investment
          </p>
          <div className="scroll-area mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {Object.entries(sectorDetails)
              .sort(([, a], [, b]) => b.weight - a.weight)
              .map(([sector, details]) => (
              <div
                key={sector}
                className="rounded-lg bg-white/60 px-3 py-2.5 text-sm"
              >
                <div className="flex justify-between gap-4">
                  <span className="font-medium text-text-primary">
                    {sector}
                  </span>
                  <span className="font-semibold text-mint">
                    {details.weight.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {details.holdings}{" "}
                  {details.holdings === 1 ? "holding" : "holdings"} in this
                  sector.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
