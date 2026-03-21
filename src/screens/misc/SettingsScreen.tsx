import { GlassCard } from "@/components/cards/GlassCard";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { logout } from "@/redux/slices/authSlice";
import { clearDevice } from "@/redux/slices/deviceSlice";
import { clearHealth } from "@/redux/slices/healthSlice";
import {
  resetGoals,
  setDailyCalorieGoal,
  setDailyDistanceGoal,
  setDailyStepGoal,
  setUnits,
} from "@/redux/slices/settingsSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const settings = useSelector((state: RootState) => state.settings);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          dispatch(clearDevice());
          dispatch(clearHealth());
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </Animated.View>

      {/* Profile */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <GlassCard glowColor={Colors.primary} style={styles.card}>
          <Text style={styles.sectionLabel}>PROFILE</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.displayName?.[0]?.toUpperCase() || "W"}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{user?.displayName || "Watch User"}</Text>
              <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Daily Goals */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <GlassCard glowColor={Colors.chartCyan} style={styles.card}>
          <Text style={styles.sectionLabel}>DAILY GOALS</Text>
          <GoalRow
            label="Steps"
            value={settings.dailyStepGoal.toLocaleString()}
            color={Colors.chartCyan}
          />
          <GoalRow
            label="Calories"
            value={`${settings.dailyCalorieGoal} kcal`}
            color={Colors.chartPurple}
          />
          <GoalRow
            label="Distance"
            value={`${settings.dailyDistanceGoalKm} km`}
            color={Colors.chartGreen}
          />
          <NeoButton
            title="RESET TO DEFAULTS"
            onPress={() => dispatch(resetGoals())}
            variant="ghost"
            color={Colors.textTertiary}
            size="sm"
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>
      </Animated.View>

      {/* Preferences */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard glowColor={Colors.secondary} style={styles.card}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Unit System</Text>
            <View style={styles.unitToggle}>
              {(["metric", "imperial"] as const).map((unit) => (
                <NeoButton
                  key={unit}
                  title={unit === "metric" ? "KM" : "MI"}
                  onPress={() => dispatch(setUnits(unit))}
                  variant={settings.units === unit ? "filled" : "ghost"}
                  color={settings.units === unit ? Colors.secondary : Colors.textTertiary}
                  size="sm"
                  style={{ flex: 1, marginHorizontal: 4 }}
                />
              ))}
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      {/* App Info */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <GlassCard glowColor={Colors.textTertiary} style={styles.card}>
          <Text style={styles.sectionLabel}>APP</Text>
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Build" value="2026.03.21" />
          <InfoRow label="Storage" value="MMKV" />
          <InfoRow label="BLE Library" value="react-native-ble-plx" />
        </GlassCard>
      </Animated.View>

      {/* Logout */}
      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <NeoButton
          title="LOG OUT"
          onPress={handleLogout}
          color={Colors.error}
          size="lg"
          style={{ marginBottom: Spacing.xxl }}
        />
      </Animated.View>
    </ScreenWrapper>
  );
};

const GoalRow: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <View style={styles.goalRow}>
    <View style={styles.goalDot}>
      <View style={[styles.goalDotInner, { backgroundColor: color }]} />
    </View>
    <Text style={styles.goalLabel}>{label}</Text>
    <Text style={[styles.goalValue, { color }]}>{value}</Text>
  </View>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.primary,
  },
  profileName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  profileEmail: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  // Goals
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  goalDot: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  goalDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  goalLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  goalValue: {
    ...Typography.bodyBold,
  },
  // Prefs
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prefLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  unitToggle: {
    flexDirection: "row",
    width: 140,
  },
  // Info
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  infoValue: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
});
