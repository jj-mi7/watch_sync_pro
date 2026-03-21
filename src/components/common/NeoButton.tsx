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
    md: { height: 48, paddingHorizontal: theme.spacing.xl },
    lg: { height: 52, paddingHorizontal: theme.spacing.xxl },
  };

  // Light, muted style: soft bg + colored text (minimalistic)
  const bgColor =
    variant === "filled"
      ? `${activeColor}18` // 10% opacity tinted bg
      : "transparent";
  const borderColor = variant === "outline" ? `${activeColor}40` : "transparent";
  const textColor = activeColor;

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
          borderWidth: variant === "outline" ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize:
              size === "sm"
                ? theme.fontSize.caption
                : size === "lg"
                  ? theme.fontSize.body
                  : theme.fontSize.caption,
          },
        ]}
      >
        {title}
      </Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
}));
