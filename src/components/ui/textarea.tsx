"use client";

import * as React from "react";
import MuiTextField from "@mui/material/TextField";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, rows = 3, ...props }, ref) => (
  <MuiTextField
    inputRef={ref}
    variant="outlined"
    size="small"
    fullWidth
    multiline
    rows={rows}
    slotProps={{
      input: {
        className: cn("!rounded-[10px] !text-sm !text-text !bg-surface", className),
      },
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        backgroundColor: "rgb(var(--primary-50-rgb) / 0.4)",
        "& fieldset": { borderColor: "rgb(var(--border-rgb) / 0.08)" },
        "&:hover fieldset": { borderColor: "rgb(var(--primary-300-rgb) / 0.4) !important" },
        "&.Mui-focused fieldset": { borderColor: "rgb(var(--primary-500-rgb) / 0.6) !important", borderWidth: "2px" },
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
Textarea.displayName = "Textarea";

export { Textarea };
