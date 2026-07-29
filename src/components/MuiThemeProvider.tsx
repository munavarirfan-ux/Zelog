"use client";

import * as React from "react";
import { createTheme, ThemeProvider as MuiProvider } from "@mui/material/styles";
import { useTheme } from "@/components/ThemeProvider";

const LIGHT_PALETTE = {
  primary: { main: "#6E4FF7", light: "#8A6BFF", dark: "#5A43D5", contrastText: "#fff" },
  secondary: { main: "#4133A5", light: "#5A43D5", dark: "#2F2775" },
  error: { main: "#BE3737", light: "#D45A5A", dark: "#9A2D2D" },
  success: { main: "#2D8C64", light: "#4AAF82", dark: "#1F6B4C" },
  warning: { main: "#A8781E", light: "#C49440", dark: "#856014" },
  info: { main: "#3C64C8", light: "#5A82E0", dark: "#2E4FA0" },
  background: { default: "#FAF9FE", paper: "#FFFFFF" },
  text: { primary: "#141030", secondary: "#5A5578", disabled: "#B4AFC8" },
  divider: "rgba(34, 28, 90, 0.08)",
};

const DARK_PALETTE = {
  primary: { main: "#8A6BFF", light: "#A98CFF", dark: "#6E4FF7", contrastText: "#fff" },
  secondary: { main: "#A98CFF", light: "#C9B6FF", dark: "#8A6BFF" },
  error: { main: "#F06E6E", light: "#F5A0A0", dark: "#C24B4B" },
  success: { main: "#50C88C", light: "#80E0B0", dark: "#2D8C64" },
  warning: { main: "#DCB450", light: "#E8CC80", dark: "#A8781E" },
  info: { main: "#6EA0F0", light: "#A0C0F8", dark: "#3C64C8" },
  background: { default: "#0A0912", paper: "#12101E" },
  text: { primary: "#EDEAF8", secondary: "#A59EBE", disabled: "#504C69" },
  divider: "rgba(201, 182, 255, 0.08)",
};

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          ...(isDark ? DARK_PALETTE : LIGHT_PALETTE),
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          button: { textTransform: "none" as const, fontWeight: 600 },
        },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true, disableRipple: true },
            styleOverrides: {
              root: { borderRadius: 10, textTransform: "none", fontWeight: 600 },
              containedPrimary: {
                background: "linear-gradient(135deg, #4133A5 0%, #5A43D5 50%, #7A4DFF 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2F2775 0%, #4133A5 50%, #5A43D5 100%)",
                },
              },
            },
          },
          MuiIconButton: {
            defaultProps: { disableRipple: true },
          },
          MuiTextField: {
            defaultProps: { size: "small" },
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 10,
                  backgroundColor: isDark ? "rgba(138, 107, 255, 0.04)" : "rgba(246, 242, 255, 0.6)",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "rgba(138, 107, 255, 0.3)" : "rgba(110, 79, 247, 0.25)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDark ? "#8A6BFF" : "#6E4FF7",
                    borderWidth: 2,
                    boxShadow: `0 0 0 4px ${isDark ? "rgba(138, 107, 255, 0.12)" : "rgba(110, 79, 247, 0.12)"}`,
                  },
                },
              },
            },
          },
          MuiSelect: {
            defaultProps: { size: "small" },
            styleOverrides: {
              root: { borderRadius: 10 },
            },
          },
          MuiCheckbox: {
            defaultProps: { disableRipple: true },
            styleOverrides: {
              root: {
                color: isDark ? "rgba(138, 107, 255, 0.4)" : "rgba(110, 79, 247, 0.3)",
                "&.Mui-checked": { color: isDark ? "#8A6BFF" : "#5A43D5" },
                "&.MuiCheckbox-indeterminate": { color: isDark ? "#8A6BFF" : "#5A43D5" },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 18,
                backgroundImage: "none",
                border: isDark ? "1px solid rgba(138, 107, 255, 0.1)" : "1px solid rgba(34, 28, 90, 0.06)",
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                borderRadius: 14,
                backgroundImage: "none",
                border: isDark ? "1px solid rgba(138, 107, 255, 0.1)" : "1px solid rgba(34, 28, 90, 0.06)",
              },
            },
          },
          MuiPopover: {
            styleOverrides: {
              paper: { borderRadius: 14, backgroundImage: "none" },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                backgroundColor: isDark ? "#1A172E" : "#221C5A",
              },
            },
          },
          MuiSwitch: {
            defaultProps: { disableRipple: true },
            styleOverrides: {
              switchBase: {
                "&.Mui-checked": {
                  color: "#fff",
                  "& + .MuiSwitch-track": {
                    background: "linear-gradient(135deg, #4133A5, #7A4DFF)",
                    opacity: 1,
                  },
                },
              },
            },
          },
          MuiToggleButton: {
            defaultProps: { disableRipple: true },
            styleOverrides: {
              root: {
                "&.Mui-selected": {
                  backgroundColor: isDark ? "rgba(138, 107, 255, 0.15)" : "rgba(110, 79, 247, 0.1)",
                  color: isDark ? "#A98CFF" : "#5A43D5",
                  "&:hover": {
                    backgroundColor: isDark ? "rgba(138, 107, 255, 0.2)" : "rgba(110, 79, 247, 0.15)",
                  },
                },
              },
            },
          },
          MuiToggleButtonGroup: {
            defaultProps: { size: "small" },
          },
          MuiChip: {
            styleOverrides: {
              root: { borderRadius: 999, fontWeight: 600 },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: { borderRadius: 99, height: 8 },
              bar: {
                background: "linear-gradient(90deg, #4133A5, #6E4FF7, #8A6BFF)",
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              indicator: {
                background: "linear-gradient(90deg, #5A43D5, #7A4DFF)",
                borderRadius: 4,
              },
            },
          },
          MuiTab: {
            defaultProps: { disableRipple: true },
            styleOverrides: {
              root: { textTransform: "none", fontWeight: 500, minHeight: 40 },
            },
          },
        },
      }),
    [isDark],
  );

  return <MuiProvider theme={theme}>{children}</MuiProvider>;
}
