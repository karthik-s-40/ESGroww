import { cn } from "@/lib/utils";
import * as React from "react";

export function PageTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn("text-2xl font-bold tracking-tight text-foreground md:text-3xl", className)} {...props}>
      {children}
    </h1>
  );
}

export function SectionTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold tracking-tight text-foreground sm:text-xl", className)} {...props}>
      {children}
    </h2>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold leading-tight text-foreground sm:text-base", className)} {...props}>
      {children}
    </h3>
  );
}

export function BodyText({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function HelperText({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-[11px] leading-snug text-muted-foreground sm:text-xs", className)} {...props}>
      {children}
    </p>
  );
}

export function MetricValue({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-2xl font-bold tracking-tight text-foreground sm:text-3xl", className)} {...props}>
      {children}
    </p>
  );
}
