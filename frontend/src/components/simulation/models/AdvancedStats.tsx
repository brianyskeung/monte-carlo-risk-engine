import type { PathData, SimulationSummary } from "../../../types";
import AdvancedStatItem from "./AdvancedStatItem";

interface AdvancedStatsProps {
  summary: SimulationSummary;
  percentilePaths: PathData[];
}

export default function AdvancedStats({
  summary,
  percentilePaths,
}: AdvancedStatsProps) {
  const terminalPercentiles = percentilePaths[percentilePaths.length - 1];

  return (
    <section className="mx-auto mt-2 w-full max-w-6xl shrink-0 border-t border-stone-200 pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        Advanced Statistics
      </h3>

      <div className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <AdvancedStatItem
            label="Expected Return"
            value={formatPercent(summary.expected_return)}
          />
        </div>

        <AdvancedStatItem
          label="VaR 95%"
          value={formatPercent(summary.loss_var_95)}
        />
        <AdvancedStatItem
          label="CVaR 95%"
          value={formatPercent(summary.loss_cvar_95)}
        />

        {terminalPercentiles && (
          <>
            <AdvancedStatItem
              label="Median"
              value={formatPercent(terminalPercentiles.p50)}
            />
            <AdvancedStatItem
              label="Mean"
              value={formatPercent(terminalPercentiles.mean)}
            />
            <AdvancedStatItem
              label="5th Percentile"
              value={formatPercent(terminalPercentiles.p5)}
            />
            <AdvancedStatItem
              label="25th Percentile"
              value={formatPercent(terminalPercentiles.p25)}
            />
            <AdvancedStatItem
              label="75th Percentile"
              value={formatPercent(terminalPercentiles.p75)}
            />
            <AdvancedStatItem
              label="95th Percentile"
              value={formatPercent(terminalPercentiles.p95)}
            />
          </>
        )}
      </div>
    </section>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
