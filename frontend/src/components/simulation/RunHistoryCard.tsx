import axios from "axios";
import { useEffect, useState } from "react";
import type { SavedRun, SavedRunDetail } from "../../types";
import ScrollArea from "../ui/ScrollArea";

const API_URL = "http://localhost:8000";

interface RunHistoryCardProps {
  onOpen: (run: SavedRunDetail) => void;
  refreshKey: number | null;
}

function formatDate(value: string) {
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString();
}

export default function RunHistoryCard({
  onOpen,
  refreshKey,
}: RunHistoryCardProps) {
  const [runs, setRuns] = useState<SavedRun[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <aside className="absolute inset-0 flex h-full w-full flex-col rounded-2xl bg-surface p-5">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h3 className="uppercase tracking-wider text-sm font-medium text-text-muted">
            Saved runs
          </h3>
          <button
            className="text-xs font-medium text-mint transition-colors hover:text-emerald-600 focus:outline-none focus:underline"
            onClick={() => void loadRuns()}
          >
            Refresh
          </button>
        </div>

        {error && <p className="mb-3 shrink-0 text-xs text-coral">{error}</p>}

        {runs.length === 0 ? (
          <p className="text-sm text-text-muted">
            Completed simulations will appear here.
          </p>
        ) : (
          <ScrollArea className="flex-1 min-h-0 space-y-3">
            {runs.map((run) => (
              <article
                key={run.id}
                className="group relative flex flex-col rounded-xl border border-black/5 bg-white p-3 shadow-sm transition-all hover:border-black/15 hover:shadow-md"
              >
                <button
                  className="w-full text-left focus:outline-none"
                  onClick={() => void openRun(run.id)}
                >
                  <p className="truncate font-medium text-text-primary transition-colors group-hover:text-mint">
                    {run.name || run.tickers.join(" · ")}
                  </p>
                  {run.name && (
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {run.tickers.join(" · ")}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-text-muted">
                    {formatDate(run.created_at)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-text-muted">
                    {run.num_simulations.toLocaleString()} paths ·{" "}
                    {run.forecasted_days} days
                  </p>
                </button>

                <button
                  className="absolute bottom-3 right-3 text-xs font-medium text-coral opacity-0 transition-opacity hover:underline focus:underline focus:opacity-100 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    void removeRun(run.id);
                  }}
                >
                  Delete
                </button>
              </article>
            ))}
          </ScrollArea>
        )}
      </aside>
    </div>
  );
}
