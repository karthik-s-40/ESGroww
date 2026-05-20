import { memo, type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id?: string;
  label: ReactNode;
  children: ReactNode;
  error?: string;
  hint?: ReactNode;
  className?: string;
}

/**
 * Label + control + helper/error — composes with `Input`, `select`, etc.
 */
export const FormField = memo(function FormField({ id, label, children, error, hint, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {typeof label === "string" ? (
        <Label htmlFor={id} className="text-foreground">
          {label}
        </Label>
      ) : (
        <div className="text-sm font-medium leading-none text-foreground">{label}</div>
      )}
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
