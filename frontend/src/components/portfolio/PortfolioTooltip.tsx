import type { AssetInfoMap } from "../../types";

interface PortfolioTooltipProps {
  active?: boolean;
  assets: AssetInfoMap;
  payload?: Array<{
    payload: {
      ticker?: string;
      assetName?: string;
      assetType?: string;
      assetSector?: string;
      weight?: number;
    };
  }>;
}

export default function PortfolioTooltip({
  active,
  assets,
  payload,
}: PortfolioTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const normalizedTicker = item.ticker?.trim().toUpperCase();
  const asset = normalizedTicker ? assets[normalizedTicker] : undefined;
  const securityName = item.assetName || item.ticker || "Unknown security";
  const securityType = item.assetType || "Unknown type";
  const sector = item.assetSector || asset?.sector;
  const weight = Number(item.weight ?? 0);

  return (
    <div className="w-52.5 max-w-52.5 rounded-lg border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <div className="border-b border-stone-100 pb-1.5">
        <p className="text-3xs font-medium uppercase tracking-label-sm text-stone-400">
          {item.ticker || "Asset"}
        </p>
      </div>

      <div className="mt-2 space-y-1 text-xs text-stone-600">
        <p className="wrap-break-words leading-snug">
          <span className="font-medium text-stone-700">Name:</span>{" "}
          {securityName}
        </p>
        <p className="wrap-break-words leading-snug">
          <span className="font-medium text-stone-700">Type:</span>{" "}
          {securityType}
        </p>
        {sector && (
          <p className="wrap-break-words leading-snug">
            <span className="font-medium text-stone-700">Sector:</span> {sector}
          </p>
        )}
        <p>
          <span className="font-medium text-stone-700">
            Portfolio percentage:
          </span>{" "}
          {weight.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
