"use client";

import * as React from "react";
import MuiDialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleChange = React.useCallback((val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  }, [isControlled, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen: handleChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { setOpen } = React.useContext(DialogContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props?.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return <button type="button" onClick={() => setOpen(true)}>{children}</button>;
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(DialogContext);

  return (
    <MuiDialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          className: cn(
            "!rounded-[18px] !shadow-[0_24px_64px_rgba(15,23,42,0.16)] !border !border-border/[0.07] dark:!border-white/[0.08] !bg-surface !p-6 !m-4",
            "dark:!shadow-[0_24px_64px_rgba(0,0,0,0.5)]",
            className,
          ),
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
        aria-label="Close"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
      {children}
    </MuiDialog>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 pr-8 text-left", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold tracking-tight text-text", className)} {...props}>{children}</h2>;
}

function DialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-secondary", className)} {...props}>{children}</p>;
}

const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogOverlay = () => null;
const DialogClose = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { setOpen } = React.useContext(DialogContext);
  return <button type="button" onClick={() => setOpen(false)} className={className} {...props}>{children}</button>;
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
