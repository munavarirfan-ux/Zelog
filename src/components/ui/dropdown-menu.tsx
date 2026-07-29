"use client";

import * as React from "react";
import Menu from "@mui/material/Menu";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

const DropdownContext = React.createContext<DropdownContextValue>({
  anchorEl: null,
  setAnchorEl: () => {},
});

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  return (
    <DropdownContext.Provider value={{ anchorEl, setAnchorEl }}>
      {children}
    </DropdownContext.Provider>
  );
}

function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { setAnchorEl } = React.useContext(DropdownContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        (children as React.ReactElement<any>).props?.onClick?.(e);
        setAnchorEl(e.currentTarget);
      },
    });
  }

  return (
    <button type="button" onClick={(e) => setAnchorEl(e.currentTarget)}>
      {children}
    </button>
  );
}

function DropdownMenuContent({ children, align = "end", className }: { children: React.ReactNode; align?: "start" | "end"; className?: string }) {
  const { anchorEl, setAnchorEl } = React.useContext(DropdownContext);
  const open = Boolean(anchorEl);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{ vertical: "bottom", horizontal: align === "end" ? "right" : "left" }}
      transformOrigin={{ vertical: "top", horizontal: align === "end" ? "right" : "left" }}
      slotProps={{
        paper: {
          className: cn(
            "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-[0_8px_32px_rgba(15,23,42,0.12)] dark:!border-white/[0.08] !min-w-[10rem] !p-1",
            className,
          ),
          sx: { backgroundImage: "none" },
        },
      }}
      sx={{ "& .MuiList-root": { padding: 0 } }}
    >
      {children}
    </Menu>
  );
}

function DropdownMenuItem({ children, className, inset, destructive, onClick, onSelect, ...props }: {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  destructive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onSelect?: (e: React.MouseEvent) => void;
}) {
  const { setAnchorEl } = React.useContext(DropdownContext);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-default select-none items-center gap-2 rounded-[8px] px-2 py-1.5 text-sm outline-none",
        "transition-colors hover:bg-surface-2 focus:bg-surface-2",
        inset && "pl-8",
        destructive && "text-danger hover:bg-danger/10 focus:bg-danger/10",
        !destructive && "text-text",
        className,
      )}
      onClick={(e) => {
        onSelect?.(e);
        onClick?.(e);
        setAnchorEl(null);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuLabel({ children, className, inset }: { children: React.ReactNode; className?: string; inset?: boolean }) {
  return (
    <div className={cn("px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary", inset && "pl-8", className)}>
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-border/[0.07] dark:bg-white/[0.07]", className)} />;
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-[10px] font-medium tabular-nums tracking-wider text-text-tertiary", className)} {...props} />;
}

const DropdownMenuCheckboxItem = DropdownMenuItem;
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
};
