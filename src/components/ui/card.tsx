"use client";

import * as React from "react";
import { Primitive } from "@radix-ui/react-primitive";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, ...props }, ref) => (
  <Primitive.div
    ref={ref}
    className={cn(
      "rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, ...props }, ref) => (
  <Primitive.div ref={ref} className={cn("flex flex-col space-y-1 p-5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  React.ElementRef<typeof Primitive.h3>,
  React.ComponentPropsWithoutRef<typeof Primitive.h3>
>(({ className, ...props }, ref) => (
  <Primitive.h3 ref={ref} className={cn("text-sm font-semibold tracking-tight text-text", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  React.ElementRef<typeof Primitive.p>,
  React.ComponentPropsWithoutRef<typeof Primitive.p>
>(({ className, ...props }, ref) => (
  <Primitive.p ref={ref} className={cn("text-xs text-text-secondary", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, ...props }, ref) => <Primitive.div ref={ref} className={cn("p-5 pt-0", className)} {...props} />);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, ...props }, ref) => (
  <Primitive.div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
