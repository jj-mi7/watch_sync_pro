import { Colors } from "@/constants/colors";
import { DefaultTheme, type Theme } from "@react-navigation/native";

export const NeoTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.surfaceBorder,
    notification: Colors.tertiary,
  },
};
