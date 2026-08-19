"use client";

import { firstName, type CelebrationEmployee, type CelebrationKind } from "@/data/celebrationsData";

/** Photo grid layout that adapts to the number of celebrating employees. */
function layoutFor(n: number): { cols: number; size: number } {
  if (n <= 1) return { cols: 1, size: 108 };
  if (n === 2) return { cols: 2, size: 92 };
  if (n === 3) return { cols: 3, size: 78 };
  if (n === 4) return { cols: 2, size: 82 };
  if (n <= 6) return { cols: 3, size: 68 };
  if (n <= 9) return { cols: 3, size: 60 };
  return { cols: 5, size: 44 };
}

const THEME: Record<CelebrationKind, { title: string; tagline: string; bg: string; ring: string; text: string }> = {
  birthday: {
    title: "HAPPY BIRTHDAY 🎂",
    tagline: "Wishing you all an amazing year ahead!",
    bg: "linear-gradient(150deg, #FF7EB3 0%, #FF758C 45%, #FFB56B 100%)",
    ring: "rgba(255,255,255,0.85)",
    text: "#ffffff",
  },
  anniversary: {
    title: "WORK ANNIVERSARY ✨",
    tagline: "Thank you for growing with us.",
    bg: "linear-gradient(150deg, #7A4DFF 0%, #5B6BEF 45%, #E0A63C 120%)",
    ring: "rgba(255,255,255,0.85)",
    text: "#ffffff",
  },
};

/**
 * The branded celebration artwork. Employee photos are auto-placed into the
 * template's photo area — the count drives the grid layout.
 */
export function GeneratedTemplatePreview({
  kind,
  employees,
}: {
  kind: CelebrationKind;
  employees: CelebrationEmployee[];
}) {
  const theme = THEME[kind];
  const shown = employees.slice(0, 12);
  const { cols, size } = layoutFor(shown.length);
  const overflow = employees.length - shown.length;
  const names = employees.map((e) => firstName(e.name)).join(" • ");

  return (
    <div className="overflow-hidden rounded-[16px] shadow-[0_10px_30px_-14px_rgba(0,0,0,0.4)]" style={{ background: theme.bg }}>
      {/* subtle sheen */}
      <div className="relative px-5 pb-5 pt-5 text-center" style={{ color: theme.text }}>
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "18px 18px" }} />

        <p className="relative text-sm font-extrabold uppercase tracking-[0.18em] drop-shadow-sm">{theme.title}</p>

        {/* Employee photo area */}
        <div className="relative mx-auto mt-4 grid w-fit justify-center gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {shown.map((e) => (
            <img
              key={e.id}
              src={e.photo}
              alt={e.name}
              className="rounded-full object-cover"
              style={{ width: size, height: size, boxShadow: `0 0 0 3px ${theme.ring}` }}
            />
          ))}
          {overflow > 0 ? (
            <span
              className="flex items-center justify-center rounded-full bg-white/25 font-bold backdrop-blur"
              style={{ width: size, height: size, boxShadow: `0 0 0 3px ${theme.ring}`, fontSize: size / 3 }}
            >
              +{overflow}
            </span>
          ) : null}
        </div>

        <p className="relative mt-4 text-sm font-semibold drop-shadow-sm">{names}</p>
        <p className="relative mt-1 text-xs text-white/90">{theme.tagline}</p>
        <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-widest text-white/80">Team Zessta</p>
      </div>
    </div>
  );
}
