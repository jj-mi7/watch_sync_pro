export const Colors = {
  // Core backgrounds
  background: "#000000",
  surface: "#1C1C1E",
  surfaceLight: "#2C2C2E",
  surfaceBorder: "#3A3A3C",

  // Primary accent — electric cyan
  primary: "#00E5FF",
  primaryDim: "#00B8D4",
  primaryGlow: "rgba(0, 229, 255, 0.15)",

  // Secondary accent — neon purple
  secondary: "#BF5AF2",
  secondaryDim: "#9945D4",
  secondaryGlow: "rgba(191, 90, 242, 0.15)",

  // Tertiary — hot pink
  tertiary: "#FF375F",
  tertiaryGlow: "rgba(255, 55, 95, 0.15)",

  // Semantic
  success: "#32D74B",
  warning: "#FF9F0A",
  error: "#FF453A",
  info: "#0A84FF",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",
  textDisabled: "#48484A",

  // Chart palette
  chartCyan: "#00E5FF",
  chartPurple: "#BF5AF2",
  chartPink: "#FF375F",
  chartGreen: "#32D74B",
  chartOrange: "#FF9F0A",
  chartBlue: "#0A84FF",

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
