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
    <Card className="text-sm font-semibold text-stone-800 uppercase tracking-wider">
      <div className="flex justify-between items-center text-sm font-medium text-text-muted mb-4">
        <h3>Distribution Paths</h3>
        <div className="flex items-center gap-3">
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
        <ScrollArea className="h-96">
          <div
            className={`grid gap-6 ${results.models.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {results.models.map((model) => (
              <ModelResultPanel key={model.model_id} model={model} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-xl bg-bg/50">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
              <div>
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
