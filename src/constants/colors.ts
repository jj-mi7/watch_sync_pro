export const Colors = {
  // Core backgrounds
  background: "#000000",
  surface: "#1C1C1E",
  surfaceLight: "#2C2C2E",
  surfaceBorder: "#3A3A3C",

  // Primary accent
  primary: "#80DEEA",
  primaryDim: "#4DD0E1",
  primaryGlow: "rgba(128, 222, 234, 0.15)",

  // Secondary accent
  secondary: "#CE93D8",
  secondaryDim: "#BA68C8",
  secondaryGlow: "rgba(206, 147, 216, 0.15)",

  // Tertiary
  tertiary: "#F48FB1",
  tertiaryGlow: "rgba(244, 143, 177, 0.15)",

  // Semantic
  success: "#A5D6A7",
  warning: "#FFCC80",
  error: "#EF9A9A",
  info: "#90CAF9",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",
  textDisabled: "#48484A",

  // Chart palette
  chartCyan: "#80DEEA",
  chartPurple: "#CE93D8",
  chartPink: "#F48FB1",
  chartGreen: "#A5D6A7",
  chartOrange: "#FFCC80",
  chartBlue: "#90CAF9",

  // Gradients (start, end)
  gradientPrimary: ["#00E5FF", "#0A84FF"] as const,
  gradientSecondary: ["#BF5AF2", "#FF375F"] as const,
  gradientSuccess: ["#32D74B", "#00E5FF"] as const,

  // Misc
  overlay: "rgba(0, 0, 0, 0.6)",
  divider: "#2C2C2E",
  tabBarBg: "#000000",
} as const;

export type ColorKey = keyof typeof Colors;
