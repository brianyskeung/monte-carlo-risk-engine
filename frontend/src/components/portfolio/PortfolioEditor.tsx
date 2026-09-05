import { useEffect, useState } from "react";
import type { Allocation } from "../../types";
import ModalHeader from "../ui/ModalHeader";
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 p-4 backdrop-blur-md sm:p-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(5,150,105,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_32%)]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-editor-title"
        className="relative mx-auto mt-[5vh] max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:mt-[10vh] sm:p-8"
      >
        <ModalHeader
          title="Portfolio Allocation"
          titleId="portfolio-editor-title"
          onClose={onClose}
          closeLabel="Close portfolio editor"
          titleClassName="font-display text-2xl font-semibold tracking-tight text-mint"
        />

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
