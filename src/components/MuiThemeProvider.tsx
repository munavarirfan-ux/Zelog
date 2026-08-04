"use client";

import * as React from "react";
import { createTheme, ThemeProvider as MuiProvider } from "@mui/material/styles";

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

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          ...LIGHT_PALETTE,
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
            },
            variants: [
              {
                props: {
                  variant: "contained",
                  color: "primary",
                },
                style: {
                  background: "linear-gradient(135deg, #4133A5 0%, #5A43D5 50%, #7A4DFF 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2E2775 0%, #4133A5 50%, #5A43D5 100%)",
                  },
                },
              },
            ],
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
                  backgroundColor: "rgba(246, 242, 255, 0.6)",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(110, 79, 247, 0.25)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6E4FF7",
                    borderWidth: 2,
                    boxShadow: "0 0 0 4px rgba(110, 79, 247, 0.12)",
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
                color: "rgba(110, 79, 247, 0.3)",
                "&.Mui-checked": { color: "#5A43D5" },
                "&.MuiCheckbox-indeterminate": { color: "#5A43D5" },
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 18,
                backgroundImage: "none",
                border: "1px solid rgba(34, 28, 90, 0.06)",
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                borderRadius: 14,
                backgroundImage: "none",
                border: "1px solid rgba(34, 28, 90, 0.06)",
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
                backgroundColor: "#221C5A",
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
                  backgroundColor: "rgba(110, 79, 247, 0.1)",
                  color: "#5A43D5",
                  "&:hover": {
                    backgroundColor: "rgba(110, 79, 247, 0.15)",
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
    [],
  );

  return <MuiProvider theme={theme}>{children}</MuiProvider>;
}
