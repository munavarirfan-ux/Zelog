"use client";

import * as React from "react";
import MuiChip from "@mui/material/Chip";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "outline";
}

const variantStyles: Record<string, string> = {
  default: "!bg-accent/10 !text-accent !ring-1 !ring-inset !ring-accent/20",
  secondary: "!bg-surface-2 !text-text-secondary !ring-1 !ring-inset !ring-border/10",
  success: "!bg-success/10 !text-success !ring-1 !ring-inset !ring-success/20",
  warning: "!bg-warning/10 !text-warning !ring-1 !ring-inset !ring-warning/20",
  outline: "!border !border-border/10 !text-text-secondary !bg-transparent",
};

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <MuiChip
      label={children}
      size="small"
      className={cn(
        "!h-auto !rounded-full !px-2 !py-0.5 !text-[11px] !font-semibold !leading-4",
        variantStyles[variant] || variantStyles.default,
        className,
      )}
      sx={{
        "& .MuiChip-label": { padding: 0, lineHeight: "16px" },
      }}
      {...(props as any)}
    />
  );
}

export { Badge };
