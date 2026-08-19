import type { ReactNode } from "react";

export type HolidayType = "National" | "Festival" | "Regional" | "Company Holiday";

export interface HolidayTheme {
  type: HolidayType;
  region?: string;
  /** Subtle card background gradient. */
  gradient: string;
  /** Accent color for illustration + "View Details". */
  accent: string;
  /** Readable dark color for the countdown pill text. */
  badge: string;
  /** Full-bleed festival photograph (Unsplash, free license). */
  image: string;
  /** Decorative outline artwork (fallback / compact accents). */
  Illustration: (props: { className?: string }) => ReactNode;
}

/**
 * Themed photography via Unsplash Source (free Unsplash License — attribution
 * appreciated, not required). Swap to the Unsplash API or a licensed asset
 * pipeline for production. `?sig` keeps each holiday's image stable.
 */
function unsplash(keywords: string, sig: number): string {
  return `https://source.unsplash.com/800x600/?${keywords}&sig=${sig}`;
}

/* ── Minimal outline illustrations (decorative, currentColor) ── */

const svgProps = {
  viewBox: "0 0 100 100",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function AshokaChakra({ className }: { className?: string }) {
  return (
    <svg className={className} {...svgProps} aria-hidden>
      <circle cx="50" cy="50" r="38" />
      <circle cx="50" cy="50" r="7" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={50 + 7 * Math.cos(a)}
            y1={50 + 7 * Math.sin(a)}
            x2={50 + 38 * Math.cos(a)}
            y2={50 + 38 * Math.sin(a)}
          />
        );
      })}
    </svg>
  );
}

function DiyaLamp({ className }: { className?: string }) {
  return (
    <svg className={className} {...svgProps} aria-hidden>
      <path d="M18 60 Q50 80 82 60" />
      <path d="M22 60 Q50 72 78 60" />
      <path d="M50 58 C46 50 54 46 50 36 C60 44 60 54 50 58 Z" />
      <path d="M30 30 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 z" />
      <circle cx="74" cy="34" r="2" />
      <circle cx="66" cy="22" r="1.6" />
    </svg>
  );
}

function Pookalam({ className }: { className?: string }) {
  return (
    <svg className={className} {...svgProps} aria-hidden>
      <circle cx="50" cy="50" r="38" />
      <circle cx="50" cy="50" r="26" />
      <circle cx="50" cy="50" r="14" />
      <circle cx="50" cy="50" r="4" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <circle key={i} cx={50 + 32 * Math.cos(a)} cy={50 + 32 * Math.sin(a)} r="3" />;
      })}
    </svg>
  );
}

function GandhiGlasses({ className }: { className?: string }) {
  return (
    <svg className={className} {...svgProps} aria-hidden>
      <circle cx="34" cy="48" r="15" />
      <circle cx="70" cy="48" r="15" />
      <path d="M49 48 q3 -4 6 0" />
      <path d="M19 44 l-8 -4" />
      <path d="M85 44 q8 -2 8 6 v34" />
    </svg>
  );
}

function ChristmasTree({ className }: { className?: string }) {
  return (
    <svg className={className} {...svgProps} aria-hidden>
      <path d="M50 20 l16 22 -10 0 12 18 -12 0 12 18 -36 0 12 -18 -12 0 12 -18 -10 0 z" />
      <path d="M46 98 h8 v-6 h-8 z" />
      <path d="M50 8 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 z" />
    </svg>
  );
}

function Fireworks({ className }: { className?: string }) {
  return (
    <svg className={className} {...svgProps} aria-hidden>
      <circle cx="50" cy="50" r="4" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={50 + 10 * Math.cos(a)}
            y1={50 + 10 * Math.sin(a)}
            x2={50 + 34 * Math.cos(a)}
            y2={50 + 34 * Math.sin(a)}
          />
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return <circle key={`d${i}`} cx={50 + 38 * Math.cos(a)} cy={50 + 38 * Math.sin(a)} r="1.6" />;
      })}
    </svg>
  );
}

/* ── Theme map ── */

const THEMES: Record<string, HolidayTheme> = {
  "Independence Day": {
    type: "National",
    region: "India",
    gradient: "linear-gradient(135deg, #FFF3E4 0%, #FFFFFF 52%, #EAF6EC 100%)",
    accent: "#E07B39",
    badge: "#B45309",
    image: "/holidays/independence-day.png",
    Illustration: AshokaChakra,
  },
  "Republic Day": {
    type: "National",
    region: "India",
    gradient: "linear-gradient(135deg, #EAEFFB 0%, #FFFFFF 52%, #FFF3E4 100%)",
    accent: "#2748A6",
    badge: "#1E3A8A",
    image: unsplash("india,gate,delhi", 12),
    Illustration: AshokaChakra,
  },
  "Gandhi Jayanti": {
    type: "National",
    region: "India",
    gradient: "linear-gradient(135deg, #F6F7F0 0%, #FFFFFF 52%, #EEF1E2 100%)",
    accent: "#6E7A38",
    badge: "#4D5522",
    image: "/holidays/gandhi-jayanti.png",
    Illustration: GandhiGlasses,
  },
  Onam: {
    type: "Regional",
    region: "Kerala",
    gradient: "linear-gradient(135deg, #FFF8E7 0%, #FFFFFF 52%, #FDF2D3 100%)",
    accent: "#C99A2E",
    badge: "#8A6D1E",
    image: "/holidays/onam.png",
    Illustration: Pookalam,
  },
  Diwali: {
    type: "Festival",
    gradient: "linear-gradient(135deg, #FFF6DF 0%, #FFFFFF 52%, #FDEBC5 100%)",
    accent: "#D99A16",
    badge: "#B45309",
    image: unsplash("diwali,diya,lights", 15),
    Illustration: DiyaLamp,
  },
  Christmas: {
    type: "Festival",
    gradient: "linear-gradient(135deg, #EAF6EC 0%, #FFFFFF 52%, #FBEAEA 100%)",
    accent: "#2F855A",
    badge: "#276749",
    image: unsplash("christmas,tree,lights", 16),
    Illustration: ChristmasTree,
  },
  "New Year": {
    type: "Company Holiday",
    gradient: "linear-gradient(135deg, #ECE9FB 0%, #FFFFFF 52%, #F3EEFE 100%)",
    accent: "#6D5AE0",
    badge: "#5A43D5",
    image: unsplash("fireworks,newyear,celebration", 17),
    Illustration: Fireworks,
  },
};

const FALLBACK: HolidayTheme = {
  type: "Festival",
  gradient: "linear-gradient(135deg, #F1EEFE 0%, #FFFFFF 52%, #F6F3FE 100%)",
  accent: "#7A4DFF",
  badge: "#5A43D5",
  image: unsplash("festival,celebration,lights", 18),
  Illustration: Fireworks,
};

export function getHolidayTheme(name: string): HolidayTheme {
  return THEMES[name] ?? FALLBACK;
}
