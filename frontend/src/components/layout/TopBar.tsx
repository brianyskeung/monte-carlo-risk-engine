

export default function TopBar() {
  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-black/5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 shrink-0 rounded-full bg-mint" />
        <h1 className="truncate font-display font-semibold text-base sm:text-lg tracking-tight">
          monte carlo risk engine
        </h1>
      </div>
    </header>
  );
}
