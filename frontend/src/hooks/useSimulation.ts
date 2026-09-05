import { useState } from "react";
import axios from "axios";
import type { Allocation, ModelId, SimulationResults } from "../types";

const DEFAULT_MODELS: ModelId[] = ["historical_bootstrap"];

export function useSimulation() {
  const [allocations, setAllocations] = useState<Allocation[]>([
    { ticker: "SPY", weight: 60 },
    { ticker: "QQQ", weight: 40 },
  ]);
  const [days, setDays] = useState(252);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lookbackPeriod, setLookbackPeriod] = useState("5y");
  const [numSimulations, setNumSimulations] = useState<number>(1000);
  const [selectedModels, setSelectedModels] =
    useState<ModelId[]>(DEFAULT_MODELS);

  const handleSimulate = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setIsSimulating(true);
    setErrorMessage(null);

    try {
      const tickerArray = allocations.map(({ ticker }) => ticker);
      const weightsDict = Object.fromEntries(
        allocations.map(({ ticker, weight }) => [ticker, weight / 100]),
      );

      const payload = {
        tickers: tickerArray,
        weights: weightsDict,
        models: selectedModels,
        lookback_period: lookbackPeriod,
        forecasted_days: days,
        num_simulations: numSimulations,
      };

      const apiUrl = "http://localhost:8000"; // TODO: Update URL & env
      const response = await axios.post(`${apiUrl}/api/simulate`, payload);

      setResults(response.data.data);
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(
          error.response.data.detail || "Simulation failed due to bad inputs.",
        );
      } else {
        setErrorMessage("Error. Please ensure the backend server is running.");
      }
    } finally {
      setIsSimulating(false);
    }
  };

  return {
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
  };
}
