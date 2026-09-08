import Card from "../../components/ui/Card";
import type { SimulationResults, ModelId } from "../../types";
import ModelResultPanel from "./models/ModelResultPanel";
import ModelSelector from "../simulation/models/ModelSelector";

interface DistributionResultsProps {
  results: SimulationResults | null;
  selectedModels: ModelId[];
  onChange: (models: ModelId[]) => void;
}

export default function DistributionResults({
  results,
  selectedModels,
  onChange,
}: DistributionResultsProps) {
  return (
    <Card
      title=""
      className="text-sm font-semibold text-stone-800 uppercase tracking-wider"
    >
      <div className="flex justify-between items-center text-sm font-medium text-text-muted mb-4">
        <h3>Distribution Paths</h3>
        <ModelSelector selectedModels={selectedModels} onChange={onChange} />
      </div>

      {results && results.models.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {results.models.map((model) => (
            <ModelResultPanel key={model.model_id} model={model} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-black/5 rounded-xl bg-bg/50 mt-2 min-h-95">
          <span className="text-sm text-text-muted">
            Run a simulation to generate risk distributions
          </span>
        </div>
      )}
    </Card>
  );
}
