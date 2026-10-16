import { useState } from "react";
import { Info } from "lucide-react";
import type { ModelResult } from "../../../types";
import SimulationChart from "../SimulationChart";
import {
  formatDurationMs,
  formatPercent,
  getReturnTone,
} from "../../../utils/formatting";
import { getModelDescription } from "../../../constants/simulationOptions";
import ModelInfoModal from "../modals/ModelInfoModal";

interface ModelResultPanelProps {
  model: ModelResult;
  chartHeightClassName?: string;
}

const toneClasses = {
  positive: "text-emerald-600",
  negative: "text-rose-600",
  neutral: "text-text-primary",
};

const LEGEND = [
  { label: "Median", swatch: "h-0.5 w-3 bg-slate-900" },
  { label: "25–75th", swatch: "h-2 w-3 rounded-sm bg-emerald-400/35" },
  { label: "5–95th", swatch: "h-2 w-3 rounded-sm bg-emerald-400/15" },
  { label: "5th", swatch: "h-0 w-3 border-t border-dashed border-rose-500" },
];

function InlineStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-2xs font-medium text-text-muted">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-semibold tabular-nums ${toneClasses[getReturnTone(value)]}`}
      >
        {formatPercent(value, 1)}
      </p>
    </div>
  );
}

export default function ModelResultPanel({
  model,
  chartHeightClassName,
}: ModelResultPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const { summary } = model;
  const terminal = model.percentile_paths[model.percentile_paths.length - 1];

  return (
    <section className="min-w-0 rounded-xl border border-stone-200/70 bg-white p-4 normal-case tracking-normal">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <h4 className="truncate text-sm font-semibold text-text-primary">
            {model.display_name}
          </h4>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="shrink-0 text-text-muted transition-colors hover:cursor-pointer hover:text-mint"
            title={`About ${model.display_name}`}
            aria-label={`About ${model.display_name}`}
          >
            <Info size={13} />
          </button>
        </div>
        <span
          className="shrink-0 text-2xs font-normal tabular-nums text-text-muted"
          title={`Simulation time: ${formatDurationMs(model.simulation_time_ms)}`}
        >
          {summary.forecasted_days} days
        </span>
      </div>

      <div className="mt-1.5 mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {LEGEND.map(({ label, swatch }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-3xs font-medium text-text-muted"
          >
            <span className={swatch} />
            {label}
          </span>
        ))}
      </div>

      {infoOpen && (
        <ModelInfoModal
          title={model.display_name}
          description={getModelDescription(model.model_id)}
          onClose={() => setInfoOpen(false)}
        />
      )}

      <SimulationChart
        data={model.percentile_paths}
        summary={summary}
        heightClassName={chartHeightClassName}
      />

      <div className="mt-3 grid grid-cols-5 gap-1.5 border-t border-stone-100 pt-3">
        <InlineStat label="Mean" value={summary.expected_return} />
        {terminal && <InlineStat label="Median" value={terminal.p50} />}
        <InlineStat label="VaR 95" value={-summary.loss_var_95} />
        <InlineStat label="CVaR 95" value={-summary.loss_cvar_95} />
        {terminal && <InlineStat label="P95" value={terminal.p95} />}
      </div>
    </section>
  );
}
