"use client";

import Link from "next/link";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { cn } from "@/lib/utils";

interface PersonRowProps {
  name: string;
  /** Second line — muted supporting text (string or node). */
  secondary: React.ReactNode;
  /** Optional right-aligned meta (chip, date, count). */
  right?: React.ReactNode;
  /** Optional profile photo URL. */
  avatarUrl?: string;
  /** When set, the row is emphasized with a tinted background + inset ring. */
  highlightColor?: string;
  href?: string;
  className?: string;
}

/** Compact avatar-based row for people lists. Keyboard + pointer accessible. */
export function PersonRow({ name, secondary, right, avatarUrl, highlightColor, href, className }: PersonRowProps) {
  const body = (
    <>
      <PersonAvatar name={name} src={avatarUrl} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text">{name}</span>
        <span className="block truncate text-xs text-text-secondary">{secondary}</span>
      </span>
      {right ? <span className="shrink-0 text-right">{right}</span> : null}
    </>
  );

  const base = "flex min-h-[52px] items-center gap-3 rounded-[12px] px-2 py-1.5 transition-colors";
  const highlightStyle = highlightColor
    ? { backgroundColor: `${highlightColor}14`, boxShadow: `inset 0 0 0 1px ${highlightColor}40` }
    : undefined;

  if (href) {
    return (
      <Link
        href={href}
        style={highlightStyle}
        className={cn(
          base,
          highlightColor ? "hover:brightness-[0.98]" : "hover:bg-[rgba(122,77,255,0.05)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40",
          className,
        )}
      >
        {body}
      </Link>
    );
  }
  return (
    <div style={highlightStyle} className={cn(base, className)}>
      {body}
    </div>
  );
}
