import Card from "../../components/ui/Card";
import type { SimulationResults } from "../../types";
import ModelResultPanel from "./models/ModelResultPanel";

interface DistributionResultsProps {
  results: SimulationResults | null;
}

export default function DistributionResults({
  results,
}: DistributionResultsProps) {
  return (
    <Card
      title=""
      className="text-sm font-semibold text-stone-800 uppercase tracking-wider"
    >
      <div className="flex justify-between items-center text-sm font-medium text-text-muted mb-4">
        <h3>Distribution Paths</h3>
        <span>{results ? `${results.models.length} Models` : ""}</span>
      </div>

      {results && results.models.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {results.models.map((model) => (
            <ModelResultPanel key={model.model_id} model={model} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-black/5 rounded-xl bg-bg/50 mt-2 min-h-75">
          <span className="text-sm text-text-muted">
            Run a simulation to generate risk distributions
          </span>
        </div>
      )}
    </Card>
  );
}
