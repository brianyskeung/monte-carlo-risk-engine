interface AdvancedStatItemProps {
  label: string;
  value: string;
}

export default function AdvancedStatItem({
  label,
  value,
}: AdvancedStatItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-200/80 py-2.5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-text-primary">
        {value}
      </p>
    </div>
  );
}
