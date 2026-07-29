"use client";

import * as React from "react";
import MuiLinearProgress from "@mui/material/LinearProgress";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => (
    <div ref={ref} className={cn("relative w-full", className)} {...props}>
      <MuiLinearProgress
        variant="determinate"
        value={value ?? 0}
        sx={{
          height: 8,
          borderRadius: 99,
          backgroundColor: "var(--color-surface-3)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 99,
            background: "linear-gradient(90deg, rgb(var(--primary-700-rgb)), rgb(var(--primary-500-rgb)), rgb(var(--primary-400-rgb)))",
            transition: "transform 0.5s ease-out",
          },
        }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
