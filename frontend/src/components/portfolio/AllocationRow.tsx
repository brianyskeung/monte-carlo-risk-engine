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
  return (
    <div className="flex gap-2 rounded-xl bg-white/70 p-1.5 shadow-sm ring-1 ring-black/5">
      <input
        type="text"
        value={allocation.ticker}
        onChange={(event) => onTickerChange(event.target.value.toUpperCase())}
        placeholder="Ticker"
        className="min-w-0 flex-1 rounded-lg border-0 bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-text-muted/60 focus:ring-2 focus:ring-mint/20"
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
        className="min-w-20 flex-1 cursor-pointer accent-mint"
      />

      <input
        type="number"
        min="0"
        max={maximumWeight}
        value={allocation.weight === 0 ? "" : allocation.weight}
        onChange={(event) => {
          const nextWeight =
            event.target.value === "" ? 0 : Number(event.target.value);
          onWeightChange(Number.isFinite(nextWeight) ? nextWeight : 0);
        }}
        className="w-24 rounded-lg border-0 bg-bg/70 px-2.5 py-2 text-right text-sm outline-none focus:ring-2 focus:ring-mint/20"
        required
      />

      <button
        type="button"
        onClick={onRemove}
        className="cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-rose-50 hover:text-coral"
        title={`Remove ${allocation.ticker || "asset"}`}
        aria-label={`Remove ${allocation.ticker || "asset"}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}