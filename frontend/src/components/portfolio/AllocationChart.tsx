import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import PortfolioTooltip from "./PortfolioTooltip";
import type { Allocation, AssetInfoMap } from "../../types";
import { formatAssetType } from "../../utils/formatting";
import { getAllocationColor, getWeightRange } from "../../utils/allocationColors";

/** Donut chart of portfolio weights with an optional holdings legend. */
export default function AllocationPieChart({
  allocations,
  assets,
  showLegend = true,
}: {
  allocations: Allocation[];
  assets: AssetInfoMap;
  showLegend?: boolean;
}) {
  const { min: minWeight, max: maxWeight } = getWeightRange(
    allocations.map((allocation) => Number(allocation.weight ?? 0)),
  );

  // largest slice first, so the colour ramp reads dark-to-light around the ring
  const chartData = [...allocations]
    .sort((a, b) => Number(b.weight) - Number(a.weight))
    .map((allocation) => {
      const asset =
        assets[allocation.ticker] ??
        assets[allocation.ticker.trim().toUpperCase()];
      const weight = Number(allocation.weight ?? 0);

      return {
        ...allocation,
        fill: getAllocationColor(weight, minWeight, maxWeight),
        assetName: asset?.short_name || allocation.ticker || "Unknown security",
        assetType: asset?.quote_type
          ? formatAssetType(asset.quote_type)
          : "Unknown type",
        assetSector: asset?.sector || undefined,
      };
    });

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={176}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="weight"
              nameKey="ticker"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            />
            <Tooltip content={<PortfolioTooltip assets={assets} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold tabular-nums text-text-primary">
            {chartData.length}
          </span>
          <span className="text-3xs font-medium uppercase tracking-label-sm text-text-muted">
            {chartData.length === 1 ? "Asset" : "Assets"}
          </span>
        </div>
      </div>

      {showLegend && chartData.length > 0 && (
        <ul className="scroll-area mt-3 max-h-28 space-y-1.5 overflow-y-auto text-sm -mr-[15px]">
          {chartData.map((item) => (
            <li
              key={item.ticker}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="truncate text-text-primary">
                  {item.assetName}
                  {item.assetName !== item.ticker && item.ticker && (
                    <span className="text-text-muted"> ({item.ticker})</span>
                  )}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-text-muted">
                {Number(item.weight ?? 0).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
