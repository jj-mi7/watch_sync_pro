import type { TextStyle } from "react-native";

export const Typography = {
  hero: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
  } as TextStyle,
  h1: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  } as TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: "700",
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  } as TextStyle,
  bodyBold: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  } as TextStyle,
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  } as TextStyle,
  mono: {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "400",
  } as TextStyle,
  stat: {
    fontSize: 32,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  } as TextStyle,
} as const;
