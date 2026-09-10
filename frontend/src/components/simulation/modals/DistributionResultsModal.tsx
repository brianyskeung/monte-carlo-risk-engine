import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { SimulationResults } from "../../../types";
import ModalHeader from "../../ui/ModalHeader";
import ScrollArea from "../../ui/ScrollArea";
import ModelResultPanel from "../models/ModelResultPanel";

interface DistributionResultsModalProps {
  results: SimulationResults;
  onClose: () => void;
}

export default function DistributionResultsModal({
  results,
  onClose,
}: DistributionResultsModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
        aria-labelledby="distribution-results-title"
        className="relative flex h-modal-panel max-h-modal-panel w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-7"
      >
        <ModalHeader
          title="Distribution Paths"
          titleId="distribution-results-title"
          onClose={onClose}
          closeLabel="Close distribution results"
          titleClassName="font-display text-xl font-semibold tracking-tight text-mint"
          description={`${results.models.length} model${results.models.length === 1 ? "" : "s"} simulated`}
        />

        <ScrollArea className="min-h-0 flex-1 pr-1">
          <div
            className={`grid gap-6 normal-case ${results.models.length > 1 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
          >
            {results.models.map((model) => (
              <ModelResultPanel key={model.model_id} model={model} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>,
    document.body,
  );
}
