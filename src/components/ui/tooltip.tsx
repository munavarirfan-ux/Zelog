"use client";

import * as React from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { cn } from "@/lib/utils";

function TooltipProvider({ children, delayDuration }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

interface TooltipProps {
  children: React.ReactNode;
  delayDuration?: number;
}

function Tooltip({ children, delayDuration }: TooltipProps) {
  return <TooltipContext.Provider value={{ delayDuration }}>{children}</TooltipContext.Provider>;
}

const TooltipContext = React.createContext<{ delayDuration?: number }>({});

function TooltipTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  return <TooltipTriggerContext.Provider value={{ children, asChild }}>{children}</TooltipTriggerContext.Provider>;
}

const TooltipTriggerContext = React.createContext<{ children?: React.ReactNode; asChild?: boolean }>({});

function TooltipContent({ children, side = "top", sideOffset = 6, className }: {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  className?: string;
}) {
  return null;
}

// Simplified Tooltip wrapper that works with MUI
function SimpleTooltip({ title, side = "top", children }: {
  title: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
}) {
  return (
    <MuiTooltip
      title={title}
      placement={side}
      arrow={false}
      slotProps={{
        tooltip: {
          className: cn(
            "!rounded-[8px] !border !border-white/10 !bg-[rgba(15,15,20,0.94)] !px-2.5 !py-1.5",
            "!text-[11px] !font-medium !leading-snug !text-white !shadow-[0_8px_24px_rgba(15,23,42,0.24)]",
          ),
        },
      }}
    >
      {children}
    </MuiTooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SimpleTooltip };
