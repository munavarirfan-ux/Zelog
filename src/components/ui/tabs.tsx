"use client";

import * as React from "react";
import MuiTabs from "@mui/material/Tabs";
import MuiTab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({ value: "", onValueChange: () => {} });

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ defaultValue = "", value, onValueChange, children, className, ...props }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value ?? internal;
  const handleChange = React.useCallback(
    (v: string) => {
      if (onValueChange) onValueChange(v);
      else setInternal(v);
    },
    [onValueChange],
  );
  return (
    <TabsContext.Provider value={{ value: current, onValueChange: handleChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "compact";
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    const tabValues: string[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.value) {
        tabValues.push(child.props.value);
      }
    });

    return (
      <div ref={ref} {...props}>
        <MuiTabs
          value={ctx.value || false}
          onChange={(_, newVal) => ctx.onValueChange(newVal)}
          variant="scrollable"
          scrollButtons={false}
          className={cn(className)}
          sx={{
            minHeight: size === "compact" ? 32 : 40,
            borderBottom: "1px solid rgba(var(--border-rgb, 0 0 0) / 0.07)",
            "& .MuiTabs-indicator": {
              background: "linear-gradient(90deg, rgb(var(--primary-600-rgb)), rgb(var(--primary-400-rgb)))",
              height: "2px",
              borderRadius: 4,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: size === "compact" ? "12px" : "14px",
              minHeight: size === "compact" ? 32 : 40,
              padding: size === "compact" ? "6px 10px" : "8px 16px",
              color: "var(--color-text-tertiary)",
              "&:hover": { color: "var(--color-text-secondary)", backgroundColor: "var(--color-surface-2)" },
              "&.Mui-selected": { color: "var(--color-text)", fontWeight: 600 },
            },
          }}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.props.value) {
              return (
                <MuiTab
                  value={child.props.value}
                  label={child.props.children}
                  disableRipple
                />
              );
            }
            return null;
          })}
        </MuiTabs>
      </div>
    );
  },
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  size?: "default" | "compact";
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, ...props }, ref) => {
    return <span data-value={value} {...(props as any)}>{children}</span>;
  },
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const ctx = React.useContext(TabsContext);
    if (ctx.value !== value) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn(
          "mt-4 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
