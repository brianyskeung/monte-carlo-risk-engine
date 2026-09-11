import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Allocation, AssetInfoMap } from "../../../types";
import ModalHeader from "../../ui/ModalHeader";
import PortfolioEditorAllocationChart from "../PortfolioEditorAllocationChart";
import Allocator from "../Allocator";
import PortfolioDetails from "../PortfolioDetails";
import useAssets from "../../../hooks/useAssets";
import { validatePortfolioAllocations } from "../../../utils/portfolioValidation";

type PortfolioEditorProps = {
  allocations: Allocation[];
  assets: AssetInfoMap;
  onSave: (allocations: Allocation[]) => void;
  onClose: () => void;
};

export default function PortfolioEditor({
  allocations,
  assets,
  onSave,
  onClose,
}: PortfolioEditorProps) {
  const [draftAllocations, setDraftAllocations] =
    useState<Allocation[]>(allocations);
  const [validationError, setValidationError] = useState<string | null>(null);
  const draftAssets = useAssets(
    draftAllocations.map((allocation) => allocation.ticker),
  );

  const handleSave = () => {
    const error = validatePortfolioAllocations(draftAllocations);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    onSave(draftAllocations);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex gap-6 overflow-hidden bg-slate-950/20 p-4 backdrop-blur-md justify-center items-center sm:p-6">
      <div className="pointer-events-none fixed inset-0 bg-editor-glow" />

      <div className="relative hidden h-modal-panel max-h-modal-panel w-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl lg:flex lg:w-1/3 sm:p-8">
        <h2 className="font-display text-xl font-semibold tracking-tight text-mint">
          Allocation Chart
        </h2>
        <div className="mt-4 min-h-0 flex-1">
          <PortfolioEditorAllocationChart
            allocations={draftAllocations}
            assets={{ ...assets, ...draftAssets }}
          />
        </div>
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-editor-title"
        className="relative flex h-modal-panel max-h-modal-panel w-full lg:w-2/3 max-w-5xl flex-col overflow-y-auto rounded-3xl border border-white/70 bg-white/80 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-8 lg:overflow-hidden"
      >
        <ModalHeader
          title="Portfolio Allocation"
          titleId="portfolio-editor-title"
          onClose={onClose}
          closeLabel="Close portfolio editor"
          titleClassName="font-display text-2xl font-semibold tracking-tight text-mint"
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 pb-1 lg:grid-cols-editor">
          <Allocator
            allocations={draftAllocations}
            setAllocations={setDraftAllocations}
          />

          <PortfolioDetails
            allocations={draftAllocations}
            assets={{ ...assets, ...draftAssets }}
          />
        </div>

        {validationError && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {validationError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="mt-8 w-full cursor-pointer rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          Save changes
        </button>
      </div>
    </div>,
    document.body,
  );
}
