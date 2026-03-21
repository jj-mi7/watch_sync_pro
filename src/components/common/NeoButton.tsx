import type React from "react";
import { Text, TouchableOpacity, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

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
  color,
  variant = "filled",
  disabled = false,
  style,
  size = "md",
}) => {
  const { theme } = useUnistyles();
  const activeColor = color || theme.colors.primary;

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
    sm: { height: 40, paddingHorizontal: theme.spacing.lg },
    md: { height: 52, paddingHorizontal: theme.spacing.xl },
    lg: { height: 60, paddingHorizontal: theme.spacing.xxl },
  };

  const bgColor = variant === "filled" ? activeColor : "transparent";
  const borderColor = variant === "outline" ? activeColor : "transparent";
  const textColor =
    variant === "ghost" ? activeColor : variant === "outline" ? activeColor : "#000";

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

const styles = StyleSheet.create((theme) => ({
  button: {
    borderRadius: theme.borderRadius.round,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
}));
