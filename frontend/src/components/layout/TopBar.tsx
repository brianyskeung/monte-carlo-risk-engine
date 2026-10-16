

/** Fixed application header: product mark and title. */
export default function TopBar() {
  return (
    <header className="h-12 flex items-center justify-between px-4 sm:px-6 border-b border-black/5 bg-surface/70 backdrop-blur">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-5 h-5 shrink-0 rounded-full bg-mint ring-4 ring-mint/15" />
        <h1 className="truncate font-display font-semibold text-sm sm:text-base tracking-tight">
          monte carlo risk engine
        </h1>
      </div>
    </header>
  );
}
