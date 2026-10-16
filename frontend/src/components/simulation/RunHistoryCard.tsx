import axios from "axios";
import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { API_URL } from "../../constants/api";
import type { SavedRun, SavedRunDetail } from "../../types";
import ScrollArea from "../ui/ScrollArea";
import RunDetailsModal from "./modals/RunDetailsModal";
import SavedRunsModal from "./modals/SavedRunsModal";
import SavedRunListItem from "./SavedRunListItem";

interface RunHistoryCardProps {
  onOpen: (run: SavedRunDetail) => void;
  refreshKey: number | null;
}

/**
 * Saved-run sidebar: lists stored runs and handles opening, inspecting and
 * deleting them. Reloads whenever refreshKey changes (i.e. a new run saved).
 */
export default function RunHistoryCard({
  onOpen,
  refreshKey,
}: RunHistoryCardProps) {
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detailsRun, setDetailsRun] = useState<SavedRun | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  /** Refreshes the run list from the API. */
  const loadRuns = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/runs`);
      setRuns(response.data.runs);
      setError(null);
    } catch {
      setError("History is unavailable.");
    }
  };

  useEffect(() => {
    void loadRuns();
  }, [refreshKey]);

  /** Fetches a run including its chart data and hands it to the page. */
  const openRun = async (id: number) => {
    try {
      const response = await axios.get<SavedRunDetail>(
        `${API_URL}/api/runs/${id}`,
      );
      onOpen(response.data);
      setError(null);
    } catch {
      setError("Could not open this run.");
    }
  };

  /** Deletes a run and drops it from the list without a refetch. */
  const removeRun = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/runs/${id}`);
      setRuns((current) => current.filter((run) => run.id !== id));
    } catch {
      setError("Could not delete this run.");
    }
  };

  return (
    <div className="relative h-full w-full">
      <aside className="absolute inset-0 flex h-full w-full flex-col rounded-2xl border border-black/5 bg-surface p-5 shadow-sm shadow-black/2">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-label text-text-muted">
            Saved runs
          </h3>
          <button
            className="cursor-pointer rounded-md p-1 text-text-muted transition-colors hover:text-mint focus:outline-none"
            onClick={() => {
              setIsListModalOpen(true);
              void loadRuns();
            }}
            title="Search and filter saved runs"
            aria-label="Search and filter saved runs"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {error && <p className="mb-3 shrink-0 text-xs text-coral">{error}</p>}

        {runs.length === 0 ? (
          <p className="text-sm text-text-muted">
            Completed simulations will appear here.
          </p>
        ) : (
          <ScrollArea className="-mr-[15px] flex-1 min-h-0 space-y-2">
            {runs.map((run) => (
              <SavedRunListItem
                key={run.id}
                run={run}
                onOpen={() => void openRun(run.id)}
                onMaximize={() => setDetailsRun(run)}
                onDelete={() => void removeRun(run.id)}
              />
            ))}
          </ScrollArea>
        )}
      </aside>

      {isListModalOpen && (
        <SavedRunsModal
          runs={runs}
          error={error}
          onOpenRun={(id) => void openRun(id)}
          onMaximizeRun={setDetailsRun}
          onDeleteRun={(id) => void removeRun(id)}
          onClose={() => setIsListModalOpen(false)}
        />
      )}

      {detailsRun && (
        <RunDetailsModal
          run={detailsRun}
          onClose={() => setDetailsRun(null)}
          onOpenRun={() => {
            const runId = detailsRun.id;
            setDetailsRun(null);
            void openRun(runId);
          }}
        />
      )}
    </div>
  );
}
