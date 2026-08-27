import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`bg-surface rounded-2xl p-6 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-text-muted mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
