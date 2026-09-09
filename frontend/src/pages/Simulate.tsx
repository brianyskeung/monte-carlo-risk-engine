import useSimulation from "../hooks/useSimulation";
import SimulationForm from "../components/simulation/SimulationForm";
import DistributionResults from "../components/simulation/DistributionResults";
import SummaryStatistics from "../components/simulation/SummaryStatistics";
import useAssets from "../hooks/useAssets.ts";
import Card from "../components/ui/Card.tsx";
import RunHistoryCard from "../components/simulation/RunHistoryCard";
import { useState } from "react";
import type { SavedRunDetail } from "../types";

export default function Simulate() {
  const [savedRun, setSavedRun] = useState<SavedRunDetail | null>(null);
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
    selectedModels,
    setSelectedModels,
    lastRunId,
  } = useSimulation();

  const assets = useAssets(allocations.map(({ ticker }) => ticker));

  const openSavedRun = (run: SavedRunDetail) => {
    setSavedRun(run);
    setSelectedModels(run.models);
  };

  return (
    <div className="max-w-none space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-text-primary">
          Monte Carlo Simulation
        </h2>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            Model potential portfolio outcomes through repeated random sampling
            of historical market volatility.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[4fr_9fr_3fr] gap-6">
        <div className="flex flex-col min-w-0">
          <SimulationForm
            className="flex-1"
            allocations={allocations}
            setAllocations={setAllocations}
            days={days}
            setDays={setDays}
            lookbackPeriod={lookbackPeriod}
            setLookbackPeriod={setLookbackPeriod}
            isSimulating={isSimulating}
            onSubmit={(event) => {
              setSavedRun(null);
              handleSimulate(event);
            }}
            assets={assets}
            numSimulations={numSimulations}
            setNumSimulations={setNumSimulations}
          />
        </div>

        <div className="flex flex-col space-y-6 min-w-0">
          <DistributionResults
            results={savedRun?.data ?? results}
            selectedModels={selectedModels}
            onChange={setSelectedModels}
            errorMessage={savedRun ? null : errorMessage}
          />

          <Card
            title=""
            className="flex-1 flex flex-col text-sm font-semibold text-stone-800 uppercase tracking-wider"
          >
            <div className="flex justify-between items-center text-sm font-medium text-text-muted mb-4">
              <h3>Summary Statistics</h3>
            </div>
            <SummaryStatistics results={savedRun?.data ?? results} />
          </Card>
        </div>

        <div className="min-w-0">
          <RunHistoryCard onOpen={openSavedRun} refreshKey={lastRunId} />
        </div>
      </div>
    </div>
  );
}
