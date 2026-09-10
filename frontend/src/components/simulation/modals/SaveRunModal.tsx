import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ModalHeader from "../../ui/ModalHeader";

interface SaveRunModalProps {
  isSaving: boolean;
  saveError: string | null;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function SaveRunModal({
  isSaving,
  saveError,
  onSave,
  onClose,
}: SaveRunModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(name);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/20 p-4 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-run-title"
        className="relative mx-auto mt-[16vh] max-w-sm overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl sm:p-7"
      >
        <ModalHeader
          title="Save this run"
          titleId="save-run-title"
          onClose={onClose}
          closeLabel="Close save dialog"
          titleClassName="font-display text-xl font-semibold tracking-tight text-mint"
          description="Identify your saved simulation."
        />

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="run-name"
            className="mb-1.5 block text-xs font-normal normal-case text-text-muted"
          >
            Run name
          </label>
          <input
            id="run-name"
            type="text"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. technology focused portfolio"
            maxLength={200}
            className="w-full rounded-lg border font-normal border-black/10 bg-white/70 px-3 py-2 text-sm outline-none transition-colors placeholder:text-text-muted/60 focus:border-mint focus:ring-2 focus:ring-mint/20"
          />

          {saveError && (
            <p role="alert" className="mt-3 text-xs text-coral">
              {saveError}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 cursor-pointer rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Run"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
