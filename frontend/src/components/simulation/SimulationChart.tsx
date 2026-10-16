import { useState, useEffect } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Maximize2, Minimize2 } from "lucide-react";
import type { PathData, SimulationSummary } from "../../types";
import AdvancedStats from "./models/AdvancedStats";

interface SimulationChartProps {
  data: PathData[];
  summary: SimulationSummary;
  heightClassName?: string;
}

// percentile rows shown in the tooltip, best outcome first
const TOOLTIP_ROWS: { key: keyof PathData; label: string; color: string }[] = [
  { key: "p95", label: "95th", color: "#10b981" },
  { key: "p75", label: "75th", color: "#6ee7b7" },
  { key: "p50", label: "Median", color: "#0f172a" },
  { key: "p25", label: "25th", color: "#fca5a5" },
  { key: "p5", label: "5th", color: "#ef4444" },
];

/** Tooltip listing every percentile for the hovered day. */
const CompactTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as PathData;

  return (
    <div className="pointer-events-none z-50 min-w-40 rounded-lg border border-stone-100 bg-white/95 p-2.5 shadow-lg backdrop-blur-md">
      <p className="mb-1.5 border-b border-stone-100/80 pb-1 text-3xs font-medium uppercase tracking-wider text-stone-400">
        Day {label}
      </p>
      <div className="flex flex-col gap-1 text-2xs">
        {TOOLTIP_ROWS.map(({ key, label: rowLabel, color }) => {
          const percentValue = point[key] * 100;
          const isPositive = percentValue >= 0;
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-stone-600">{rowLabel}</span>
              </div>
              <span
                className={`font-semibold tabular-nums ${isPositive ? "text-emerald-600" : "text-rose-600"}`}
              >
                {isPositive ? "+" : ""}
                {percentValue.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Percentile fan chart for one model: shaded 5-95 and 25-75 bands around the
 * median, plus a fullscreen mode that also reveals advanced statistics.
 */
export default function SimulationChart({
  data,
  summary,
  heightClassName = "h-56",
}: SimulationChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // leave fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  if (!data || data.length === 0) return null;

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-[#fafaf9] p-4 sm:p-8"
          : `group/chart relative w-full ${heightClassName}`
      }
    >
      {/* Fullscreen Toggle */}
      <button
        type="button"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className={`absolute right-1 top-1 z-10 cursor-pointer rounded-md border border-stone-100 bg-white/90 p-1 text-stone-400 transition hover:bg-stone-50 hover:text-stone-700 ${isFullscreen ? "right-4 top-4 p-1.5" : "opacity-0 focus:opacity-100 group-hover/chart:opacity-100"}`}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        aria-label={isFullscreen ? "Exit fullscreen" : "Open chart fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={13} />}
      </button>

      <div
        className={
          isFullscreen
            ? "mx-auto h-[52vh] min-h-72 max-h-136 w-full max-w-6xl pb-4 md:h-[60vh]"
            : "h-full w-full"
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <defs>
              <linearGradient id="outer-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.12} />
              </linearGradient>
              <linearGradient id="inner-band" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#eeedeb"
            />
            <XAxis
              dataKey="day"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 10, fill: "#a8a29e" }}
              axisLine={{ stroke: "#e7e5e4" }}
              tickLine={false}
              dy={6}
              minTickGap={40}
            />
            <YAxis
              type="number"
              tick={{ fontSize: 10, fill: "#a8a29e" }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <ReferenceLine y={0} stroke="#a8a29e" strokeWidth={1} />

            <Tooltip
              content={<CompactTooltip />}
              cursor={{
                stroke: "#d6d3d1",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey={(point: PathData) => [point.p5, point.p95]}
              stroke="none"
              fill="url(#outer-band)"
              isAnimationActive={false}
              activeDot={false}
              name="5th–95th"
            />
            <Area
              type="monotone"
              dataKey={(point: PathData) => [point.p25, point.p75]}
              stroke="none"
              fill="url(#inner-band)"
              isAnimationActive={false}
              activeDot={false}
              name="25th–75th"
            />

            <Line
              type="monotone"
              dataKey="p95"
              stroke="#10b981"
              strokeWidth={1.25}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#0f172a"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p5"
              stroke="#ef4444"
              strokeWidth={1.25}
              dot={false}
              strokeDasharray="4 3"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {isFullscreen && (
        <AdvancedStats summary={summary} percentilePaths={data} />
      )}
    </div>
  );
}
