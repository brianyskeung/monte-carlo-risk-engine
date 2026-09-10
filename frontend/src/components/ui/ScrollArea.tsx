import type { ReactNode } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
}

export default function ScrollArea({ children, className = "" }: ScrollAreaProps) {
  return (
    <div className={`scroll-area min-h-0 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
