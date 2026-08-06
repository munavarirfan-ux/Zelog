"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { ROLE_OPTIONS, type Role } from "@/config/nav";
import { cn } from "@/lib/utils";

interface RoleSwitcherProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export function RoleSwitcher({ role, onRoleChange }: RoleSwitcherProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = ROLE_OPTIONS.find((r) => r.id === role) ?? ROLE_OPTIONS[0];

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border/10 bg-surface-2/60 px-3 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 dark:border-white/10"
        aria-label={`Current role: ${current.name}`}
      >
        <span className="whitespace-nowrap text-text">{current.name}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" strokeWidth={2} />
      </button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            className: "!mt-1.5 !rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06]",
            sx: { backgroundImage: "none", minWidth: 264 },
          },
          list: { className: "!p-1.5" },
        }}
      >
        {ROLE_OPTIONS.map((opt) => {
          const active = opt.id === role;
          return (
            <MuiMenuItem
              key={opt.id}
              selected={active}
              onClick={() => {
                onRoleChange(opt.id);
                setAnchor(null);
              }}
              disableRipple
              sx={{
                borderRadius: "10px",
                mx: 0.5,
                my: 0.25,
                px: 1.25,
                py: 1,
                alignItems: "flex-start",
                gap: 1,
                whiteSpace: "normal",
                "&.Mui-selected": { backgroundColor: "rgb(var(--primary-100-rgb) / 0.5)" },
                "&.Mui-selected:hover": { backgroundColor: "rgb(var(--primary-100-rgb) / 0.6)" },
                "&:hover": { backgroundColor: "rgb(var(--surface-hover-rgb) / 0.7)" },
              }}
            >
              <Check
                className={cn("mt-0.5 h-4 w-4 shrink-0 text-primary-600", active ? "opacity-100" : "opacity-0")}
                strokeWidth={2.5}
              />
              <span className="flex flex-col">
                <span className={cn("text-[13px] leading-5 text-text", active ? "font-semibold" : "font-medium")}>
                  {opt.name}
                </span>
                <span className="text-[11px] leading-4 text-text-tertiary">{opt.description}</span>
              </span>
            </MuiMenuItem>
          );
        })}
      </Menu>
    </>
  );
}
