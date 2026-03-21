import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import type React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

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
  color = Colors.primary,
  style,
  index = 0,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      style={[styles.card, style]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.iconText, { color }]}>{icon || "●"}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconText: {
    fontSize: 16,
  },
  value: {
    ...Typography.stat,
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 9,
  },
});
