import { useState } from "react";
import { X } from "lucide-react";
import type { Allocation } from "../../types";
import Allocator from "../simulation/Allocator";

type PortfolioEditorProps = {
  allocations: Allocation[];
  setAllocations: (allocations: Allocation[]) => void;
};

export default function PortfolioEditor({
  allocations,
  setAllocations,
}: PortfolioEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-mint"
      >
        Edit portfolio
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-bg p-6">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mb-6 flex items-center gap-2 text-sm text-text-muted"
            >
              <X size={16} />
              Close
            </button>

            <Allocator
              allocations={allocations}
              setAllocations={setAllocations}
            />
          </div>
        </div>
      )}
    </>
  );
}
