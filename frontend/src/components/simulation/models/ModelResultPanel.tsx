import type { ModelResult } from "../../../types";
import SimulationChart from "../SimulationChart";

interface ModelResultPanelProps {
  model: ModelResult;
}

export default function ModelResultPanel({ model }: ModelResultPanelProps) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between normal-case">
        <h4 className="text-base font-semibold text-text-primary">
          {model.display_name}
        </h4>
        <span className="text-xs font-normal text-text-muted">
          {model.summary.forecasted_days} Days
        </span>
      </div>

      <SimulationChart data={model.percentile_paths} summary={model.summary} />

      <p className="mt-3 text-xs text-text-muted normal-case">
        Simulation time: {model.simulation_time_ms.toFixed(2)} ms
      </p>
    </section>
  );
}
