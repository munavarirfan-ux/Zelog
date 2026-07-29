"use client";

import * as React from "react";
import MuiTextField from "@mui/material/TextField";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <MuiTextField
    inputRef={ref}
    type={type}
    variant="outlined"
    size="small"
    fullWidth
    slotProps={{
      input: {
        className: cn(
          "!rounded-[10px] !text-sm !text-text",
          className,
        ),
        sx: {
          "& fieldset": { borderColor: "rgb(var(--border-rgb) / 0.08)" },
          "&:hover fieldset": { borderColor: "rgb(var(--primary-300-rgb) / 0.4) !important" },
          "&.Mui-focused fieldset": { borderColor: "rgb(var(--primary-500-rgb) / 0.6) !important", borderWidth: "2px" },
        },
      },
      htmlInput: {
        className: "!px-3 !py-2 !text-sm placeholder:!text-text-tertiary",
      },
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        backgroundColor: "rgb(var(--primary-50-rgb) / 0.4)",
        height: props.style?.height || undefined,
      },
      "& .MuiInputBase-input": {
        color: "var(--color-text)",
        fontSize: "0.875rem",
        "&::placeholder": { color: "var(--color-text-tertiary)", opacity: 1 },
      },
    }}
    {...(props as any)}
  />
));
Input.displayName = "Input";

export { Input };
