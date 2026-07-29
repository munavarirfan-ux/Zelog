"use client";

import * as React from "react";
import MuiSwitch from "@mui/material/Switch";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked, onCheckedChange, disabled, className, id, name }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (_: React.ChangeEvent<HTMLInputElement>, val: boolean) => {
      if (!isControlled) setInternalChecked(val);
      onCheckedChange?.(val);
    };

    return (
      <MuiSwitch
        ref={ref as any}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        id={id}
        name={name}
        size="small"
        data-state={isChecked ? "checked" : "unchecked"}
        className={cn(className)}
        sx={{
          width: 36,
          height: 20,
          padding: 0,
          "& .MuiSwitch-switchBase": {
            padding: "2px",
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                background: "linear-gradient(135deg, #4133A5, #7A4DFF)",
                opacity: 1,
              },
            },
          },
          "& .MuiSwitch-thumb": {
            width: 16,
            height: 16,
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          },
          "& .MuiSwitch-track": {
            borderRadius: 10,
            backgroundColor: "var(--color-surface-3, #e2e8f0)",
            opacity: 1,
          },
        }}
      />
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
