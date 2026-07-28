"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/20",
        secondary: "bg-surface-2 text-text-secondary ring-1 ring-inset ring-border/10",
        success: "bg-success/10 text-success ring-1 ring-inset ring-success/20",
        warning: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/20",
        outline: "border border-border/10 text-text-secondary",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
