import Card from "../../components/ui/Card";
import { ChevronDown } from "lucide-react";
import type { Allocation, AssetInfoMap } from "../../types";
import AllocationPieChart from "../portfolio/AllocationChart";
import PortfolioSummary from "../portfolio/PortfolioSummary";

interface SimulationFormProps {
  allocations: Allocation[];
  setAllocations: (allocations: Allocation[]) => void;
  days: number;
  setDays: (days: number) => void;
  isSimulating: boolean;
  errorMessage: string | null;
  onSubmit: (e: React.SyntheticEvent) => void;
  assets: AssetInfoMap;
  lookbackPeriod: string;
  setLookbackPeriod: (period: string) => void;
  numSimulations: number;
  setNumSimulations: (value: number) => void;
}

export default function SimulationForm({
  allocations,
  setAllocations,
  days,
  setDays,
  isSimulating,
  errorMessage,
  onSubmit,
  assets,
  lookbackPeriod,
  setLookbackPeriod,
  numSimulations,
  setNumSimulations,
}: SimulationFormProps) {
  return (
    <Card title="Portfolio Configuration">
      <form onSubmit={onSubmit} className="space-y-4">
        <AllocationPieChart allocations={allocations} />
        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-0.5">
                Simulation Failed
              </h3>
              <p className="text-sm text-red-600 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <PortfolioSummary
          allocations={allocations}
          assets={assets}
          onSave={setAllocations}
        />

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Forecast Horizon (Days)
          </label>
          <input
            type="number"
            value={days === 0 ? "" : days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full bg-bg border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint transition-colors"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Historical Lookback
          </label>

          <div className="relative">
            <select
              value={lookbackPeriod}
              onChange={(event) => setLookbackPeriod(event.target.value)}
              className="w-full appearance-none bg-bg border border-black/10 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-mint transition-colors"
            >
              <option value="1mo">1 month</option>
              <option value="3mo">3 months</option>
              <option value="6mo">6 months</option>
              <option value="1y">1 year</option>
              <option value="2y">2 years</option>
              <option value="5y">5 years</option>
              <option value="10y">10 years</option>
              <option value="max">Maximum available</option>
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Number of Simulations
          </label>
          <input
            type="number"
            value={numSimulations === 0 ? "" : numSimulations}
            onChange={(e) => setNumSimulations(Number(e.target.value))}
            className="w-full bg-bg border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint transition-colors"
            required
            min="1"
          />
        </div>

        <button
          type="submit"
          disabled={isSimulating}
          className="w-full mt-2 bg-mint text-white font-medium text-sm py-2.5 rounded-lg hover:bg-mint/90 transition-colors disabled:opacity-50"
        >
          {isSimulating ? "Running Engine..." : "Run Simulation"}
        </button>
      </form>
    </Card>
  );
}
