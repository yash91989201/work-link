import { pixelBasedPreset } from "@react-email/components";

const fontSans = [
  "Inter",
  "Geist",
  "ui-sans-serif",
  "system-ui",
  "sans-serif",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
  "Noto Color Emoji",
];

const fontMono = ["JetBrains Mono", "monospace"];

const fontSerif = ["serif"];

const lightColors = {
  background: "#ffffff",
  foreground: "#010205",
  card: "#ffffff",
  "card-foreground": "#010205",
  popover: "#ffffff",
  "popover-foreground": "#010205",
  primary: "#af310e",
  "primary-foreground": "#ffffff",
  secondary: "#162d2d",
  "secondary-foreground": "#ffffff",
  muted: "#e5e7eb",
  "muted-foreground": "#252b37",
  accent: "#dadada",
  "accent-foreground": "#010205",
  destructive: "#dc0f0f",
  "destructive-foreground": "#f4f4f4",
  border: "#c8ccd4",
  input: "#c8ccd4",
  ring: "#af310e",
};

const darkColors = {
  background: "#020102",
  foreground: "#888888",
  card: "#020202",
  "card-foreground": "#888888",
  popover: "#020102",
  "popover-foreground": "#888888",
  primary: "#cc4116",
  "primary-foreground": "#020102",
  secondary: "#1d3e3e",
  "secondary-foreground": "#020102",
  muted: "#040404",
  "muted-foreground": "#3f3f3f",
  accent: "#080808",
  "accent-foreground": "#888888",
  destructive: "#1d3e3e",
  "destructive-foreground": "#020102",
  border: "#040404",
  input: "#040404",
  ring: "#cc4116",
};

const borderRadius = {
  none: "0px",
  sm: "8px",
  DEFAULT: "12px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
};

const boxShadow = {
  xs: "0px 1px 4px 0px rgba(0, 0, 0, 0.03)",
  sm: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 1px 2px -1px rgba(0, 0, 0, 0.05)",
  DEFAULT:
    "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 1px 2px -1px rgba(0, 0, 0, 0.05)",
  md: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.05)",
  lg: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.05)",
  xl: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 8px 10px -1px rgba(0, 0, 0, 0.05)",
  "2xl": "0px 1px 4px 0px rgba(0, 0, 0, 0.13)",
  none: "none",
};

export const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        ...lightColors,
        light: lightColors,
        dark: darkColors,
      },
      fontFamily: {
        sans: fontSans,
        mono: fontMono,
        serif: fontSerif,
      },
      borderRadius,
      boxShadow,
    },
  },
};

export const brandColors = {
  primary: lightColors.primary,
  primaryForeground: lightColors["primary-foreground"],
  secondary: lightColors.secondary,
  secondaryForeground: lightColors["secondary-foreground"],
};
