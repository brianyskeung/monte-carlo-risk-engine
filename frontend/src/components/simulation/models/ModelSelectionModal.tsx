import { useEffect } from "react";
import type { ModelId } from "../../../types";
import ModalHeader from "../../ui/ModalHeader";
import SectionHeader from "../../ui/SectionHeader";
import ModelOptionButton from "./ModelOptionButton";

interface ModelOption {
  id: ModelId;
  name: string;
  description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "historical_bootstrap",
    name: "Historical Bootstrap",
    description: "Resamples observed market return patterns.",
  },
  {
    id: "geometric_brownian_motion",
    name: "Geometric Brownian Motion",
    description: "Fits a statistical distribution to historical returns.",
  },
];

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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 p-4 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-selector-title"
        className="relative mx-auto mt-[10vh] max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-7"
      >
        <ModalHeader
          title="Choose simulation models"
          titleId="model-selector-title"
          onClose={onClose}
          closeLabel="Close model selector"
          description="Select the models you want to compare."
        />

        <div className="rounded-2xl border border-black/5 bg-white/45 p-4">
          <SectionHeader
            label="Model Selection"
            value={`${selectedModels.length}/${MODEL_OPTIONS.length}`}
          />

          <div className="space-y-2.5">
            {MODEL_OPTIONS.map((model) => {
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
    </div>
  );
}
