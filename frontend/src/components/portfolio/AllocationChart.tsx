import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import PortfolioTooltip from "./PortfolioTooltip";
import type { Allocation, AssetInfoMap } from "../../types";

const baseColors = [
  "#E7F9F1",
  "#9AE6C2",
  "#45C89B",
  "#10A07A",
  "#0E7A68",
  "#0B3B35",
];

export default function AllocationPieChart({
  allocations,
  assets,
}: {
  allocations: Allocation[];
  assets: AssetInfoMap;
}) {
  const chartData = [...allocations]
    .sort((a, b) => Number(b.weight) - Number(a.weight))
    .map((allocation) => {
      const asset =
        assets[allocation.ticker] ??
        assets[allocation.ticker.trim().toUpperCase()];
      const weight = Number(allocation.weight ?? 0);
      const normalizedWeight = Math.max(0, Math.min(1, weight / 100));
      const colorIndex = Math.min(
        baseColors.length - 1,
        Math.max(0, Math.round(normalizedWeight * (baseColors.length - 1))),
      );

      return {
        ...allocation,
        fill: baseColors[colorIndex],
        assetName: asset?.short_name || allocation.ticker || "Unknown security",
        assetType: asset?.quote_type || "Unknown type",
        assetSector: asset?.sector || undefined,
      };
    });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="weight"
          nameKey="ticker"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        />
        <Tooltip content={<PortfolioTooltip assets={assets} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
