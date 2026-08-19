import { cn } from "@/lib/utils";

/**
 * Standard vertical rhythm + bottom padding for a page body. Optional — pages
 * with bespoke layouts can skip it; it just codifies the common spacing.
 */
export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-5 pb-12", className)}>{children}</div>;
}
