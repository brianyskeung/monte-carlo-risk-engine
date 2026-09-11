import { useState } from "react";
import { Info } from "lucide-react";
import type { ModelResult } from "../../../types";
import SimulationChart from "../SimulationChart";
import { formatDurationMs } from "../../../utils/formatting";
import { getModelDescription } from "../../../constants/simulationOptions";
import ModelInfoModal from "../modals/ModelInfoModal";

interface ModelResultPanelProps {
  model: ModelResult;
}

export default function ModelResultPanel({ model }: ModelResultPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between normal-case">
        <div className="flex items-center gap-1.5">
          <h4 className="text-base font-semibold text-text-primary">
            {model.display_name}
          </h4>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="text-text-muted transition-colors hover:cursor-pointer hover:text-mint"
            title={`About ${model.display_name}`}
            aria-label={`About ${model.display_name}`}
          >
            <Info size={14} />
          </button>
        </div>
        <span className="text-xs font-normal text-text-muted">
          {model.summary.forecasted_days} Days
        </span>
      </div>

      {infoOpen && (
        <ModelInfoModal
          title={model.display_name}
          description={getModelDescription(model.model_id)}
          onClose={() => setInfoOpen(false)}
        />
      )}

      <SimulationChart data={model.percentile_paths} summary={model.summary} />

      <p className="mt-3 text-xs text-text-muted normal-case">
        Simulation time: {formatDurationMs(model.simulation_time_ms)}
      </p>
    </section>
  );
}
