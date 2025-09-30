"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandColors = exports.emailTailwindConfig = void 0;
var components_1 = require("@react-email/components");
var fontSans = [
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
var fontMono = ["JetBrains Mono", "monospace"];
var fontSerif = ["serif"];
var lightColors = {
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
var darkColors = {
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
var borderRadius = {
    none: "0px",
    sm: "8px",
    DEFAULT: "12px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
};
var boxShadow = {
    xs: "0px 1px 4px 0px rgba(0, 0, 0, 0.03)",
    sm: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 1px 2px -1px rgba(0, 0, 0, 0.05)",
    DEFAULT: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 1px 2px -1px rgba(0, 0, 0, 0.05)",
    md: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.05)",
    lg: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 4px 6px -1px rgba(0, 0, 0, 0.05)",
    xl: "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 8px 10px -1px rgba(0, 0, 0, 0.05)",
    "2xl": "0px 1px 4px 0px rgba(0, 0, 0, 0.13)",
    none: "none",
};
exports.emailTailwindConfig = {
    presets: [components_1.pixelBasedPreset],
    theme: {
        extend: {
            colors: __assign(__assign({}, lightColors), { light: lightColors, dark: darkColors }),
            fontFamily: {
                sans: fontSans,
                mono: fontMono,
                serif: fontSerif,
            },
            borderRadius: borderRadius,
            boxShadow: boxShadow,
        },
    },
};
exports.brandColors = {
    primary: lightColors.primary,
    primaryForeground: lightColors["primary-foreground"],
    secondary: lightColors.secondary,
    secondaryForeground: lightColors["secondary-foreground"],
};
