import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { SavedRun } from "../../types";
import {
  getLookbackLabel,
  getModelLabel,
} from "../../constants/simulationOptions";
import ModalHeader from "../ui/ModalHeader";
import SectionHeader from "../ui/SectionHeader";
import ScrollArea from "../ui/ScrollArea";

interface RunDetailsModalProps {
  run: SavedRun;
  onClose: () => void;
  onOpenRun: () => void;
}

function formatDate(value: string) {
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString();
}

export default function RunDetailsModal({
  run,
  onClose,
  onOpenRun,
}: RunDetailsModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const sortedAllocations = Object.entries(run.weights).sort(
    ([, a], [, b]) => b - a,
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/20 p-4 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-details-title"
        className="relative flex max-h-modal-panel w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-7"
      >
        <ModalHeader
          title={run.name || run.tickers.join(" · ")}
          titleId="run-details-title"
          onClose={onClose}
          closeLabel="Close run details"
          titleClassName="font-display text-xl font-semibold tracking-tight text-mint"
          description={formatDate(run.created_at)}
        />

        <ScrollArea className="min-h-0 space-y-4 pr-1">
          <div className="rounded-2xl border border-black/5 bg-white/45 p-4">
            <SectionHeader
              label="Portfolio"
              value={`${run.tickers.length} asset${run.tickers.length === 1 ? "" : "s"}`}
            />
            <ul className="space-y-1.5">
              {sortedAllocations.map(([ticker, weight]) => (
                <li
                  key={ticker}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-text-primary">
                    {ticker}
                  </span>
                  <span className="tabular-nums text-text-muted">
                    {(weight * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white/45 p-4">
            <SectionHeader label="Models used" value={run.models.length} />
            <ul className="space-y-1.5">
              {run.models.map((modelId) => (
                <li
                  key={modelId}
                  className="text-sm font-medium text-text-primary"
                >
                  {getModelLabel(modelId)}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/5 bg-white/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Lookback
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {getLookbackLabel(run.lookback_period)}
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Forecast horizon
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {run.forecasted_days} days
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-black/5 bg-white/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Simulated paths
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {run.num_simulations.toLocaleString()}
              </p>
            </div>
          </div>
        </ScrollArea>

        <button
          type="button"
          onClick={onOpenRun}
          className="mt-6 w-full cursor-pointer rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Open this run
        </button>
      </div>
    </div>,
    document.body,
  );
}
