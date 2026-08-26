"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Read/unread tracking for the Inbox notifications feed. We only persist which
 * notification ids have been read (plus a "cleared" set for dismissals); the
 * notification content itself is derived from mock data + the request stores.
 */
interface NotificationsState {
  readIds: string[];
  isRead: (id: string, baseline?: boolean) => boolean;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      readIds: [],
      isRead: (id, baseline) => baseline === true || get().readIds.includes(id),
      markRead: (id) =>
        set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
      markAllRead: (ids) =>
        set((s) => ({ readIds: Array.from(new Set([...s.readIds, ...ids])) })),
    }),
    { name: "zelog-notifications-v1", skipHydration: true },
  ),
);

export function useHydratedNotifications() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useNotificationsStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}
