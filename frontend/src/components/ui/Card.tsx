import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/** Rounded surface panel with an optional uppercase section title. */
export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-black/5 p-5 shadow-sm shadow-black/2 ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-label text-text-muted">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
