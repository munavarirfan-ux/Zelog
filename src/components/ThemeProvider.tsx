"use client";

/**
 * ZeLog is a light-theme-only app. This provider no longer performs any
 * theme switching or system detection; it simply renders its children.
 *
 * `useTheme` is kept for API compatibility with components that still call
 * it — it always reports the light theme and its setters are no-ops.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  return {
    theme: "light" as const,
    resolvedTheme: "light" as const,
    setTheme: (_theme: string) => {},
    toggleTheme: () => {},
  };
}
