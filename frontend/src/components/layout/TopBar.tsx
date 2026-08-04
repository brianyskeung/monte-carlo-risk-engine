

export default function TopBar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-black/5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-mint" />
        <h1 className="font-display font-semibold text-lg tracking-tight">
          monte carlo risk engine
        </h1>
      </div>
    </header>
  );
}