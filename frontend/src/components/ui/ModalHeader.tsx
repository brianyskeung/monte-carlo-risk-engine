import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalHeaderProps {
  title: string;
  titleId: string;
  onClose: () => void;
  closeLabel: string;
  description?: ReactNode;
  titleClassName?: string;
}

export default function ModalHeader({
  title,
  titleId,
  onClose,
  closeLabel,
  description,
  titleClassName = "font-display text-xl font-semibold text-text-primary",
}: ModalHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 id={titleId} className={titleClassName}>
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-full border border-black/5 bg-white/70 p-2 text-text-muted transition-colors hover:bg-white hover:text-text-primary"
        title={closeLabel}
        aria-label={closeLabel}
      >
        <X size={18} />
      </button>
    </div>
  );
}
