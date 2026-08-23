import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import type { Allocation } from "../../types";

const colors = ["#059669", "#3B82F6", "#E11D48", "#F59E0B", "#8B5CF6"]; // TODO: Adjust

export default function AllocationPieChart({
  allocations,
}: {
  allocations: Allocation[];
}) {
  const chartData = allocations.map((allocation, index) => ({
    ...allocation,
    fill: colors[index % colors.length],
  }));

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
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}
