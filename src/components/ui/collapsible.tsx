"use client";

import * as React from "react";
import Collapse from "@mui/material/Collapse";

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue>({
  open: false,
  setOpen: () => {},
});

function Collapsible({ open, onOpenChange, defaultOpen, children, ...rest }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen || false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleChange = React.useCallback((val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  }, [isControlled, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, setOpen: handleChange }}>
      <div {...rest}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(CollapsibleContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props?.onClick?.(e);
        setOpen(!open);
      },
    });
  }

  return <button type="button" onClick={() => setOpen(!open)}>{children}</button>;
}

function CollapsibleContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = React.useContext(CollapsibleContext);

  return (
    <Collapse in={open} className={className}>
      {children}
    </Collapse>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
