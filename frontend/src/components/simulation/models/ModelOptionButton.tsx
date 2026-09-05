import { Check } from "lucide-react";
import type { ModelId } from "../../../types";

interface ModelOptionButtonProps {
  modelId: ModelId;
  name: string;
  description: string;
  isSelected: boolean;
  onToggle: (modelId: ModelId) => void;
}

export default function ModelOptionButton({
  modelId,
  name,
  description,
  isSelected,
  onToggle,
}: ModelOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(modelId)}
      className={`flex w-full items-start gap-3 rounded-xl p-1.5 text-left shadow-sm ring-1 transition-colors ${
        isSelected
          ? "bg-emerald-50/80 ring-mint/35"
          : "bg-white/70 ring-black/5 hover:bg-white"
      }`}
    >
      <span
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${
          isSelected
            ? "border-mint bg-mint text-white"
            : "border-black/15 bg-bg/70"
        }`}
      >
        {isSelected && <Check size={13} strokeWidth={3} />}
      </span>
      <span className="min-w-0 py-1">
        <span className="block text-sm font-medium text-text-primary">
          {name}
        </span>
        <span className="mt-0.5 block text-xs text-text-muted">
          {description}
        </span>
      </span>
    </button>
  );
}
