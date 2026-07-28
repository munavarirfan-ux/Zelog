"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  [
    "inline-flex w-full items-stretch justify-start gap-0 overflow-x-auto bg-transparent p-0",
    "border-b border-border/[0.07] no-scrollbar dark:border-white/[0.08]",
  ],
  {
    variants: {
      size: {
        default: "h-10 min-h-[36px] max-h-10",
        compact: "h-8 min-h-8 max-h-8",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const tabsTriggerVariants = cva(
  [
    "relative -mb-px inline-flex shrink-0 items-center justify-center whitespace-nowrap",
    "border-b-2 border-transparent bg-transparent font-medium text-text-tertiary",
    "transition-[color,background-color,border-color] duration-150 ease-out",
    "hover:bg-surface-2 hover:text-text-secondary",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=active]:border-accent data-[state=active]:font-semibold data-[state=active]:text-text",
  ],
  {
    variants: {
      size: {
        default: "px-4 py-2 text-[14px]",
        compact: "px-2.5 py-1.5 text-[12px] data-[state=active]:font-medium",
      },
    },
    defaultVariants: { size: "default" },
  },
);

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>;
type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, size, ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={cn(tabsListVariants({ size }), className)} {...props} />
  ),
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, size, ...props }, ref) => (
    <TabsPrimitive.Trigger ref={ref} className={cn(tabsTriggerVariants({ size }), className)} {...props} />
  ),
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
