import { X } from "lucide-react";
import { useState } from "react";
import type { Allocation } from "../../types";
import Allocator from "./Allocator";

type PortfolioEditorProps = {
  allocations: Allocation[];
  onSave: (allocations: Allocation[]) => void;
  onClose: () => void;
};

export default function PortfolioEditor({
  allocations,
  onSave,
  onClose,
}: PortfolioEditorProps) {
  const [draftAllocations, setDraftAllocations] =
    useState<Allocation[]>(allocations);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 p-4 backdrop-blur-md sm:p-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(5,150,105,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-editor-title"
        className="relative mx-auto mt-[5vh] max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:mt-[10vh] sm:p-8"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <h2
            id="portfolio-editor-title"
            className="font-display text-2xl font-semibold tracking-tight text-mint"
          >
            Portfolio Allocation
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-black/5 bg-white/70 p-2 text-text-muted transition-colors hover:bg-white hover:text-text-primary"
            title="Close portfolio editor"
            aria-label="Close portfolio editor"
          >
            <X size={18} />
          </button>
        </div>

        <Allocator
          allocations={draftAllocations}
          setAllocations={setDraftAllocations}
        />

        <button
          type="button"
          onClick={() => onSave(draftAllocations)}
          className="mt-8 w-full cursor-pointer rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
