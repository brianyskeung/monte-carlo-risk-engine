interface AdvancedStatItemProps {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

export default function AdvancedStatItem({
  label,
  value,
  tone = "neutral",
}: AdvancedStatItemProps) {
  const toneClasses = {
    positive: "text-emerald-600",
    negative: "text-rose-600",
    neutral: "text-text-primary",
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-200/80 py-2.5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${toneClasses[tone]}`}>
        {value}
      </p>
    </div>
  );
}
