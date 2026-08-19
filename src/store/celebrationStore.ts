"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CelebrationKind } from "@/data/celebrationsData";

export interface PostedInfo {
  at: string; // ISO
  space: string;
}

export type TemplateSource = "custom" | "default";

export interface TemplateConfig {
  source: TemplateSource;
  /** Data/URL of the uploaded custom template thumbnail (mock). */
  customThumb: string | null;
}

interface CelebrationState {
  posted: Record<CelebrationKind, PostedInfo | null>;
  templates: Record<CelebrationKind, TemplateConfig>;
  markPosted: (kind: CelebrationKind, space: string, at: string) => void;
  setTemplateSource: (kind: CelebrationKind, source: TemplateSource) => void;
  setCustomTemplate: (kind: CelebrationKind, thumb: string) => void;
}

export const useCelebrationStore = create<CelebrationState>()(
  persist(
    (set) => ({
      posted: { birthday: null, anniversary: null },
      templates: {
        birthday: { source: "default", customThumb: null },
        anniversary: { source: "default", customThumb: null },
      },
      markPosted: (kind, space, at) =>
        set((s) => ({ posted: { ...s.posted, [kind]: { space, at } } })),
      setTemplateSource: (kind, source) =>
        set((s) => ({ templates: { ...s.templates, [kind]: { ...s.templates[kind], source } } })),
      setCustomTemplate: (kind, thumb) =>
        set((s) => ({ templates: { ...s.templates, [kind]: { source: "custom", customThumb: thumb } } })),
    }),
    { name: "zelog-celebrations-v1", skipHydration: true },
  ),
);

export function useHydratedCelebrations() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useCelebrationStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}
