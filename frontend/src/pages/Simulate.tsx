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
    handleSaveRun,
    isSaving,
    isSaved,
    saveError,
  } = useSimulation();

  const assets = useAssets(allocations.map(({ ticker }) => ticker));

  const openSavedRun = (run: SavedRunDetail) => {
    setSavedRun(run);
    setSelectedModels(run.models);
  };

  return (
    <div className="max-w-none space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-display font-semibold tracking-tight text-text-primary">
          Monte Carlo Simulation
        </h2>
        <p className="text-sm text-text-muted">
          Model potential portfolio outcomes through repeated random sampling
          of historical market volatility.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-simulate">
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

        <div className="flex flex-col space-y-4 min-w-0">
          <DistributionResults
            results={savedRun?.data ?? results}
            selectedModels={selectedModels}
            onChange={setSelectedModels}
            errorMessage={savedRun ? null : errorMessage}
            onSaveRun={savedRun ? undefined : handleSaveRun}
            isSaving={isSaving}
            isSaved={isSaved}
            saveError={saveError}
          />

          <Card title="Best Across Models" className="flex-1 flex flex-col">
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
