"use client";

import * as React from "react";
import MuiButton from "@mui/material/Button";
import MuiIconButton from "@mui/material/IconButton";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "white" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "default" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, disabled, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        ref,
        className: cn(getButtonClasses(variant, size), className, (children as React.ReactElement<any>).props.className),
      });
    }

    const muiVariant = variant === "outline" ? "outlined" : variant === "ghost" || variant === "link" ? "text" : "contained";
    const muiColor = variant === "destructive" ? "error" : variant === "white" ? "inherit" : "primary";

    if (size === "icon") {
      return (
        <MuiIconButton
          ref={ref}
          disabled={disabled}
          color={muiColor}
          className={cn(
            "!rounded-[10px] !transition-all !duration-200",
            variant === "ghost" && "!text-text-secondary hover:!bg-primary-50 hover:!text-text",
            variant === "outline" && "!border !border-border/10 !bg-surface !shadow-xs hover:!bg-primary-50 dark:!border-white/10",
            className,
          )}
          sx={{ width: 36, height: 36 }}
          {...(props as any)}
        >
          {children}
        </MuiIconButton>
      );
    }

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        disabled={disabled}
        disableElevation
        className={cn(getButtonClasses(variant, size), className)}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          fontSize: size === "xs" || size === "sm" ? "0.75rem" : "0.875rem",
          minWidth: "unset",
          lineHeight: 1.5,
          letterSpacing: 0,
          ...(variant === "default" && {
            background: "linear-gradient(135deg, #4133A5 0%, #5A43D5 50%, #7A4DFF 100%)",
            "&:hover": { background: "linear-gradient(135deg, #2F2775 0%, #4133A5 50%, #5A43D5 100%)" },
          }),
          ...(variant === "white" && {
            background: "#ffffff",
            color: "#2F2775",
            boxShadow: "0 4px 14px -4px rgba(47, 39, 117, 0.25)",
            "&:hover": { background: "rgba(255,255,255,0.92)" },
            "&.Mui-disabled": { background: "rgba(255,255,255,0.4)", color: "rgba(47,39,117,0.5)" },
          }),
        }}
        {...(props as any)}
      >
        {children}
      </MuiButton>
    );
  },
);
Button.displayName = "Button";

function getButtonClasses(variant: string, size: string) {
  const base = "!rounded-[10px] !transition-all !duration-200 !ease-out !font-semibold";
  const sizeClasses: Record<string, string> = {
    xs: "!h-7 !px-2.5 !text-xs",
    sm: "!h-8 !px-3 !text-xs",
    default: "!h-10 !px-4",
    lg: "!h-12 !px-6 !text-base",
    icon: "!h-9 !w-9 !p-0 !min-w-0",
  };
  const variantClasses: Record<string, string> = {
    default: "!text-white !shadow-sm",
    white: "!text-[#2F2775] !shadow-md",
    outline: "!border !border-primary-200/40 !bg-surface !text-text !shadow-xs hover:!bg-primary-50 dark:!border-primary-200/10",
    secondary: "!bg-primary-soft !text-primary-700 hover:!bg-primary-100 dark:!bg-primary-100 dark:!text-primary-300",
    ghost: "!bg-transparent !text-text-secondary hover:!bg-primary-50 hover:!text-text !shadow-none",
    destructive: "!bg-danger !text-white !shadow-sm hover:!bg-danger/90",
    link: "!bg-transparent !text-primary !underline-offset-4 hover:!underline !shadow-none !p-0 !h-auto",
  };
  return cn(base, sizeClasses[size] || sizeClasses.default, variantClasses[variant] || variantClasses.default);
}

function buttonVariants(opts?: { variant?: string; size?: string }) {
  return getButtonClasses(opts?.variant || "default", opts?.size || "default");
}

export { Button, buttonVariants };
