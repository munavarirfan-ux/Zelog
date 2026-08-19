"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import { LogOut } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getMobilePrimaryItems, getMobileMoreItems, MOBILE_MORE } from "@/config/nav";
import { cn } from "@/lib/utils";

const activePillStyle = {
  background: "linear-gradient(90deg, rgba(122,77,255,0.12) 0%, rgba(122,77,255,0.06) 100%)",
} as const;

/**
 * Floating bottom navigation for mobile, styled to match the top toolbar. Shows
 * the role-filtered primary destinations plus a "More" sheet for the rest —
 * both driven by the centralized navigation config.
 */
export function MobileBottomNavigation() {
  const pathname = usePathname();
  const { activeRole, permissions } = useCurrentUser();
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = getMobilePrimaryItems(activeRole, permissions);
  const more = getMobileMoreItems(activeRole, permissions);
  const MoreIcon = MOBILE_MORE.icon;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const moreActive = more.some((i) => isActive(i.href));

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2 lg:hidden"
    >
      <nav
        className="pointer-events-auto w-full max-w-md rounded-[20px] border border-border/[0.06] bg-surface/95 shadow-[0_8px_28px_-8px_rgba(47,39,117,0.28)] backdrop-blur dark:border-white/[0.06]"
        aria-label="Primary navigation"
      >
        <div className="flex items-stretch px-1.5 py-1.5">
          {primary.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11px] font-medium transition-colors",
                  active ? "text-primary-600 dark:text-primary-400" : "text-text-tertiary hover:text-text-secondary",
                )}
                style={active ? activePillStyle : undefined}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.75} />
                {item.label}
              </Link>
            );
          })}

          {more.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="More"
              aria-haspopup="menu"
              className={cn(
                "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11px] font-medium transition-colors",
                moreActive ? "text-primary-600 dark:text-primary-400" : "text-text-tertiary hover:text-text-secondary",
              )}
              style={moreActive ? activePillStyle : undefined}
            >
              <MoreIcon className="h-6 w-6" strokeWidth={moreActive ? 2.2 : 1.75} />
              {MOBILE_MORE.label}
            </button>
          )}
        </div>
      </nav>

      {/* More sheet */}
      <Drawer
        anchor="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        slotProps={{
          paper: {
            className: "!rounded-t-[24px] !bg-surface",
            sx: {
              backgroundImage: "none",
              pb: "calc(env(safe-area-inset-bottom) + 12px)",
              px: 2,
              pt: 1.5,
            },
          },
        }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border/20" aria-hidden />
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">More</p>
        <nav aria-label="More navigation" className="grid grid-cols-3 gap-2 pb-2">
          {more.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-[16px] border border-border/[0.06] px-2 py-3 text-center text-[12px] font-medium transition-colors dark:border-white/[0.06]",
                  active ? "text-primary-600" : "text-text-secondary hover:bg-[rgba(122,77,255,0.04)]",
                )}
                style={active ? activePillStyle : undefined}
              >
                <Icon className="h-6 w-6" strokeWidth={1.75} />
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="mt-1 flex min-h-[48px] w-full items-center gap-2.5 rounded-[14px] px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Logout
        </button>
      </Drawer>
    </div>
  );
}
