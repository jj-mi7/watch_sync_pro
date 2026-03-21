import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import type React from "react";
import { StyleSheet, Text, TouchableOpacity, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: "filled" | "outline" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const NeoButton: React.FC<NeoButtonProps> = ({
  title,
  onPress,
  color = Colors.primary,
  variant = "filled",
  disabled = false,
  style,
  size = "md",
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: Spacing.lg },
    md: { height: 52, paddingHorizontal: Spacing.xl },
    lg: { height: 60, paddingHorizontal: Spacing.xxl },
  };

  const bgColor = variant === "filled" ? color : "transparent";
  const borderColor = variant === "outline" ? color : "transparent";
  const textColor = variant === "ghost" ? color : variant === "outline" ? color : "#000";

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      style={[
        styles.button,
        sizeStyles[size],
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
          shadowColor: variant === "filled" ? color : "transparent",
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor, fontSize: size === "sm" ? 13 : size === "lg" ? 16 : 14 },
        ]}
      >
        {title}
      </Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.round,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
