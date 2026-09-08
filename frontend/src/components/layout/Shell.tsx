import TopBar from "./TopBar";
import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
}

export default function Shell({ children }: ShellProps) {
  return (
    <div className="flex flex-col h-screen bg-bg text-text-primary">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
