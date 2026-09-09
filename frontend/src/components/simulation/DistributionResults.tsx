import Card from "../../components/ui/Card";
import type { SimulationResults, ModelId } from "../../types";
import ModelResultPanel from "./models/ModelResultPanel";
import ModelSelector from "../simulation/models/ModelSelector";

interface DistributionResultsProps {
  results: SimulationResults | null;
  selectedModels: ModelId[];
  onChange: (models: ModelId[]) => void;
  errorMessage?: string | null;
}

export default function DistributionResults({
  results,
  selectedModels,
  onChange,
  errorMessage,
}: DistributionResultsProps) {
  return (
    <Card className="text-sm font-semibold text-stone-800 uppercase tracking-wider">
      <div className="flex justify-between items-center text-sm font-medium text-text-muted mb-4">
        <h3>Distribution Paths</h3>
        <ModelSelector selectedModels={selectedModels} onChange={onChange} />
      </div>

      {results && results.models.length > 0 ? (
        <div
          className={`grid gap-6 ${results.models.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {results.models.map((model) => (
            <ModelResultPanel key={model.model_id} model={model} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-xl bg-bg/50 mt-2 min-h-95">
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
    </Card>
  );
}
