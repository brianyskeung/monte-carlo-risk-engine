import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ModelId } from "../../types";
import { MODEL_OPTIONS } from "../../constants/simulationOptions";
import ModalHeader from "../ui/ModalHeader";
import SectionHeader from "../ui/SectionHeader";
import SearchInput from "../ui/SearchInput";
import ScrollArea from "../ui/ScrollArea";
import ModelOptionButton from "./models/ModelOptionButton";

interface ModelFilterModalProps {
  selectedModels: ModelId[];
  onChange: (models: ModelId[]) => void;
  onClose: () => void;
}

export default function ModelFilterModal({
  selectedModels,
  onChange,
  onClose,
}: ModelFilterModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleModel = (modelId: ModelId) => {
    if (selectedModels.includes(modelId)) {
      onChange(selectedModels.filter((selectedId) => selectedId !== modelId));
      return;
    }

    onChange([...selectedModels, modelId]);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredModels = normalizedQuery
    ? MODEL_OPTIONS.filter((model) =>
        model.name.toLowerCase().includes(normalizedQuery),
      )
    : MODEL_OPTIONS;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-filter-title"
        className="relative flex max-h-modal-panel w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-7"
      >
        <ModalHeader
          title="Filter by model"
          titleId="model-filter-title"
          onClose={onClose}
          closeLabel="Close model filter"
          titleClassName="font-display text-xl font-semibold tracking-tight text-mint"
          description="Show only saved runs that used the selected models."
        />

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/45 p-4">
          <SectionHeader
            label="Model Filter"
            value={
              selectedModels.length === 0
                ? "All"
                : `${selectedModels.length}/${MODEL_OPTIONS.length}`
            }
          />

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search models"
            aria-label="Search models"
            className="mb-3 shrink-0"
          />

          <ScrollArea className="max-h-80 space-y-2.5 p-1">
            {filteredModels.map((model) => {
              const isSelected = selectedModels.includes(model.id);

              return (
                <ModelOptionButton
                  key={model.id}
                  modelId={model.id}
                  name={model.name}
                  description={model.description}
                  isSelected={isSelected}
                  onToggle={toggleModel}
                />
              );
            })}

            {filteredModels.length === 0 && (
              <p className="px-1 py-6 text-center text-sm text-text-muted">
                No models match "{query.trim()}".
              </p>
            )}
          </ScrollArea>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={selectedModels.length === 0}
            className="flex-1 cursor-pointer rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
