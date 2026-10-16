import TopBar from "./TopBar";
import FitToHeight from "./FitToHeight";
import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
}

/** App frame: fixed top bar above a height-constrained, fitted main area. */
export default function Shell({ children }: ShellProps) {
  return (
    <div className="flex flex-col h-screen bg-bg text-text-primary">
      <TopBar />
      <main className="flex-1 min-h-0 overflow-hidden p-4 sm:p-5 lg:p-6">
        <FitToHeight>{children}</FitToHeight>
      </main>
    </div>
  );
}
