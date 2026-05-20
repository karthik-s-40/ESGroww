import { memo, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface DataCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  /** Compact padding for grids / tables */
  compact?: boolean;
}

/**
 * Lightweight surface for metrics / KPI tiles (not full Card chrome).
 */
export const DataCard = memo(function DataCard({ children, className, title, compact }: DataCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm ring-1 ring-foreground/[0.06]",
        compact ? "p-2.5 sm:p-3" : "p-4",
        className
      )}
    >
      {title ? <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p> : null}
      {children}
    </div>
  );
});
