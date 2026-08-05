export default function StatCard({ label, value, delta, positive = true }) {
  return (
    <div className="bg-surface rounded-2xl p-5">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className="font-mono text-2xl font-medium">{value}</div>
      {delta && (
        <div className={`font-mono text-xs mt-1 ${positive ? "text-mint" : "text-coral"}`}>
          {delta}
        </div>
      )}
    </div>
  );
}