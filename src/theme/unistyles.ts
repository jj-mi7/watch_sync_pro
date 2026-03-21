import { moderateScale } from "react-native-size-matters";
/**
 * Unistyles v3 Configuration
 * This must be imported before any StyleSheet.create calls (imported in index.js)
 */
import { StyleSheet } from "react-native-unistyles";

// ─── DARK NEO THEME ───────────────────────────────────────────────────────────
export const darkTheme = {
  colors: {
    background: "#000000",
    surface: "#1C1C1E",
    surfaceLight: "#2C2C2E",
    surfaceBorder: "#3A3A3C",
    primary: "#80DEEA", // Lighter cyan
    primaryDim: "#4DD0E1",
    primaryGlow: "rgba(128, 222, 234, 0.15)",
    secondary: "#CE93D8", // Lighter purple
    secondaryDim: "#BA68C8",
    secondaryGlow: "rgba(206, 147, 216, 0.15)",
    tertiary: "#F48FB1", // Lighter pink
    tertiaryGlow: "rgba(244, 143, 177, 0.15)",
    success: "#A5D6A7", // Lighter green
    warning: "#FFCC80", // Lighter orange
    error: "#EF9A9A", // Lighter red
    info: "#90CAF9", // Lighter blue
    textPrimary: "#FFFFFF",
    textSecondary: "#8E8E93",
    textTertiary: "#636366",
    textDisabled: "#48484A",
    chartCyan: "#80DEEA",
    chartPurple: "#CE93D8",
    chartPink: "#F48FB1",
    chartGreen: "#A5D6A7",
    chartOrange: "#FFCC80",
    chartBlue: "#90CAF9",
    overlay: "rgba(0, 0, 0, 0.6)",
    divider: "#2C2C2E",
    tabBarBg: "#000000",
  },
  spacing: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
    huge: moderateScale(48),
  },
  fontSize: {
    xs: moderateScale(9),
    sm: moderateScale(10),
    caption: moderateScale(12),
    body: moderateScale(14),
    md: moderateScale(16),
    lg: moderateScale(18),
    xl: moderateScale(22),
    xxl: moderateScale(28),
    hero: moderateScale(48),
    stat: moderateScale(32),
  },
  borderRadius: {
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    round: 9999,
  },
  gap: (v: number) => moderateScale(v * 8),
} as const;

// ─── LIGHT THEME (PLACEHOLDER — SAME STRUCTURE, FUTURE USE) ──────────────────
const lightTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: "#F2F2F7",
    surface: "#FFFFFF",
    surfaceLight: "#E5E5EA",
    surfaceBorder: "#D1D1D6",
    textPrimary: "#000000",
    textSecondary: "#3C3C43",
    textTertiary: "#636366",
    textDisabled: "#AEAEB2",
    tabBarBg: "#F9F9F9",
  },
} as const;

// ─── REGISTER THEMES ─────────────────────────────────────────────────────────
const appThemes = {
  darkNeo: darkTheme,
  light: lightTheme,
};

// ─── BREAKPOINTS ──────────────────────────────────────────────────────────────
const breakpoints = {
  xs: 0,
  sm: 320,
  md: 375,
  lg: 414,
  xl: 768,
  xxl: 1024,
};

// ─── TYPESCRIPT TYPES ─────────────────────────────────────────────────────────
type AppThemes = typeof appThemes;
type AppBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// ─── CONFIGURE ────────────────────────────────────────────────────────────────
StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings: {
    initialTheme: "darkNeo",
  },
});
