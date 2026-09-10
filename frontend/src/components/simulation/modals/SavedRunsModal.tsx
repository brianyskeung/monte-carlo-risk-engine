import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal } from "lucide-react";
import type { ModelId, SavedRun } from "../../../types";
import ModalHeader from "../../ui/ModalHeader";
import SearchInput from "../../ui/SearchInput";
import ScrollArea from "../../ui/ScrollArea";
import SavedRunListItem from "../SavedRunListItem";
import ModelFilterModal from "./ModelFilterModal";

interface SavedRunsModalProps {
  runs: SavedRun[];
  error: string | null;
  onOpenRun: (id: number) => void;
  onMaximizeRun: (run: SavedRun) => void;
  onDeleteRun: (id: number) => void;
  onClose: () => void;
}

export default function SavedRunsModal({
  runs,
  error,
  onOpenRun,
  onMaximizeRun,
  onDeleteRun,
  onClose,
}: SavedRunsModalProps) {
  const [query, setQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<ModelId[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filteredRuns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return runs.filter((run) => {
      const matchesQuery =
        !normalizedQuery ||
        (run.name ?? "").toLowerCase().includes(normalizedQuery) ||
        run.tickers.some((ticker) =>
          ticker.toLowerCase().includes(normalizedQuery),
        );

      const matchesModels =
        modelFilter.length === 0 ||
        modelFilter.every((modelId) => run.models.includes(modelId));

      return matchesQuery && matchesModels;
    });
  }, [runs, query, modelFilter]);

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
        aria-labelledby="saved-runs-title"
        className="relative flex h-modal-panel max-h-modal-panel w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-7"
      >
        <ModalHeader
          title="Saved runs"
          titleId="saved-runs-title"
          onClose={onClose}
          closeLabel="Close saved runs"
          titleClassName="font-display text-xl font-semibold tracking-tight text-mint"
          description="Search and filter your saved simulations."
        />

        <div className="mb-4 flex shrink-0 items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name or ticker"
            aria-label="Search saved runs"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              modelFilter.length > 0
                ? "border-mint bg-emerald-50/80 text-mint"
                : "border-black/10 bg-white/70 text-text-muted hover:border-mint hover:text-mint"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filter
            {modelFilter.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-mint text-3xs font-semibold text-white">
                {modelFilter.length}
              </span>
            )}
          </button>
        </div>

        {error && <p className="mb-3 shrink-0 text-xs text-coral">{error}</p>}

        {filteredRuns.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-text-muted">
              {runs.length === 0
                ? "Completed simulations will appear here."
                : "No saved runs match your search."}
            </p>
          </div>
        ) : (
          <ScrollArea className="min-h-0 flex-1 space-y-3 pr-1">
            {filteredRuns.map((run) => (
              <SavedRunListItem
                key={run.id}
                run={run}
                onOpen={() => onOpenRun(run.id)}
                onMaximize={() => onMaximizeRun(run)}
                onDelete={() => onDeleteRun(run.id)}
              />
            ))}
          </ScrollArea>
        )}
      </div>

      {isFilterModalOpen && (
        <ModelFilterModal
          selectedModels={modelFilter}
          onChange={setModelFilter}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}
    </div>,
    document.body,
  );
}
