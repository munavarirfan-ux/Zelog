"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LogOut, PanelLeftClose, PanelLeftOpen, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_NAV, getNavGroupsForRole, isHrefAllowedForRole, type Role } from "@/config/nav";
import { useRoleStore } from "@/store/roleStore";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Button } from "@/components/ui/button";
import MuiTooltip from "@mui/material/Tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StickyMiniTimer } from "@/components/tracker/StickyMiniTimer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);

  useEffect(() => {
    setMounted(true);
    useRoleStore.persist.rehydrate();
    const saved = window.localStorage.getItem("zelog.sidebar.collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem("zelog.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed, mounted]);

  const navGroups = getNavGroupsForRole(role);

  function handleRoleChange(next: Role) {
    setRole(next);
    // If the current page is no longer permitted for the new role, send them home.
    if (!isHrefAllowedForRole(next, pathname)) {
      router.push("/tracker");
    }
  }

  const sidebarWidth = collapsed ? 76 : 264;

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-app-bg text-text lg:h-[100dvh] lg:max-h-screen lg:flex-row lg:overflow-hidden">
      <aside
        className="hidden shrink-0 transition-[width] duration-200 ease-out lg:flex lg:h-full lg:flex-col lg:overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-full w-full flex-col">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border border-border/[0.06] bg-surface dark:border-white/[0.06]">
            <div className={cn("border-b border-border/[0.06] dark:border-white/[0.06]", collapsed ? "px-2 py-3.5" : "px-3.5 py-3.5")}>
              <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
                <Link href="/tracker" className={cn("flex items-center", collapsed ? "justify-center" : "gap-0")}>
                  {collapsed ? (
                    <img src="/zelog-icon.png" alt="ZeLog" className="h-7 w-7 shrink-0 object-contain" />
                  ) : (
                    <span className="shrink-0 text-lg font-extrabold leading-none tracking-tight text-text" aria-label="Ze[flow]">
                      Ze<span className="text-primary-400">[</span>flow<span className="text-primary-400">]</span>
                    </span>
                  )}
                </Link>
                {!collapsed ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setCollapsed(true)}
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                ) : null}
              </div>
              {collapsed ? (
                <div className="mt-2 flex justify-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(false)} aria-label="Expand sidebar">
                    <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </div>
              ) : null}
            </div>

            <nav className={cn("flex-1 overflow-auto py-4", collapsed ? "px-2" : "px-4")}>
              {navGroups.map((group, gi) => (
                <div
                  key={group.label ?? `group-${gi}`}
                  className={cn(
                    gi > 0 &&
                      (collapsed
                        ? "mt-2 border-t border-border/[0.06] pt-2 dark:border-white/[0.06]"
                        : group.label
                          ? "mt-5"
                          : "mt-4 border-t border-border/[0.06] pt-4 dark:border-white/[0.06]"),
                  )}
                >
                  {!collapsed && group.label ? (
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9C9AB4] dark:text-[#6E7091]">
                      {group.label}
                    </p>
                  ) : null}
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;
                      const link = (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center font-medium transition-colors duration-150 ease-out",
                            collapsed ? "h-11 w-11 justify-center rounded-xl" : "h-11 gap-3 rounded-xl px-3",
                            active
                              ? "border border-[rgba(122,77,255,0.10)] dark:border-[rgba(138,107,255,0.15)]"
                              : "border border-transparent hover:border-transparent",
                            !active && "text-[#5F6285] hover:bg-[rgba(122,77,255,0.06)] hover:text-text dark:text-[#8B8DAF] dark:hover:text-text",
                          )}
                          style={active ? {
                            background: "linear-gradient(90deg, rgba(122,77,255,0.12) 0%, rgba(122,77,255,0.06) 100%)",
                          } : undefined}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors duration-[180ms]",
                              active ? "text-[#5A43D5] dark:text-[#8A6BFF]" : "text-[#6D7195] group-hover:text-[#5A43D5] dark:text-[#7B7DA0] dark:group-hover:text-[#8A6BFF]",
                            )}
                            strokeWidth={1.75}
                          />
                          {!collapsed ? (
                            <span className={cn(
                              "truncate text-[13px] transition-colors duration-[180ms]",
                              active ? "font-semibold text-[#2F2775] dark:text-[#E8DFFF]" : "font-medium",
                            )}>
                              {item.label}
                            </span>
                          ) : null}
                        </Link>
                      );
                      if (!collapsed) return link;
                      return (
                        <MuiTooltip key={item.href} title={item.label} placement="right" arrow={false}>
                          {link}
                        </MuiTooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className={cn("border-t border-border/[0.06] dark:border-white/[0.06]", collapsed ? "p-2" : "p-2.5")}>
              <button
                type="button"
                className={cn(
                  "flex h-10 w-full items-center rounded-[10px] font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text",
                  collapsed ? "justify-center" : "gap-2.5 px-3",
                )}
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                {!collapsed ? <span className="text-[13px]">Logout</span> : null}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:overflow-hidden">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <header className="sticky top-0 z-[100] mb-4 shrink-0 rounded-[16px] border border-border/[0.06] bg-surface/95 shadow-xs backdrop-blur dark:border-white/[0.06]">
            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* Mobile brand logo */}
              <Link href="/tracker" className="flex min-w-0 flex-1 items-center lg:hidden" aria-label="Zessta">
                <img src="/zessta-logo.png" alt="Zessta" className="h-5 w-auto shrink-0" />
              </Link>

              {/* Desktop brand */}
              <img src="/zessta-logo.png" alt="Zessta" className="hidden h-4 w-auto shrink-0 lg:block" />
              <div className="hidden min-w-0 flex-1 lg:block">
                <span className="text-sm font-light text-text-tertiary">Zessta Software Solutions</span>
              </div>

              <div className="flex items-center justify-end gap-2 lg:flex-1">
                <span className="hidden lg:block">
                  <StickyMiniTimer />
                </span>

                <span className="hidden lg:block">
                  <RoleSwitcher role={role} onRoleChange={handleRoleChange} />
                </span>

                <HoverCard openDelay={80}>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
                      <Bell className="h-4 w-4" strokeWidth={1.75} />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent align="end" className="w-80">
                    <p className="mb-1 text-sm font-semibold text-text">Notifications</p>
                    <p className="text-xs text-text-secondary">You&apos;re all caught up — no new notifications.</p>
                  </HoverCardContent>
                </HoverCard>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/25">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>IA</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Irfan Alisha</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive>
                      <LogOut className="h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="w-full min-w-0 flex-1 pb-24 lg:pb-0">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation — floating pill, styled like the top toolbar */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2 lg:hidden"
        aria-hidden={false}
      >
        <nav
          className="pointer-events-auto w-full max-w-md rounded-[20px] border border-border/[0.06] bg-surface/95 shadow-[0_8px_28px_-8px_rgba(47,39,117,0.28)] backdrop-blur dark:border-white/[0.06]"
          aria-label="Primary"
        >
          <div className="flex items-stretch px-1.5 py-1.5">
            {MOBILE_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11px] font-medium transition-colors",
                    active
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-text-tertiary hover:text-text-secondary",
                  )}
                  style={active ? {
                    background: "linear-gradient(90deg, rgba(122,77,255,0.12) 0%, rgba(122,77,255,0.06) 100%)",
                  } : undefined}
                >
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
