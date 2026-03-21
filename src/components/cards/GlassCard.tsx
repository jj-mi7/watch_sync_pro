import { BorderRadius, Colors, Spacing } from "@/constants";
import type React from "react";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  glowColor = Colors.primary,
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.card,
        {
          shadowColor: glowColor,
          borderColor: `${glowColor}22`,
        },
        style,
      ]}
    >
      <View style={[styles.glowStrip, { backgroundColor: glowColor }]} />
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
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
});
