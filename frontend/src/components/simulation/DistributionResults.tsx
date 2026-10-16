import { useState } from "react";
import { Maximize2 } from "lucide-react";
import Card from "../../components/ui/Card";
import type { SimulationResults, ModelId } from "../../types";
import ModelResultPanel from "./models/ModelResultPanel";
import ModelSelector from "../simulation/models/ModelSelector";
import SaveRunButton from "./SaveRunButton";
import ScrollArea from "../ui/ScrollArea";
import DistributionResultsModal from "./modals/DistributionResultsModal";

interface DistributionResultsProps {
  results: SimulationResults | null;
  selectedModels: ModelId[];
  onChange: (models: ModelId[]) => void;
  errorMessage?: string | null;
  onSaveRun?: (name: string) => void;
  isSaving?: boolean;
  isSaved?: boolean;
  saveError?: string | null;
}

/**
 * Results card: one chart panel per simulated model, with controls to save
 * the run, change the model selection, and open the enlarged view.
 */
export default function DistributionResults({
  results,
  selectedModels,
  onChange,
  errorMessage,
  onSaveRun,
  isSaving,
  isSaved,
  saveError,
}: DistributionResultsProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-label text-text-muted">
            Distribution Paths
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onSaveRun && results && results.models.length > 0 && (
            <SaveRunButton
              onSaveRun={onSaveRun}
              isSaving={isSaving}
              isSaved={isSaved}
              saveError={saveError}
            />
          )}
          <ModelSelector selectedModels={selectedModels} onChange={onChange} />
          {results && results.models.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMaximized(true)}
              className="cursor-pointer rounded-md p-1.5 text-text-muted transition-colors hover:text-mint focus:outline-none"
              title="View all charts"
              aria-label="Maximize distribution results"
            >
              <Maximize2 size={16} />
            </button>
          )}
        </div>
      </div>

      {results && results.models.length > 0 ? (
        <ScrollArea className="h-[26rem] -mr-[15px]">
          <div
            className={`grid gap-4 ${results.models.length > 1 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
          >
            {results.models.map((model) => (
              <ModelResultPanel
                key={model.model_id}
                model={model}
                chartHeightClassName={
                  results.models.length === 1 ? "h-72" : undefined
                }
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="h-[26rem] flex flex-col items-center justify-center rounded-xl border border-dashed border-black/10 bg-bg/60 px-6 text-center">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-red-800 mb-0.5">
                  Simulation Failed
                </h3>
                <p className="text-sm text-red-600 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
          <span className="text-sm text-text-muted">
            Run a simulation to generate risk distributions
          </span>
        </div>
      )}

      {isMaximized && results && results.models.length > 0 && (
        <DistributionResultsModal
          results={results}
          onClose={() => setIsMaximized(false)}
        />
      )}
    </Card>
  );
}
