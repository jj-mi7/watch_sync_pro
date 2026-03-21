import type { Badge } from "@/types";
import type React from "react";
import { Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface BadgeIconProps {
  badge: Badge;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({ badge }) => {
  const { theme } = useUnistyles();
  const isUnlocked = !!badge.unlockedAt;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          isUnlocked
            ? { backgroundColor: theme.colors.primaryGlow, borderColor: theme.colors.primary }
            : {
                backgroundColor: theme.colors.surfaceLight,
                borderColor: theme.colors.surfaceBorder,
              },
        ]}
      >
        <Text style={[styles.icon, !isUnlocked && { opacity: 0.3 }]}>{badge.icon}</Text>
      </View>
      <Text style={[styles.name, !isUnlocked && { color: theme.colors.textDisabled }]}>
        {badge.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    width: moderateScale(72),
    marginRight: theme.spacing.md,
  },
  circle: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginBottom: theme.spacing.xs,
  },
  icon: {
    fontSize: theme.fontSize.xl,
  },
  name: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
}));
