import { moderateScale } from "react-native-size-matters";
/**
 * Unistyles v3 Configuration
 * This must be imported before any StyleSheet.create calls (imported in index.js)
 */
import { StyleSheet } from "react-native-unistyles";

// ─── DARK NEO THEME ───────────────────────────────────────────────────────────
export const darkTheme = {
  colors: {
    background: "#09090B",
    surface: "#1C1C1E",
    surfaceLight: "#2C2C2E",
    surfaceBorder: "#3A3A3C",
    primary: "#00E5FF",
    primaryDim: "#00B8D4",
    primaryGlow: "rgba(0, 229, 255, 0.15)",
    secondary: "#BF5AF2",
    secondaryDim: "#9945D4",
    secondaryGlow: "rgba(191, 90, 242, 0.15)",
    tertiary: "#FF375F",
    tertiaryGlow: "rgba(255, 55, 95, 0.15)",
    success: "#32D74B",
    warning: "#FF9F0A",
    error: "#FF453A",
    info: "#0A84FF",
    textPrimary: "#FFFFFF",
    textSecondary: "#8E8E93",
    textTertiary: "#636366",
    textDisabled: "#48484A",
    chartCyan: "#00E5FF",
    chartPurple: "#BF5AF2",
    chartPink: "#FF375F",
    chartGreen: "#32D74B",
    chartOrange: "#FF9F0A",
    chartBlue: "#0A84FF",
    overlay: "rgba(0, 0, 0, 0.6)",
    divider: "#2C2C2E",
    tabBarBg: "#121214",
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
