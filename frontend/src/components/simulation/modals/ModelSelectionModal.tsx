import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ModelId } from "../../../types";
import { MODEL_OPTIONS } from "../../../constants/simulationOptions";
import ModalHeader from "../../ui/ModalHeader";
import SectionHeader from "../../ui/SectionHeader";
import SearchInput from "../../ui/SearchInput";
import ModelOptionButton from "../models/ModelOptionButton";

interface ModelSelectionModalProps {
  selectedModels: ModelId[];
  onChange: (models: ModelId[]) => void;
  onClose: () => void;
}

export default function ModelSelectionModal({
  selectedModels,
  onChange,
  onClose,
}: ModelSelectionModalProps) {
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
      if (selectedModels.length === 1) return;
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
        aria-labelledby="model-selector-title"
        className="relative flex max-h-modal-panel w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-7"
      >
        <ModalHeader
          title="Choose simulation models"
          titleId="model-selector-title"
          onClose={onClose}
          closeLabel="Close model selector"
          titleClassName="font-display text-xl font-semibold tracking-tight text-mint"
          description="Select the models you want to compare."
        />

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/45 p-4">
          <SectionHeader
            label="Model Selection"
            value={`${selectedModels.length}/${MODEL_OPTIONS.length}`}
          />

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search models"
            aria-label="Search models"
            className="mb-3 shrink-0"
          />

          <div className="scroll-area max-h-80 space-y-2.5 overflow-y-auto p-1">
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
                No models match “{query.trim()}”.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Done
        </button>
      </div>
    </div>,
    document.body,
  );
}
