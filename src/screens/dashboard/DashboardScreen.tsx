import { GlassCard } from "@/components/cards/GlassCard";
import { StatCard } from "@/components/cards/StatCard";
import { WatchCard } from "@/components/cards/WatchCard";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import type { RootState } from "@/redux/store";
import { useNavigation } from "@react-navigation/native";
import type React from "react";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSelector } from "react-redux";

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { device, connectionStatus } = useSelector((state: RootState) => state.device);
  const { todaySteps, todayCalories, todayDistanceKm } = useSelector(
    (state: RootState) => state.health,
  );
  const { dailyStepGoal, dailyCalorieGoal, dailyDistanceGoalKm } = useSelector(
    (state: RootState) => state.settings,
  );

  const stepProgress = useMemo(
    () => (dailyStepGoal > 0 ? todaySteps / dailyStepGoal : 0),
    [todaySteps, dailyStepGoal],
  );
  const calProgress = useMemo(
    () => (dailyCalorieGoal > 0 ? todayCalories / dailyCalorieGoal : 0),
    [todayCalories, dailyCalorieGoal],
  );
  const distProgress = useMemo(
    () => (dailyDistanceGoalKm > 0 ? todayDistanceKm / dailyDistanceGoalKm : 0),
    [todayDistanceKm, dailyDistanceGoalKm],
  );

  return (
    <ScreenWrapper>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()}</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.syncBadge}
          onPress={() => navigation.navigate("Device", { screen: "Sync" })}
        >
          <Text style={styles.syncBadgeText}>⟳ SYNC</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Watch Card */}
      <WatchCard
        watchName={device?.name || "CASIO ABL-100WE"}
        photoUri={device?.photoUri}
        connectionStatus={connectionStatus}
        batteryLevel={device?.batteryLevel ?? 85}
        lastSyncTime={device?.lastSyncTime}
        onPress={() => navigation.navigate("Device")}
        style={styles.watchCard}
      />

      {/* Progress Rings */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <GlassCard glowColor={Colors.primary} style={styles.ringsCard}>
          <Text style={styles.sectionLabel}>TODAY'S PROGRESS</Text>
          <View style={styles.ringsRow}>
            {/* Steps Ring */}
            <TouchableOpacity style={styles.ringItem} onPress={() => navigation.navigate("Steps")}>
              <AnimatedRing progress={stepProgress} size={90} color={Colors.chartCyan}>
                <Text style={styles.ringValue}>{formatNumber(todaySteps)}</Text>
                <Text style={styles.ringUnit}>steps</Text>
              </AnimatedRing>
            </TouchableOpacity>

            {/* Calories Ring */}
            <TouchableOpacity style={styles.ringItem}>
              <AnimatedRing progress={calProgress} size={90} color={Colors.chartPurple}>
                <Text style={styles.ringValue}>{todayCalories}</Text>
                <Text style={styles.ringUnit}>cal</Text>
              </AnimatedRing>
            </TouchableOpacity>

            {/* Distance Ring */}
            <TouchableOpacity style={styles.ringItem}>
              <AnimatedRing progress={distProgress} size={90} color={Colors.chartGreen}>
                <Text style={styles.ringValue}>{todayDistanceKm}</Text>
                <Text style={styles.ringUnit}>km</Text>
              </AnimatedRing>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.statsRow}>
        <StatCard
          label="STEP GOAL"
          value={formatNumber(dailyStepGoal)}
          icon="🎯"
          color={Colors.chartCyan}
          index={0}
          style={styles.statCardSpacing}
        />
        <View style={{ width: Spacing.md }} />
        <StatCard
          label="STREAK"
          value="7d"
          icon="🔥"
          color={Colors.warning}
          index={1}
          style={styles.statCardSpacing}
        />
        <View style={{ width: Spacing.md }} />
        <StatCard
          label="RANK"
          value="#3"
          icon="⭐"
          color={Colors.secondary}
          index={2}
          style={styles.statCardSpacing}
        />
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
        <GlassCard glowColor={Colors.secondary} style={styles.actionsCard}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.actionsRow}>
            <QuickAction
              icon="📱"
              label="Find Phone"
              onPress={() => navigation.navigate("Device", { screen: "FindPhone" })}
            />
            <QuickAction
              icon="📸"
              label="Watch Photo"
              onPress={() => navigation.navigate("Device", { screen: "WatchProfile" })}
            />
            <QuickAction
              icon="⚙️"
              label="Settings"
              onPress={() => navigation.navigate("Settings")}
            />
            <QuickAction icon="📊" label="History" onPress={() => navigation.navigate("Steps")} />
          </View>
        </GlassCard>
      </Animated.View>
    </ScreenWrapper>
  );
};

const QuickAction: React.FC<{ icon: string; label: string; onPress: () => void }> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity style={qaStyles.action} onPress={onPress} activeOpacity={0.7}>
    <View style={qaStyles.iconWrap}>
      <Text style={qaStyles.icon}>{icon}</Text>
    </View>
    <Text style={qaStyles.label}>{label}</Text>
  </TouchableOpacity>
);

const qaStyles = StyleSheet.create({
  action: {
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    ...Typography.label,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});

// Helpers
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  syncBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  syncBadgeText: {
    ...Typography.label,
    color: Colors.primary,
    fontSize: 10,
  },
  watchCard: {
    marginBottom: Spacing.xl,
  },
  ringsCard: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  ringItem: {
    alignItems: "center",
  },
  ringValue: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  ringUnit: {
    ...Typography.label,
    color: Colors.textTertiary,
    fontSize: 8,
    marginTop: -2,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
  },
  statCardSpacing: {},
  actionsCard: {
    marginBottom: Spacing.xl,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
