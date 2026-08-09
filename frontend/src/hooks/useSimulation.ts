import { useState } from 'react';
import axios from 'axios';

export function useSimulation() {
  const [tickers, setTickers] = useState("SPY, QQQ");
  const [weights, setWeights] = useState("0.6, 0.4");
  const [days, setDays] = useState(252);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSimulate = async (e?: SubmitEvent) => {
    if (e) e.preventDefault();
    setIsSimulating(true);
    setErrorMessage(null);

    try {
      const tickerArray = tickers.split(",").map(t => t.trim().toUpperCase());
      const weightArray = weights.split(",").map(w => parseFloat(w.trim()));

      const weightsDict: Record<string, number> = {};
      tickerArray.forEach((ticker, index) => {
        weightsDict[ticker] = weightArray[index] || 1.0; 
      });

      const payload = {
        tickers: tickerArray,
        weights: weightsDict,
        forecasted_days: days,
        num_simulations: 1000 
      };

      const apiUrl = "http://localhost:8000"; // TODO: Update URL & env
      const response = await axios.post(`${apiUrl}/api/simulate`, payload);
      
      setResults(response.data.data);
    } catch (error: any) {
      if (error.response) {
        setErrorMessage(error.response.data.detail || "Simulation failed due to bad inputs.");
      } else {
        setErrorMessage("Error. Please ensure the backend server is running.");
      }
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    tickers, setTickers,
    weights, setWeights,
    days, setDays,
    isSimulating,
    results,
    errorMessage,
    handleSimulate
  };
}