import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontFamily =
  | "inter"
  | "geist"
  | "system"
  | "mono"
  | "roboto"
  | "opensans"
  | "lato"
  | "poppins"
  | "nunito"
  | "sfpro"
  | "segoeui"
  | "ibmplex"
  | "worksans"
  | "dmsans";
export type FontSize = "xs" | "sm" | "base" | "lg" | "xl";
export type Radius = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
export type Spacing =
  | "compact"
  | "cozy"
  | "normal"
  | "comfortable"
  | "spacious";
export type LetterSpacing = "tighter" | "tight" | "normal" | "wide" | "wider";

interface ThemeConfig {
  fontFamily: FontFamily;
  fontSize: FontSize;
  radius: Radius;
  spacing: Spacing;
  letterSpacing: LetterSpacing;
}

interface ThemeStore extends ThemeConfig {
  setFontFamily: (fontFamily: FontFamily) => void;
  setFontSize: (fontSize: FontSize) => void;
  setRadius: (radius: Radius) => void;
  setSpacing: (spacing: Spacing) => void;
  setLetterSpacing: (letterSpacing: LetterSpacing) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  fontFamily: "geist",
  fontSize: "base",
  radius: "lg",
  spacing: "normal",
  letterSpacing: "normal",
};

const fontFamilyMap: Record<FontFamily, string> = {
  inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
  geist: "'Geist', ui-sans-serif, system-ui, sans-serif",
  system: "ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Courier New', ui-monospace, monospace",
  roboto: "'Roboto', ui-sans-serif, system-ui, sans-serif",
  opensans: "'Open Sans', ui-sans-serif, system-ui, sans-serif",
  lato: "'Lato', ui-sans-serif, system-ui, sans-serif",
  poppins: "'Poppins', ui-sans-serif, system-ui, sans-serif",
  nunito: "'Nunito', ui-sans-serif, system-ui, sans-serif",
  sfpro:
    "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif",
  segoeui: "'Segoe UI', -apple-system, system-ui, sans-serif",
  ibmplex: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
  worksans: "'Work Sans', ui-sans-serif, system-ui, sans-serif",
  dmsans: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
};

const fontSizeMap: Record<FontSize, string> = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
};

const radiusMap: Record<Radius, string> = {
  none: "0rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
};

const spacingMap: Record<Spacing, string> = {
  compact: "0.175rem",
  cozy: "0.2125rem",
  normal: "0.25rem",
  comfortable: "0.3125rem",
  spacious: "0.375rem",
};

const letterSpacingMap: Record<LetterSpacing, string> = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
};

function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;

  root.style.setProperty("--font-sans", fontFamilyMap[theme.fontFamily]);
  root.style.setProperty("--font-mono", fontFamilyMap[theme.fontFamily]);
  root.style.setProperty("--font-size-root", fontSizeMap[theme.fontSize]);
  root.style.setProperty("--radius", radiusMap[theme.radius]);
  root.style.setProperty("--spacing", spacingMap[theme.spacing]);
  root.style.setProperty(
    "--tracking-normal",
    letterSpacingMap[theme.letterSpacing]
  );

  document.body.style.fontSize = fontSizeMap[theme.fontSize];
  document.body.style.fontFamily = fontFamilyMap[theme.fontFamily];
  document.body.style.letterSpacing = letterSpacingMap[theme.letterSpacing];
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...defaultTheme,

      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        applyTheme({ ...get() });
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        applyTheme({ ...get() });
      },

      setRadius: (radius) => {
        set({ radius });
        applyTheme({ ...get() });
      },

      setSpacing: (spacing) => {
        set({ spacing });
        applyTheme({ ...get() });
      },

      setLetterSpacing: (letterSpacing) => {
        set({ letterSpacing });
        applyTheme({ ...get() });
      },

      resetTheme: () => {
        set(defaultTheme);
        applyTheme(defaultTheme);
      },
    }),
    {
      name: "theme-preferences",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state);
        }
      },
    }
  )
);

export { applyTheme };
