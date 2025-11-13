import { Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  type FontFamily,
  type FontSize,
  type LetterSpacing,
  type Radius,
  type Spacing,
  useThemeStore,
} from "@/stores/theme-store";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const fontFamilyOptions: {
  value: FontFamily;
  label: string;
  isDefault?: boolean;
}[] = [
  { value: "inter", label: "Inter" },
  { value: "geist", label: "Geist (Default)", isDefault: true },
  { value: "system", label: "System" },
  { value: "mono", label: "Monospace" },
  { value: "roboto", label: "Roboto" },
  { value: "opensans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "poppins", label: "Poppins" },
  { value: "nunito", label: "Nunito" },
  { value: "sfpro", label: "SF Pro (Apple)" },
  { value: "segoeui", label: "Segoe UI (Microsoft)" },
  { value: "ibmplex", label: "IBM Plex Sans" },
  { value: "worksans", label: "Work Sans" },
  { value: "dmsans", label: "DM Sans" },
];

const fontSizeOptions: {
  value: FontSize;
  label: string;
  isDefault?: boolean;
}[] = [
  { value: "xs", label: "Extra Small (12px)" },
  { value: "sm", label: "Small (14px)" },
  { value: "base", label: "Base (16px) - Default", isDefault: true },
  { value: "lg", label: "Large (18px)" },
  { value: "xl", label: "Extra Large (20px)" },
];

const radiusOptions: { value: Radius; label: string; isDefault?: boolean }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large (Default)", isDefault: true },
  { value: "xl", label: "Extra Large" },
  { value: "2xl", label: "2X Large" },
];

const spacingOptions: { value: Spacing; label: string; isDefault?: boolean }[] =
  [
    { value: "compact", label: "Compact" },
    { value: "cozy", label: "Cozy" },
    { value: "normal", label: "Normal (Default)", isDefault: true },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious" },
  ];

const letterSpacingOptions: {
  value: LetterSpacing;
  label: string;
  isDefault?: boolean;
}[] = [
  { value: "tighter", label: "Tighter" },
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal (Default)", isDefault: true },
  { value: "wide", label: "Wide" },
  { value: "wider", label: "Wider" },
];

export function Preferences() {
  const { setTheme, theme } = useTheme();
  const {
    fontFamily,
    fontSize,
    radius,
    spacing,
    letterSpacing,
    setFontFamily,
    setFontSize,
    setRadius,
    setSpacing,
    setLetterSpacing,
    resetTheme,
  } = useThemeStore();

  return (
    <>
      <div className="space-y-3">
        <h2>Interface and Themes</h2>

        <Card>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select onValueChange={setTheme} value={theme || "system"}>
                <SelectTrigger className="w-32" id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Font Family */}
            <div className="flex items-center justify-between">
              <Label htmlFor="font-family">Font Family</Label>

              <Select onValueChange={setFontFamily} value={fontFamily}>
                <SelectTrigger id="font-family">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size">Font Size</Label>

              <Select onValueChange={setFontSize} value={fontSize}>
                <SelectTrigger id="font-size">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Letter Spacing */}
            <div className="flex items-center justify-between">
              <Label htmlFor="letter-spacing">Letter Spacing</Label>

              <Select onValueChange={setLetterSpacing} value={letterSpacing}>
                <SelectTrigger id="letter-spacing">
                  <SelectValue placeholder="Select letter spacing" />
                </SelectTrigger>
                <SelectContent>
                  {letterSpacingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Spacing */}
            <div className="flex items-center justify-between">
              <Label htmlFor="spacing">Interface Spacing</Label>

              <Select onValueChange={setSpacing} value={spacing}>
                <SelectTrigger id="spacing">
                  <SelectValue placeholder="Select spacing" />
                </SelectTrigger>
                <SelectContent>
                  {spacingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Border Radius */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="radius">Border Radius</Label>

                <Select onValueChange={setRadius} value={radius}>
                  <SelectTrigger id="radius">
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    {radiusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-normal text-muted-foreground text-sm">
                  Visual Preview
                </Label>
                <div className="flex gap-2">
                  {radiusOptions.map((option) => (
                    <div
                      className="h-10 w-10 border-2 bg-card transition-colors hover:bg-accent"
                      key={option.value}
                      style={{
                        borderRadius:
                          option.value === "none"
                            ? "0"
                            : option.value === "sm"
                              ? "0.25rem"
                              : option.value === "md"
                                ? "0.5rem"
                                : option.value === "lg"
                                  ? "0.75rem"
                                  : option.value === "xl"
                                    ? "1rem"
                                    : "1.5rem",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Preview</h3>
              <div className="space-x-3">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Sample Section</h4>
                <p className="text-muted-foreground text-sm">
                  This is sample text content to show how your theme preferences
                  affect the appearance of text elements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={resetTheme} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
      </div>
    </>
  );
}
