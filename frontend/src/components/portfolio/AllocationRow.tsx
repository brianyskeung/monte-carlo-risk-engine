import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Allocation } from "../../types";
import useTickerSearch from "../../hooks/useTickerSearch";

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

  const [isFocused, setIsFocused] = useState(false);
  const matches = useTickerSearch(isFocused ? allocation.ticker : "");
  const showMatches = isFocused && matches.length > 0;

  const selectMatch = (symbol: string) => {
    onTickerChange(symbol.toUpperCase());
    setIsFocused(false);
  };

  return (
    <div className="grid grid-cols-allocation-row items-center gap-1 rounded-xl bg-white/70 p-1 shadow-sm ring-1 ring-black/5">
      <div className="relative min-w-0">
        <input
          type="text"
          value={allocation.ticker}
          onChange={(event) =>
            onTickerChange(event.target.value.toUpperCase())
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder="Ticker"
          autoComplete="off"
          className="min-w-0 w-full rounded-lg border-0 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-text-muted/60 focus:ring-2 focus:ring-mint/20"
          required
        />

        {showMatches && (
          <ul className="scroll-area absolute top-full left-0 z-10 mt-1 max-h-56 w-56 overflow-y-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/10">
            {matches.map((match) => (
              <li key={match.symbol}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectMatch(match.symbol)}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-emerald-50"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{match.symbol}</span>
                    {match.name && (
                      <span className="ml-1.5 truncate text-xs text-text-muted/70">
                        {match.name}
                      </span>
                    )}
                  </span>
                  {match.exchange && (
                    <span className="shrink-0 text-xs text-text-muted/50">
                      {match.exchange}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
