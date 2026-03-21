import { DefaultTheme, type Theme } from "@react-navigation/native";
import { darkTheme } from "./unistyles";

export const NeoTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: darkTheme.colors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.textPrimary,
    border: darkTheme.colors.surfaceBorder,
    notification: darkTheme.colors.tertiary,
  },
};
