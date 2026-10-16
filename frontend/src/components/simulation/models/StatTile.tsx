interface StatTileProps {
  label: string;
  model: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

/** Headline metric tile: label, value, and the model the value came from. */
export default function StatTile({
  label,
  model,
  value,
  tone = "neutral",
}: StatTileProps) {
  const toneClasses = {
    positive: "text-emerald-600",
    negative: "text-rose-600",
    neutral: "text-text-primary",
  };

  return (
    <div className="min-w-0 rounded-xl border border-stone-200/70 bg-bg/60 px-4 py-3">
      <p className="truncate text-2xs font-medium text-text-muted">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold tabular-nums ${toneClasses[tone]}`}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-text-muted">{model}</p>
    </div>
  );
}
