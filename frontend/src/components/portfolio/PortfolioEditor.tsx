import { X } from "lucide-react";
import { useState } from "react";
import type { Allocation } from "../../types";
import Allocator from "../simulation/Allocator";

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg p-6">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-sm text-text-muted"
        >
          <X size={16} />
          Close
        </button>

        <Allocator
          allocations={draftAllocations}
          setAllocations={setDraftAllocations}
        />

        <button
          type="button"
          onClick={() => onSave(draftAllocations)}
          className="mt-6 bg-mint px-4 py-2 text-sm font-medium text-white"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
