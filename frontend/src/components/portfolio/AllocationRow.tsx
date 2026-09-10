import { Trash2 } from "lucide-react";
import type { Allocation } from "../../types";

interface AllocationRowProps {
  allocation: Allocation;
  maximumWeight: number;
  onTickerChange: (ticker: string) => void;
  onWeightChange: (weight: number) => void;
  onRemove: () => void;
}

export default function AllocationRow({
  allocation,
  maximumWeight,
  onTickerChange,
  onWeightChange,
  onRemove,
}: AllocationRowProps) {
  const fillPercent =
    maximumWeight > 0
      ? Math.min(100, (allocation.weight / maximumWeight) * 100)
      : 0;

  return (
    <div className="grid grid-cols-allocation-row items-center gap-1 rounded-xl bg-white/70 p-1 shadow-sm ring-1 ring-black/5">
      <input
        type="text"
        value={allocation.ticker}
        onChange={(event) => onTickerChange(event.target.value.toUpperCase())}
        placeholder="Ticker"
        className="min-w-0 rounded-lg border-0 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-text-muted/60 focus:ring-2 focus:ring-mint/20"
        required
      />

      <input
        type="range"
        min="0"
        max={maximumWeight}
        step="1"
        value={allocation.weight}
        onChange={(event) => onWeightChange(Number(event.target.value))}
        aria-label={`${allocation.ticker || "Asset"} allocation weight`}
        style={{
          background: `linear-gradient(to right, var(--color-mint) ${fillPercent}%, rgb(0 0 0 / 0.08) ${fillPercent}%)`,
        }}
        className="min-w-0 w-full cursor-pointer appearance-none rounded-full outline-none transition-shadow
          [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent
          [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent
          [&::-webkit-slider-thumb]:-mt-1.25 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-mint [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-emerald-900/25 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-mint [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:shadow-emerald-900/25 [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110
          focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-mint/40 focus-visible:[&::-moz-range-thumb]:ring-2 focus-visible:[&::-moz-range-thumb]:ring-mint/40"
      />

      <div className="relative flex items-center">
        <input
          type="number"
          min="0"
          max={maximumWeight}
          value={allocation.weight === 0 ? "" : allocation.weight}
          placeholder="0"
          onChange={(event) => {
            const nextWeight =
              event.target.value === "" ? 0 : Number(event.target.value);
            onWeightChange(Number.isFinite(nextWeight) ? nextWeight : 0);
          }}
          className="w-full rounded-lg border-0 bg-bg/70 py-1.5 pl-1 pr-6 text-right text-sm outline-none placeholder:text-text-muted/50 focus:ring-2 focus:ring-mint/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          required
        />

        <span
          className={`pointer-events-none absolute right-2 text-xs transition-colors ${
            allocation.weight > 0 ? "text-text-primary" : "text-text-muted/60"
          }`}
        >
          %
        </span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-rose-50 hover:text-coral"
        title={`Remove ${allocation.ticker || "asset"}`}
        aria-label={`Remove ${allocation.ticker || "asset"}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
