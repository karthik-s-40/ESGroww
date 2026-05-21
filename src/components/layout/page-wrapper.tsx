import { memo, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageWrapperMax = "narrow" | "content" | "wide" | "full";

const maxClass: Record<PageWrapperMax, string> = {
  narrow: "max-w-3xl",
  content: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-none",
};

export interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  /** Horizontal max width preset */
  maxWidth?: PageWrapperMax;
  /** Tighter vertical rhythm for dense dashboards */
  dense?: boolean;
  /** Optional ID for the wrapper element */
  id?: string;
}

/**
 * Consistent horizontal padding and max-width for page content.
 * Use inside `<main>` from root layout — does not replace routing or data flow.
 */
export const PageWrapper = memo(function PageWrapper({
  children,
  className,
  maxWidth = "full",
  dense,
  id,
}: PageWrapperProps) {
  return (
    <div
      id={id}
      className={cn(
        "mx-auto flex w-full min-w-0 flex-1 flex-col",
        maxClass[maxWidth],
        dense ? "gap-2 py-2 sm:gap-3 sm:py-3" : "gap-4 py-3 sm:gap-5 sm:py-4",
        className
      )}
    >
      {children}
    </div>
  );
});
