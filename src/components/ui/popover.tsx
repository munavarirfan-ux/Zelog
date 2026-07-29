"use client";

import * as React from "react";
import MuiPopover from "@mui/material/Popover";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

const PopoverContext = React.createContext<PopoverContextValue>({
  open: false,
  setOpen: () => {},
  anchorEl: null,
  setAnchorEl: () => {},
});

function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  return (
    <PopoverContext.Provider value={{ open, setOpen, anchorEl, setAnchorEl }}>
      {children}
    </PopoverContext.Provider>
  );
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const ctx = React.useContext(PopoverContext);
    return (
      <button
        ref={(el) => {
          ctx.setAnchorEl(el);
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        type="button"
        onClick={(e) => {
          ctx.setOpen(!ctx.open);
          onClick?.(e);
        }}
        {...props}
      />
    );
  },
);
PopoverTrigger.displayName = "PopoverTrigger";

function PopoverAnchor({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 8, children, ...props }, ref) => {
    const ctx = React.useContext(PopoverContext);

    const transformOrigin: Record<string, string> = {
      start: "left",
      center: "center",
      end: "right",
    };

    return (
      <MuiPopover
        open={ctx.open}
        anchorEl={ctx.anchorEl}
        onClose={() => ctx.setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: align === "end" ? "right" : align === "start" ? "left" : "center" }}
        transformOrigin={{ vertical: "top", horizontal: transformOrigin[align] as any }}
        slotProps={{
          paper: {
            className: cn(
              "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06]",
              className,
            ),
            style: { marginTop: sideOffset },
          },
        }}
        disableScrollLock
      >
        <div ref={ref} className="w-72 p-3" {...props}>
          {children}
        </div>
      </MuiPopover>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
