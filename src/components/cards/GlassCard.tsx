import type React from "react";
import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, glowColor }) => {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.card,
        {
          shadowColor: glowColor,
          borderColor: glowColor ? `${glowColor}22` : undefined,
        },
        style,
      ]}
    >
      <View style={[styles.glowStrip, glowColor ? { backgroundColor: glowColor } : undefined]} />
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
  },
  glowStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
}));
