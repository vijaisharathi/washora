import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary border-primary/30",
        secondary:
          "border-transparent bg-secondary-container text-on-surface border-white/5",
        destructive:
          "border-transparent bg-error-container/40 text-error border-error/30",
        outline: "border-outline-variant text-on-surface-variant",
        success: "border-green-500/30 bg-green-500/20 text-green-400",
        accent: "border-primary-container bg-primary-container text-on-primary-container",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
