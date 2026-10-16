import type { ReactNode } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
}

/** Vertically scrollable region using the app's custom scrollbar styling. */
export default function ScrollArea({ children, className = "" }: ScrollAreaProps) {
  return (
    <div className={`scroll-area min-h-0 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
