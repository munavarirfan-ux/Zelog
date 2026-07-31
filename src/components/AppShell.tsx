"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME, COMPANY_NAME } from "@/config/nav";
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
import { useTheme } from "@/components/ThemeProvider";
import { StickyMiniTimer } from "@/components/tracker/StickyMiniTimer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem("zelog.sidebar.collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem("zelog.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed, mounted]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarWidth = collapsed ? 76 : 264;

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-app-bg text-text lg:h-[100dvh] lg:max-h-screen lg:flex-row lg:overflow-hidden">
      <aside
        className="shrink-0 transition-[width] duration-200 ease-out lg:flex lg:h-full lg:flex-col lg:overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        {mobileOpen ? (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div
          className={cn(
            "flex h-full flex-col transition-transform duration-[180ms] ease-out",
            "max-lg:fixed max-lg:z-50 max-lg:top-2 max-lg:bottom-2 max-lg:left-2 max-lg:w-[260px]",
            mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-[120%]",
            "lg:relative lg:inset-auto lg:w-full lg:translate-x-0",
          )}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-border/[0.06] bg-surface dark:border-white/[0.06]">
            <div className={cn("border-b border-border/[0.06] dark:border-white/[0.06]", collapsed ? "px-2 py-3.5" : "px-3.5 py-3.5")}>
              <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
                <Link href="/tracker" className={cn("flex items-center", collapsed ? "justify-center" : "gap-0")}>
                  {collapsed ? (
                    <div className="h-9 w-9 overflow-hidden rounded-[10px]">
                      <img src="/zelog-logo.png" alt="ZeLog" className="h-9 w-auto max-w-none" />
                    </div>
                  ) : (
                    <img src="/zelog-logo.png" alt="ZeLog" className="h-10 w-auto shrink-0" />
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
              <div className="space-y-1.5">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const link = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center font-medium transition-all duration-[180ms] ease-out",
                        collapsed ? "h-11 w-11 justify-center rounded-xl" : "h-11 gap-3 rounded-xl px-3",
                        active
                          ? "border border-[rgba(122,77,255,0.10)] dark:border-[rgba(138,107,255,0.15)]"
                          : "border border-transparent hover:translate-x-0.5 hover:border-transparent",
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
              <button
                type="button"
                className="shrink-0 lg:pointer-events-none"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <img src="/zessta-logo.png" alt="Zessta" className="h-4 w-auto" />
              </button>

              <div className="hidden min-w-0 flex-1 sm:block">
                <span className="text-sm font-light text-text-tertiary">Zessta Software Solutions</span>
              </div>

              <div className="flex flex-1 items-center justify-end gap-2">
                <StickyMiniTimer />

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

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleTheme}
                  aria-label={mounted && resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                >
                  {mounted && resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Moon className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </Button>

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

          <div className="w-full min-w-0 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
