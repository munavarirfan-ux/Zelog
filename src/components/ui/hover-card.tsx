"use client";

import * as React from "react";
import Popover from "@mui/material/Popover";
import { cn } from "@/lib/utils";

interface HoverCardContextValue {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
  open: boolean;
}

const HoverCardContext = React.createContext<HoverCardContextValue>({
  anchorEl: null,
  setAnchorEl: () => {},
  open: false,
});

function HoverCard({ openDelay = 200, children }: { openDelay?: number; children: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <HoverCardContext.Provider value={{ anchorEl, setAnchorEl, open }}>
      {children}
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { setAnchorEl } = React.useContext(HoverCardContext);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
    timeoutRef.current = setTimeout(() => setAnchorEl(e.currentTarget), 200);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAnchorEl(null);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleEnter,
      onMouseLeave: handleLeave,
    });
  }

  return (
    <span onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
    </span>
  );
}

function HoverCardContent({ children, align = "center", className }: {
  children: React.ReactNode;
  align?: "center" | "start" | "end";
  className?: string;
}) {
  const { anchorEl, setAnchorEl, open } = React.useContext(HoverCardContext);

  const horizontal = align === "end" ? "right" : align === "start" ? "left" : "center";

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{ vertical: "bottom", horizontal }}
      transformOrigin={{ vertical: "top", horizontal }}
      disableRestoreFocus
      sx={{ pointerEvents: "none" }}
      slotProps={{
        paper: {
          className: cn(
            "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-[0_8px_32px_rgba(15,23,42,0.12)] dark:!border-white/[0.08] !w-72 !p-4",
            className,
          ),
          sx: { backgroundImage: "none", pointerEvents: "auto" },
          onMouseLeave: () => setAnchorEl(null),
        },
      }}
    >
      {children}
    </Popover>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
