import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import SaveRunModal from "./modals/SaveRunModal";

interface SaveRunButtonProps {
  onSaveRun: (name: string) => void;
  isSaving?: boolean;
  isSaved?: boolean;
  saveError?: string | null;
}

export default function SaveRunButton({
  onSaveRun,
  isSaving,
  isSaved,
  saveError,
}: SaveRunButtonProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  useEffect(() => {
    if (isSaved) setSaveModalOpen(false);
  }, [isSaved]);

  return (
    <>
      <button
        type="button"
        onClick={() => setSaveModalOpen(true)}
        disabled={isSaving || isSaved}
        className="inline-flex items-center gap-2 rounded-lg border border-black/10
        bg-white px-3 py-2 text-sm font-medium text-text-primary transition-colors
        hover:cursor-pointer hover:border-mint hover:text-mint focus:border-mint
        focus:text-mint disabled:cursor-not-allowed disabled:opacity-60
        disabled:hover:border-black/10 disabled:hover:text-text-primary"
      >
        {isSaved ? <Check size={16} /> : <Save size={16} />}
        <span>{isSaving ? "Saving..." : isSaved ? "Saved" : "Save Run"}</span>
      </button>

      {saveModalOpen && (
        <SaveRunModal
          isSaving={!!isSaving}
          saveError={saveError ?? null}
          onSave={onSaveRun}
          onClose={() => setSaveModalOpen(false)}
        />
      )}
    </>
  );
}
