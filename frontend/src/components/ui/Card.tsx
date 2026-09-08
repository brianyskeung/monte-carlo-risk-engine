import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl px-6 pb-6 ${title ? "pt-6" : "pt-4"} ${className}`}
    >
      {title && (
        <h3 className="text-sm font-medium text-text-muted mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
