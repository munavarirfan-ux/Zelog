"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import IconButton from "@mui/material/IconButton";
import { format } from "date-fns";
import { CakeSlice, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, PartyPopper, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelCard } from "@/components/home/HomeUI";
import { CelebrationPostDrawer } from "./CelebrationPostDrawer";
import { CelebrationWishDialog } from "./CelebrationWishDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCelebrationStore, useHydratedCelebrations, type PostedInfo } from "@/store/celebrationStore";
import { ANNIVERSARIES_TODAY, BIRTHDAYS_TODAY, type CelebrationEmployee, type CelebrationKind } from "@/data/celebrationsData";
import { cn } from "@/lib/utils";

/* ── Profile card ── */

function CelebrationCard({ employee, kind, onWish }: { employee: CelebrationEmployee; kind: CelebrationKind; onWish: () => void }) {
  const isBirthday = kind === "birthday";
  const accent = isBirthday ? "#F472B6" : "#8B7CF6";
  return (
    <div className="flex h-[196px] w-[190px] shrink-0 snap-start flex-col items-center rounded-[16px] border border-border/[0.07] bg-surface p-4 text-center shadow-[0_1px_2px_rgba(40,30,90,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(49,46,129,0.35)]">
      <img src={employee.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
      <p className="mt-2.5 line-clamp-1 text-sm font-semibold text-text">{employee.name}</p>
      <p className="mt-0.5 line-clamp-1 w-full text-xs text-text-tertiary">{employee.role}</p>
      {employee.years != null ? (
        <span className="mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: accent, backgroundColor: `${accent}1A` }}>
          🎉 {employee.years} {employee.years === 1 ? "Year" : "Years"}
        </span>
      ) : (
        <span className="mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: "#DB2777", backgroundColor: "#F472B61A" }}>🎂 Birthday</span>
      )}
      <Button variant="outline" size="sm" className="mt-auto w-full gap-1.5" onClick={onWish} aria-label={`Send ${isBirthday ? "birthday" : "anniversary"} wish to ${employee.name}`}>
        <MessageSquare className="h-3.5 w-3.5" /> Wish
      </Button>
    </div>
  );
}

/* ── Group carousel ── */

function CelebrationGroup({
  kind,
  employees,
  canPost,
  posted,
  onWish,
  onPost,
}: {
  kind: CelebrationKind;
  employees: CelebrationEmployee[];
  canPost: boolean;
  posted: PostedInfo | null;
  onWish: (e: CelebrationEmployee) => void;
  onPost: () => void;
}) {
  const isBirthday = kind === "birthday";
  const accent = isBirthday ? "#F472B6" : "#8B7CF6";
  const Icon = isBirthday ? CakeSlice : Sparkles;
  const title = isBirthday ? "Birthdays" : "Work Anniversaries";
  const tint = isBirthday
    ? "linear-gradient(180deg, rgba(244,114,182,0.05), transparent 42%)"
    : "linear-gradient(180deg, rgba(139,124,246,0.05), transparent 42%)";
  const borderColors = isBirthday
    ? { "--cel-c1": "#F472B6", "--cel-c2": "#FBCFE8", "--cel-c3": "#EC4899" }
    : { "--cel-c1": "#8B7CF6", "--cel-c2": "#DDD6FE", "--cel-c3": "#7C3AED" };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, employees.length]);

  const scrollByCards = useCallback((dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * (190 + 12) * 2, behavior: "smooth" });
  }, []);

  const arrowSx = { border: "1px solid rgb(var(--border-rgb) / 0.12)", color: "text.secondary", "&.Mui-disabled": { opacity: 0.4 } } as const;

  return (
    <div className="cel-anim-border relative overflow-hidden rounded-[18px] p-4" style={{ background: tint, ...(borderColors as CSSProperties) }}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}B3)` }} aria-hidden>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <h3 className="flex-1 text-sm font-semibold text-text">
          {title} <span className="font-normal text-text-tertiary">· {employees.length} today</span>
        </h3>
        <div className="flex items-center gap-1">
          <IconButton size="small" aria-label={`Previous ${title.toLowerCase()}`} onClick={() => scrollByCards(-1)} disabled={atStart} sx={arrowSx}>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton size="small" aria-label={`Next ${title.toLowerCase()}`} onClick={() => scrollByCards(1)} disabled={atEnd} sx={arrowSx}>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={update}
        tabIndex={0}
        role="group"
        aria-label={`${title} carousel`}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-primary-400/40 [&::-webkit-scrollbar]:hidden"
      >
        {employees.map((e) => (
          <CelebrationCard key={e.id} employee={e} kind={kind} onWish={() => onWish(e)} />
        ))}
      </div>

      {/* Super Admin only: one grouped post to Google Chat */}
      {canPost ? (
        <div className="mt-3 flex items-center justify-end border-t border-border/[0.06] pt-3">
          {posted ? (
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F9E6E]">
                <CheckCircle2 className="h-4 w-4" /> {isBirthday ? "Birthday" : "Anniversary"} Post Published
                <span className="font-normal text-text-tertiary">· Posted to {posted.space} · {format(new Date(posted.at), "h:mm a")}</span>
              </span>
              <Button variant="outline" size="sm" onClick={onPost}>View Post</Button>
            </div>
          ) : (
            <Button size="sm" className="gap-1.5" onClick={onPost}>
              <Send className="h-4 w-4" /> Post to Chat
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ── Section ── */

export function TodayCelebrations({ className }: { className?: string }) {
  useHydratedCelebrations();
  const { activeRole } = useCurrentUser();
  const canPost = activeRole === "super-admin";

  const posted = useCelebrationStore((s) => s.posted);
  const markPosted = useCelebrationStore((s) => s.markPosted);

  const [wish, setWish] = useState<{ employee: CelebrationEmployee; kind: CelebrationKind } | null>(null);
  const [postDrawer, setPostDrawer] = useState<CelebrationKind | null>(null);

  return (
    <PanelCard title="Today's Celebrations" icon={PartyPopper} tint="#8B7CF6" className={className}>
      <p className="-mt-2 mb-3 text-xs text-text-tertiary">Celebrate the moments worth sharing.</p>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {BIRTHDAYS_TODAY.length > 0 ? (
          <CelebrationGroup
            kind="birthday"
            employees={BIRTHDAYS_TODAY}
            canPost={canPost}
            posted={posted.birthday}
            onWish={(e) => setWish({ employee: e, kind: "birthday" })}
            onPost={() => setPostDrawer("birthday")}
          />
        ) : null}
        {ANNIVERSARIES_TODAY.length > 0 ? (
          <CelebrationGroup
            kind="anniversary"
            employees={ANNIVERSARIES_TODAY}
            canPost={canPost}
            posted={posted.anniversary}
            onWish={(e) => setWish({ employee: e, kind: "anniversary" })}
            onPost={() => setPostDrawer("anniversary")}
          />
        ) : null}
      </div>

      <CelebrationWishDialog
        open={wish !== null}
        employee={wish?.employee ?? null}
        kind={wish?.kind ?? "birthday"}
        onClose={() => setWish(null)}
      />

      {canPost ? (
        <CelebrationPostDrawer
          open={postDrawer !== null}
          kind={postDrawer ?? "birthday"}
          employees={postDrawer === "anniversary" ? ANNIVERSARIES_TODAY : BIRTHDAYS_TODAY}
          posted={postDrawer ? posted[postDrawer] : null}
          onClose={() => setPostDrawer(null)}
          onPosted={(space) => {
            if (postDrawer) markPosted(postDrawer, space, new Date().toISOString());
          }}
        />
      ) : null}
    </PanelCard>
  );
}
