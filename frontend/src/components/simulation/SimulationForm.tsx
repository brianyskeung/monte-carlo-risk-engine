import Card from "../../components/ui/Card";
import { useState } from "react";
import Allocator from "./Allocator";
import type { Allocation, SimulationResults } from "../../types";
import AllocationPieChart from "./AllocationChart";
import PortfolioSummary from "../portfolio/PortfolioSummary";

interface SimulationFormProps {
  allocations: Allocation[];
  setAllocations: (allocations: Allocation[]) => void;
  days: number;
  setDays: (days: number) => void;
  isSimulating: boolean;
  errorMessage: string | null;
  onSubmit: (e: React.SyntheticEvent) => void;
  results: SimulationResults | null;
}

export default function SimulationForm({
  allocations,
  setAllocations,
  days,
  setDays,
  isSimulating,
  errorMessage,
  onSubmit,
  results,
}: SimulationFormProps) {
  const [editorOpen, setEditorOpen] = useState(false);
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
          quoteTypes={results?.quote_types ?? {}}
          onEdit={() => setEditorOpen(true)}
        />

        {editorOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-bg p-6">
            <div className="mx-auto max-w-2xl">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="mb-6 text-sm text-text-muted"
              >
                Close editor
              </button>

              <Allocator
                allocations={allocations}
                setAllocations={setAllocations}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Forecast Horizon (Days)
          </label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
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
