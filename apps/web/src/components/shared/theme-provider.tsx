import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { useEffect } from "react";
import { applyTheme, useThemeStore } from "@/stores/theme-store";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const theme = useThemeStore();

  useEffect(() => {
    applyTheme({
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
      radius: theme.radius,
      spacing: theme.spacing,
      letterSpacing: theme.letterSpacing,
    });
  }, [theme.fontFamily, theme.fontSize, theme.radius, theme.spacing, theme.letterSpacing]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme } from "next-themes";
