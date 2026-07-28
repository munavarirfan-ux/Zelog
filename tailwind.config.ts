import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "app-bg": "rgb(var(--app-bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2-rgb) / <alpha-value>)",
        "surface-3": "rgb(var(--surface-3-rgb) / <alpha-value>)",
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong-rgb) / <alpha-value>)",
        text: "rgb(var(--text-rgb) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary-rgb) / <alpha-value>)",
        "text-tertiary": "rgb(var(--text-tertiary-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        navbar: "rgb(var(--nav-bg-rgb) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent-500-rgb) / <alpha-value>)",
          50: "rgb(var(--accent-50-rgb) / <alpha-value>)",
          100: "rgb(var(--accent-100-rgb) / <alpha-value>)",
          200: "rgb(var(--accent-200-rgb) / <alpha-value>)",
          500: "rgb(var(--accent-500-rgb) / <alpha-value>)",
          600: "rgb(var(--accent-600-rgb) / <alpha-value>)",
          700: "rgb(var(--accent-700-rgb) / <alpha-value>)",
          900: "rgb(var(--accent-900-rgb) / <alpha-value>)",
          hover: "rgb(var(--accent-hover-rgb) / <alpha-value>)",
          soft: "rgb(var(--accent-soft-rgb) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success-rgb) / <alpha-value>)",
          bg: "rgb(var(--success-rgb) / 0.14)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning-rgb) / <alpha-value>)",
          bg: "rgb(var(--warning-rgb) / 0.16)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger-rgb) / <alpha-value>)",
          bg: "rgb(var(--danger-rgb) / 0.14)",
        },
        info: {
          DEFAULT: "rgb(var(--info-rgb) / <alpha-value>)",
          bg: "rgb(var(--info-rgb) / 0.14)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "none",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        card: "14px",
        shell: "28px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        sm: "0 1px 2px 0 rgb(15 23 42 / 0.06), 0 1px 1px 0 rgb(15 23 42 / 0.04)",
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.08)",
        float: "0 8px 30px -6px rgba(76,29,149,0.22), 0 2px 8px -2px rgba(15,23,42,0.08)",
        glow: "0 0 0 4px rgb(var(--accent-500-rgb) / 0.12)",
      },
      transitionDuration: {
        150: "150ms",
        180: "180ms",
        220: "220ms",
      },
      keyframes: {
        "radix-in": {
          from: { opacity: "0", transform: "scale(0.97) translateY(2px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "radix-out": {
          from: { opacity: "1", transform: "scale(1) translateY(0)" },
          to: { opacity: "0", transform: "scale(0.97) translateY(2px)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(12px) scale(0.98)" },
          to: { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--accent-500-rgb) / 0.35)" },
          "100%": { boxShadow: "0 0 0 10px rgb(var(--accent-500-rgb) / 0)" },
        },
      },
      animation: {
        "radix-in": "radix-in 180ms ease-out forwards",
        "radix-out": "radix-out 150ms ease-in forwards",
        "fade-in": "fade-in 220ms ease-out forwards",
        "fade-out": "fade-out 150ms ease-in forwards",
        "slide-in-right": "slide-in-right 220ms cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "collapsible-down": "collapsible-down 220ms ease-out",
        "collapsible-up": "collapsible-up 180ms ease-in",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      backgroundImage: {
        hero: "linear-gradient(135deg, rgb(var(--hero-from-rgb)) 0%, rgb(var(--hero-via-rgb)) 55%, rgb(var(--hero-to-rgb)) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
