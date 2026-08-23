import Card from "../../components/ui/Card";
import SimulationChart from "./SimulationChart";
import type { SimulationResults } from "../../types";

interface DistributionResultsProps {
  results: SimulationResults | null;
}

export default function DistributionResults({
  results,
}: DistributionResultsProps) {
  return (
    <Card
      title="Distribution Paths"
      className="text-sm font-semibold text-stone-800 uppercase tracking-wider"
    >
      {results ? (
        <>
          <SimulationChart data={results.percentile_paths} />
          <div className="mt-3 flex justify-between items-center text-xs text-text-muted font-normal normal-case">
            <span>Model Type: Historical Bootstrap</span>
            <span>{results.percentile_paths.length} Days Forecast</span>
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
