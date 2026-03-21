import type React from "react";
import { Text, View, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  style?: ViewStyle;
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
  style,
  index = 0,
}) => {
  const { theme } = useUnistyles();
  const activeColor = color || theme.colors.primary;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={[styles.card, style]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${activeColor}20` }]}>
        <Text style={[styles.iconText, { color: activeColor }]}>{icon || "●"}</Text>
      </View>
      <Text style={[styles.value, { color: activeColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  iconText: {
    fontSize: theme.fontSize.md,
  },
  value: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    letterSpacing: -1,
    marginBottom: 2,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
}));
