import type { ReactNode } from "react";

interface SectionHeaderProps {
  label: string;
  value: ReactNode;
}

export default function SectionHeader({ label, value }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-emerald-700">
        {value}
      </span>
    </div>
  );
}
