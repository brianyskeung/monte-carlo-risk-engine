import Card from "../../components/ui/Card";
import SimulationChart from "./SimulationChart";
import type { SimulationResults } from "../../types";

interface DistributionResultsProps {
  results: SimulationResults | null;
  simulationTime: number | null;
}

export default function DistributionResults({
  results,
  simulationTime,
}: DistributionResultsProps) {
  return (
    <Card
      title=""
      className="text-sm font-semibold text-stone-800 uppercase tracking-wider"
    >
      <div className="flex justify-between items-center text-sm font-medium text-text-muted mb-4">
        <h3>Distribution Paths</h3>
        <span>
          {results ? `${results.percentile_paths.length} Days Forecast` : ""}
        </span>
      </div>

      {results ? (
        <>
          <SimulationChart data={results.percentile_paths} />

          <div className="mt-3 flex justify-between text-xs text-text-muted font-normal normal-case">
            <span>Model Type: Historical Bootstrap</span>
            {simulationTime !== null && (
              <span>Simulation Time: {simulationTime.toFixed(2)} ms</span>
            )}
          </div>
        </>
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
