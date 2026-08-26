"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { isToday, isYesterday, parseISO } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { PersonAvatar } from "@/components/ui/person-avatar";
import {
  MOCK_NOTIFICATIONS, NOTIFICATION_KIND, type NotificationKind,
} from "@/data/notificationsData";
import { useNotificationsStore, useHydratedNotifications } from "@/store/notificationsStore";
import { MOCK_EMPLOYEES } from "@/data/orgData";
import { cn } from "@/lib/utils";

const EMP = new Map(MOCK_EMPLOYEES.map((e) => [e.id, e]));
const empName = (id?: string) => (id ? EMP.get(id)?.name ?? id : undefined);
const empAvatar = (id?: string) => (id ? EMP.get(id)?.avatarUrl : undefined);

/** A single row in the notifications feed. */
export interface FeedItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  actorId?: string;
  at: string;
  cta?: string;
  href?: string;
  baselineRead?: boolean;
  /** When present, clicking opens the request drawer instead of navigating. */
  requestKey?: string;
}

/** Short relative time — "just now", "3h", "2d", "3w". */
function relativeTime(iso: string): string {
  try {
    const then = parseISO(iso).getTime();
    const diff = Date.now() - then;
    const min = Math.round(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h`;
    const day = Math.round(hr / 24);
    if (day < 7) return `${day}d`;
    return `${Math.round(day / 7)}w`;
  } catch {
    return "";
  }
}

type Bucket = "Today" | "Yesterday" | "Earlier";
function bucketOf(iso: string): Bucket {
  try {
    const d = parseISO(iso);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return "Earlier";
  } catch {
    return "Earlier";
  }
}

export function NotificationsFeed({
  requestItems = [],
  onOpenRequest,
}: {
  /** Request-derived notifications (the user's own requests). */
  requestItems?: FeedItem[];
  onOpenRequest?: (key: string) => void;
}) {
  useHydratedNotifications();
  const router = useRouter();
  const readIds = useNotificationsStore((s) => s.readIds);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const items = useMemo<FeedItem[]>(() => {
    const mock: FeedItem[] = MOCK_NOTIFICATIONS.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      actorId: n.actorId,
      at: n.at,
      cta: n.cta,
      href: n.href,
      baselineRead: n.read,
    }));
    return [...requestItems, ...mock].sort((a, b) => b.at.localeCompare(a.at));
  }, [requestItems]);

  const isRead = (it: FeedItem) => it.baselineRead === true || readIds.includes(it.id);
  const unreadCount = items.filter((it) => !isRead(it)).length;

  // Group into Today / Yesterday / Earlier, preserving sorted order.
  const groups = useMemo(() => {
    const order: Bucket[] = ["Today", "Yesterday", "Earlier"];
    const map: Record<Bucket, FeedItem[]> = { Today: [], Yesterday: [], Earlier: [] };
    for (const it of items) map[bucketOf(it.at)].push(it);
    return order.map((b) => ({ bucket: b, list: map[b] })).filter((g) => g.list.length > 0);
  }, [items]);

  function open(it: FeedItem) {
    markRead(it.id);
    if (it.requestKey && onOpenRequest) onOpenRequest(it.requestKey);
    else if (it.href) router.push(it.href);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-border/[0.07] bg-surface py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34D39918] text-[#0F9E6E]">
          <Bell className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <p className="text-sm font-medium text-text">No notifications yet</p>
        <p className="text-xs text-text-tertiary">Birthdays, project updates and request activity will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Feed header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-text-secondary">
          {unreadCount > 0 ? (
            <><span className="font-semibold text-text">{unreadCount}</span> unread</>
          ) : (
            "You're all caught up"
          )}
        </p>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllRead(items.map((it) => it.id))}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.4} /> Mark all as read
          </button>
        ) : null}
      </div>

      {groups.map(({ bucket, list }) => (
        <div key={bucket} className="space-y-1.5">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">{bucket}</p>
          <div className="overflow-hidden rounded-[22px] border border-border/[0.07] bg-surface shadow-[0_1px_2px_rgba(40,30,90,0.04)]">
            <ul className="divide-y divide-border/[0.06]">
              {list.map((it) => {
                const meta = NOTIFICATION_KIND[it.kind];
                const Icon = meta.icon;
                const read = isRead(it);
                const actor = empName(it.actorId);
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => open(it)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2/50 sm:px-5",
                        !read && "bg-primary-50/40",
                      )}
                    >
                      {/* Unread dot */}
                      <span className="mt-4 flex w-2 shrink-0 justify-center" aria-hidden>
                        {!read ? <span className="h-2 w-2 rounded-full bg-primary-600" /> : null}
                      </span>

                      {/* Kind icon, with the actor avatar tucked into the corner */}
                      <span className="relative shrink-0">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}B3)` }}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                        </span>
                        {it.actorId ? (
                          <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-surface">
                            <PersonAvatar name={actor ?? ""} src={empAvatar(it.actorId)} size={18} />
                          </span>
                        ) : null}
                      </span>

                      {/* Body */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn("truncate text-sm text-text", read ? "font-medium" : "font-semibold")}>{it.title}</p>
                          <span
                            className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold md:inline-flex"
                            style={{ color: meta.color, backgroundColor: `${meta.color}1F` }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {it.body ? <p className="mt-0.5 truncate text-xs text-text-secondary">{it.body}</p> : null}
                        {it.cta ? (
                          <span className="mt-1.5 inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-primary-600">
                            {it.cta}
                          </span>
                        ) : null}
                      </div>

                      {/* Time */}
                      <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-text-tertiary">{relativeTime(it.at)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
