"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

/** Frosted action button used inside the Home hero. Min 48px touch target. */
export function QuickActionButton({ icon: Icon, label, onClick, className }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      {label}
    </button>
  );
}
