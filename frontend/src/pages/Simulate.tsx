import { useSimulation } from "../hooks/useSimulation";
import SimulationForm from "../components/simulation/SimulationForm";
import DistributionResults from "../components/simulation/DistributionResults";
import { useAssets } from "../hooks/useAssets.ts";

export default function Simulate() {
  const {
    allocations,
    setAllocations,
    days,
    setDays,
    lookbackPeriod,
    setLookbackPeriod,
    isSimulating,
    results,
    errorMessage,
    handleSimulate,
    numSimulations,
    setNumSimulations,
  } = useSimulation();

  const assets = useAssets(allocations.map(({ ticker }) => ticker));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-text-primary">
          Monte Carlo Simulation
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Model potential portfolio outcomes through repeated random sampling of
          historical market volatility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SimulationForm
            allocations={allocations}
            setAllocations={setAllocations}
            days={days}
            setDays={setDays}
            lookbackPeriod={lookbackPeriod}
            setLookbackPeriod={setLookbackPeriod}
            isSimulating={isSimulating}
            errorMessage={errorMessage}
            onSubmit={handleSimulate}
            assets={assets}
            numSimulations={numSimulations}
            setNumSimulations={setNumSimulations}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DistributionResults
            results={results}
          />
        </div>
      </div>
    </div>
  );
}
