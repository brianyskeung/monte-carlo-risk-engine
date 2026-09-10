import { Maximize2 } from "lucide-react";
import type { SavedRun } from "../../types";

interface SavedRunListItemProps {
  run: SavedRun;
  onOpen: () => void;
  onMaximize: () => void;
  onDelete: () => void;
}

function formatDate(value: string) {
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString();
}

export default function SavedRunListItem({
  run,
  onOpen,
  onMaximize,
  onDelete,
}: SavedRunListItemProps) {
  return (
    <article className="group relative flex flex-col rounded-xl border border-black/5 bg-white p-3 shadow-sm transition-all hover:border-black/15 hover:shadow-md">
      <button
        className="absolute right-3 top-3 rounded-md p-1 text-text-muted opacity-0 transition-opacity hover:text-mint focus:opacity-100 focus:outline-none group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onMaximize();
        }}
        title="Maximize"
        aria-label="View run details"
      >
        <Maximize2 size={14} />
      </button>

      <button className="w-full pr-6 text-left focus:outline-none" onClick={onOpen}>
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
          onDelete();
        }}
      >
        Delete
      </button>
    </article>
  );
}
