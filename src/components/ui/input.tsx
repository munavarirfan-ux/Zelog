"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full min-w-0 rounded-[10px] border border-border/10 bg-surface px-3 py-2 text-sm text-text shadow-none placeholder:text-text-tertiary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
