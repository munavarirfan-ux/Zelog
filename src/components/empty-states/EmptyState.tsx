import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" className="text-accent/35" aria-hidden>
        <circle cx="44" cy="46" r="30" stroke="currentColor" strokeWidth="2.5" />
        <path d="M44 30v16l11 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 14l-8 8M58 14l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm font-semibold text-text">{title}</p>
      {description ? <p className="max-w-xs text-xs text-text-secondary">{description}</p> : null}
      {action}
    </div>
  );
}
