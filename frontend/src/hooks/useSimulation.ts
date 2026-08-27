import { useState } from "react";
import axios from "axios";
import type { Allocation, SimulationResults } from "../types";

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
  const [simulationTime, setSimulationTime] = useState<number | null>(null);

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
        lookback_period: lookbackPeriod,
        forecasted_days: days,
        num_simulations: numSimulations,
      };

      const apiUrl = "http://localhost:8000"; // TODO: Update URL & env
      const response = await axios.post(`${apiUrl}/api/simulate`, payload);

      setResults(response.data.data);
      setSimulationTime(response.data.time);
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
    simulationTime,
  };
}
