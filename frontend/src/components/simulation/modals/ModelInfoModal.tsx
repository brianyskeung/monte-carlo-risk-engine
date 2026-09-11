import { useEffect } from "react";
import { createPortal } from "react-dom";
import ModalHeader from "../../ui/ModalHeader";

interface ModelInfoModalProps {
  title: string;
  description: string;
  onClose: () => void;
}

export default function ModelInfoModal({
  title,
  description,
  onClose,
}: ModelInfoModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="model-info-title"
        className="relative w-full max-w-sm rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl"
      >
        <ModalHeader
          title={title}
          titleId="model-info-title"
          onClose={onClose}
          closeLabel="Close model info"
          titleClassName="font-display text-lg font-semibold tracking-tight text-mint"
          description="Model Description"
        />
        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </div>,
    document.body,
  );
}
