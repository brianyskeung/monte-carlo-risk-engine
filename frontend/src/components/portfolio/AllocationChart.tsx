import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import type { Allocation, AssetInfoMap } from "../../types";

const baseColors = [
  "#E7F9F1",
  "#9AE6C2",
  "#45C89B",
  "#10A07A",
  "#0E7A68",
  "#0B3B35",
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const securityName = item.assetName || item.ticker || "Unknown security";
  const securityType = item.assetType || "Unknown type";
  const weight = Number(item.weight ?? 0);

  return (
    <div className="w-52.5 max-w-52.5 rounded-lg border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <div className="border-b border-stone-100 pb-1.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-400">
          {item.ticker || "Asset"}
        </p>
      </div>

      <div className="mt-2 space-y-1 text-xs text-stone-600">
        <p className="wrap-break-words leading-snug">
          <span className="font-medium text-stone-700">Name:</span>{" "}
          {securityName}
        </p>
        <p className="wrap-break-words leading-snug">
          <span className="font-medium text-stone-700">Type:</span>{" "}
          {securityType}
        </p>
        <p>
          <span className="font-medium text-stone-700">Allocation:</span>{" "}
          {weight.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

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
      const asset = assets[allocation.ticker];
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
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
