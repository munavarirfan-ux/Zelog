"use client";

import * as React from "react";
import MuiDialog from "@mui/material/Dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const AlertDialogContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({
  open: false,
  setOpen: () => {},
});

function AlertDialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleChange = React.useCallback((val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  }, [isControlled, onOpenChange]);

  return (
    <AlertDialogContext.Provider value={{ open: isOpen, setOpen: handleChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { setOpen } = React.useContext(AlertDialogContext);

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

function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(AlertDialogContext);

  return (
    <MuiDialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="xs"
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
      {children}
    </MuiDialog>
  );
}

function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function AlertDialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold tracking-tight text-text", className)} {...props}>{children}</h2>;
}

function AlertDialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-secondary", className)} {...props}>{children}</p>;
}

function AlertDialogAction({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "destructive" }), className)}
      onClick={(e) => { props.onClick?.(e); setOpen(false); }}
      {...props}
    >
      {children}
    </button>
  );
}

function AlertDialogCancel({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "outline" }), className)}
      onClick={(e) => { props.onClick?.(e); setOpen(false); }}
      {...props}
    >
      {children}
    </button>
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
