import { memo, type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SectionCardProps {
  children: ReactNode;
  className?: string;
  /** Optional heading */
  title?: ReactNode;
  description?: ReactNode;
  /** Right side of header row (tabs, actions) */
  headerAction?: ReactNode;
  footer?: ReactNode;
  /** Smaller padding via Card size */
  size?: "default" | "sm";
}

/**
 * Opinionated card for grouped sections — uses theme `card` / `border` tokens.
 */
export const SectionCard = memo(function SectionCard({
  children,
  className,
  title,
  description,
  headerAction,
  footer,
  size = "default",
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || headerAction);

  return (
    <Card size={size} className={cn("border-border shadow-sm", className)}>
      {hasHeader && (
        <CardHeader
          className={cn(
            "flex flex-row flex-wrap items-start gap-2 border-b border-border/70 pb-3",
            title || description ? "justify-between" : "justify-end border-0 pb-2"
          )}
        >
          {(title || description) && (
            <div className="min-w-0 flex-1 space-y-1">
              {title ? <CardTitle className="text-foreground">{title}</CardTitle> : null}
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
          )}
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </CardHeader>
      )}
      <CardContent className={cn(hasHeader && "pt-4")}>{children}</CardContent>
      {footer ? <CardFooter className="text-muted-foreground">{footer}</CardFooter> : null}
    </Card>
  );
});
