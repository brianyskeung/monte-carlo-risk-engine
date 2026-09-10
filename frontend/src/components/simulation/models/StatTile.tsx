interface StatTileProps {
  label: string;
  model: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

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
    <div className="rounded-xl border border-stone-200/70 bg-bg/60 px-4 py-4">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClasses[tone]}`}>
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-text-muted">{model}</p>
    </div>
  );
}
