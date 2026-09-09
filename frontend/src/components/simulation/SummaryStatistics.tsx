import type { SimulationResults } from "../../types";
import AdvancedStatItem from "./models/AdvancedStatItem";
import {
  formatPercent,
  formatLossPercent,
  getReturnTone,
} from "../../utils/formatting";

interface SummaryStatisticsProps {
  results: SimulationResults | null;
}

export default function SummaryStatistics({ results }: SummaryStatisticsProps) {
  const models = results?.models ?? [];

  if (models.length === 0) {
    return (
      <span className="text-sm text-text-muted normal-case">
        Run a simulation to generate summary statistics
      </span>
    );
  }

  const highest = models.reduce((best, model) =>
    model.summary.expected_return > best.summary.expected_return ? model : best,
  );
  const lowest = models.reduce((worst, model) =>
    model.summary.expected_return < worst.summary.expected_return ? model : worst,
  );
  const lowestVar = models.reduce((best, model) =>
    model.summary.loss_var_95 < best.summary.loss_var_95 ? model : best,
  );
  const lowestCvar = models.reduce((best, model) =>
    model.summary.loss_cvar_95 < best.summary.loss_cvar_95 ? model : best,
  );

  return (
    <div className="normal-case">
      <AdvancedStatItem
        label={`Highest Avg. Return (${highest.display_name})`}
        value={formatPercent(highest.summary.expected_return)}
        tone={getReturnTone(highest.summary.expected_return)}
      />
      <AdvancedStatItem
        label={`Lowest Avg. Return (${lowest.display_name})`}
        value={formatPercent(lowest.summary.expected_return)}
        tone={getReturnTone(lowest.summary.expected_return)}
      />
      <AdvancedStatItem
        label={`Lowest VaR 95% (${lowestVar.display_name})`}
        value={formatLossPercent(lowestVar.summary.loss_var_95)}
        tone={getReturnTone(-lowestVar.summary.loss_var_95)}
      />
      <AdvancedStatItem
        label={`Lowest CVaR 95% (${lowestCvar.display_name})`}
        value={formatLossPercent(lowestCvar.summary.loss_cvar_95)}
        tone={getReturnTone(-lowestCvar.summary.loss_cvar_95)}
      />
    </div>
  );
}
