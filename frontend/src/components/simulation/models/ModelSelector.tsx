import { useState } from "react";
import type { ModelId } from "../../../types";
import ModelSelectionModal from "./ModelSelectionModal";

interface ModelSelectorProps {
  selectedModels: ModelId[];
  onChange: (models: ModelId[]) => void;
}

export default function ModelSelector({
  selectedModels,
  onChange,
}: ModelSelectorProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setSelectorOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-mint hover:text-mint hover:cursor-pointer"
      >
        <span>Models</span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs tabular-nums text-emerald-700">
          {selectedModels.length}
        </span>
      </button>

      {selectorOpen && (
        <ModelSelectionModal
          selectedModels={selectedModels}
          onChange={onChange}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </>
  );
}
