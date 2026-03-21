import type React from "react";
import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.card, style]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    overflow: "hidden",
  },
}));
