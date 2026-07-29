"use client";

import * as React from "react";
import MuiToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MuiToggleButton from "@mui/material/ToggleButton";
import { cn } from "@/lib/utils";

type ToggleGroupSingleProps = {
  type: "single";
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

type ToggleGroupMultipleProps = {
  type: "multiple";
  value?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
  children: React.ReactNode;
};

type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (props, ref) => {
    const { type, value, onValueChange, className, children } = props;

    const handleChange = (_: React.MouseEvent, newValue: string | string[] | null) => {
      if (type === "multiple") {
        (onValueChange as ((v: string[]) => void) | undefined)?.(
          (newValue as string[]) || []
        );
      } else {
        (onValueChange as ((v: string) => void) | undefined)?.(
          (newValue as string) || ""
        );
      }
    };

    return (
      <MuiToggleButtonGroup
        ref={ref}
        value={value || (type === "multiple" ? [] : "")}
        exclusive={type === "single"}
        onChange={handleChange}
        className={cn("!flex !flex-wrap !items-center !gap-1.5", className)}
        sx={{
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid rgba(var(--border-rgb, 0 0 0) / 0.1)",
            borderRadius: "999px !important",
            margin: 0,
            "&:not(:first-of-type)": { borderLeft: "1px solid rgba(var(--border-rgb, 0 0 0) / 0.1)", marginLeft: 0 },
          },
        }}
      >
        {children}
      </MuiToggleButtonGroup>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, className, children }, ref) => (
    <MuiToggleButton
      ref={ref}
      value={value}
      className={cn(
        "!h-8 !shrink-0 !px-3 !py-0 !text-xs !font-medium !normal-case !text-text-secondary",
        "hover:!border-border/20 hover:!text-text",
        "!transition-all !duration-150 !ease-out",
        className,
      )}
      sx={{
        "&.Mui-selected": {
          borderColor: "rgb(var(--primary-main-rgb) / 0.3) !important",
          backgroundColor: "rgb(var(--primary-main-rgb) / 0.1) !important",
          color: "rgb(var(--primary-main-rgb)) !important",
          fontWeight: "600 !important",
        },
        "&.Mui-selected:hover": {
          backgroundColor: "rgb(var(--primary-main-rgb) / 0.15) !important",
        },
      }}
    >
      {children}
    </MuiToggleButton>
  )
);
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
