import Card from "../components/ui/Card";
import SimulationChart from '../components/simulation/SimulationChart';
import { useSimulation } from '../hooks/useSimulation';

export default function Simulate() {
  const { 
    tickers, setTickers, weights, setWeights, days, setDays, 
    isSimulating, results, errorMessage, handleSimulate 
  } = useSimulation();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-text-primary">
          Monte Carlo Simulation
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Model potential portfolio outcomes through repeated random sampling of historical market volatility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inputs */}
        {/* TODO: Revamp portfolio configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Portfolio Configuration">

            {errorMessage && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-red-800 mb-0.5">Simulation Failed</h3>
                  <p className="text-sm text-red-600 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Assets (Comma Separated)
                </label>
                <input
                  type="text"
                  value={tickers}
                  onChange={(e) => setTickers(e.target.value)}
                  className="w-full bg-bg border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint transition-colors"
                  placeholder="e.g. SPY, AAPL"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Allocations (Must sum to 1.0)
                </label>
                <input
                  type="text"
                  value={weights}
                  onChange={(e) => setWeights(e.target.value)}
                  className="w-full bg-bg border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint transition-colors"
                  placeholder="e.g. 0.6, 0.4"
                  required
                />
              </div>

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
        </div>

        {/* Right Column: Analytics & Charts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Top Row: Simulation Chart */}
          {/* TODO: Add multi-model comparative analysis */}
          <Card title="Distribution Paths" className="text-sm font-semibold text-stone-800 uppercase tracking-wider">
            {results ? (
              <>
              
              <SimulationChart data={results.percentile_paths} />
              <div className="mt-3 flex justify-between items-center text-xs text-text-muted font-normal normal-case">
                  <span>Model Type: Historical Bootstrap</span> {/* TODO: Add model type selection */}
                  <span>{results.percentile_paths.length} Days Forecast</span>
                </div>
              </>
            ) : (
              // Empty placeholder 
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-black/5 rounded-xl bg-bg/50 mt-2">
                <span className="text-sm text-text-muted">
                  Run a simulation to generate risk distributions
                </span>
              </div>
            )}
          </Card>
           {/* TODO: Analytics Dashboard */}
        </div>
      </div>
    </div>
  );
}