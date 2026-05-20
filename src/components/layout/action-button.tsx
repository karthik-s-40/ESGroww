import { memo, type ComponentProps } from "react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type ButtonProps = ComponentProps<typeof Button>;

export type ActionButtonProps = ButtonProps &
  VariantProps<typeof buttonVariants> & {
    /** Primary CTA — same as default variant with consistent min tap target */
    prominence?: "default" | "subtle";
  };

/**
 * Thin semantic wrapper over `Button` for primary / secondary actions site-wide.
 * All behavior is delegated to the underlying Base UI button.
 */
export const ActionButton = memo(function ActionButton({
  className,
  prominence = "default",
  size = "default",
  variant = "default",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(prominence === "default" && variant === "default" && "min-h-9 font-semibold", className)}
      {...props}
    />
  );
});
