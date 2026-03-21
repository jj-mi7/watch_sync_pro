import { GlassCard } from "@/components/cards/GlassCard";
import { StatCard } from "@/components/cards/StatCard";
import { WatchCard } from "@/components/cards/WatchCard";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import type { RootState } from "@/redux/store";
import { NotificationService } from "@/services/notifications/NotificationService";
import { useNavigation } from "@react-navigation/native";
import type React from "react";
import { useEffect, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSelector } from "react-redux";

export const DashboardScreen: React.FC = () => {
  const { theme } = useUnistyles();
  // biome-ignore lint/suspicious/noExplicitAny: Root stack param list not fully enforced yet
  const navigation = useNavigation<any>();
  const { device, connectionStatus } = useSelector((state: RootState) => state.device);
  const { todaySteps, todayCalories, todayDistanceKm, todayActiveMinutes } = useSelector(
    (state: RootState) => state.health,
  );
  const { dailyStepGoal, dailyCalorieGoal, dailyDistanceGoalKm, dailyActiveGoal } = useSelector(
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
  const activeProgress = useMemo(
    () => (dailyActiveGoal > 0 ? todayActiveMinutes / dailyActiveGoal : 0),
    [todayActiveMinutes, dailyActiveGoal],
  );

  useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

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
        <GlassCard glowColor={theme.colors.primary} style={styles.ringsCard}>
          <Text style={styles.sectionLabel}>TODAY'S PROGRESS</Text>
          <View style={styles.ringsRow}>
            {/* Steps Ring */}
            <TouchableOpacity style={styles.ringItem} onPress={() => navigation.navigate("Steps")}>
              <AnimatedRing progress={stepProgress} size={75} color={theme.colors.chartCyan}>
                <Text style={styles.ringValue}>{formatNumber(todaySteps)}</Text>
                <Text style={styles.ringUnit}>steps</Text>
              </AnimatedRing>
            </TouchableOpacity>

            {/* Calories Ring */}
            <TouchableOpacity
              style={styles.ringItem}
              onPress={() => navigation.navigate("Steps", { screen: "Calories" })}
            >
              <AnimatedRing progress={calProgress} size={75} color={theme.colors.chartPurple}>
                <Text style={styles.ringValue}>{todayCalories}</Text>
                <Text style={styles.ringUnit}>cal</Text>
              </AnimatedRing>
            </TouchableOpacity>

            {/* Distance Ring */}
            <TouchableOpacity
              style={styles.ringItem}
              onPress={() => navigation.navigate("Steps", { screen: "Distance" })}
            >
              <AnimatedRing progress={distProgress} size={75} color={theme.colors.chartGreen}>
                <Text style={styles.ringValue}>{todayDistanceKm}</Text>
                <Text style={styles.ringUnit}>km</Text>
              </AnimatedRing>
            </TouchableOpacity>

            {/* Active Mins Ring */}
            <TouchableOpacity
              style={styles.ringItem}
              onPress={() => navigation.navigate("Steps", { screen: "Active" })}
            >
              <AnimatedRing progress={activeProgress} size={75} color={theme.colors.info}>
                <Text style={styles.ringValue}>{todayActiveMinutes}</Text>
                <Text style={styles.ringUnit}>min</Text>
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
          color={theme.colors.chartCyan}
          index={0}
          style={styles.statCardSpacing}
        />
        <View style={{ width: theme.spacing.md }} />
        <StatCard
          label="STREAK"
          value="7d"
          icon="🔥"
          color={theme.colors.warning}
          index={1}
          style={styles.statCardSpacing}
        />
        <View style={{ width: theme.spacing.md }} />
        <StatCard
          label="RANK"
          value="#3"
          icon="⭐"
          color={theme.colors.secondary}
          index={2}
          style={styles.statCardSpacing}
        />
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(600).duration(500)}>
        <GlassCard glowColor={theme.colors.secondary} style={styles.actionsCard}>
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

      {/* Quick Start Workouts */}
      <Animated.View entering={FadeInDown.delay(700).duration(500)}>
        <GlassCard glowColor={theme.colors.chartOrange} style={styles.actionsCard}>
          <Text style={styles.sectionLabel}>QUICK START WORKOUT</Text>
          <View style={styles.actionsRow}>
            <QuickAction icon="🏃" label="Run" onPress={() => console.log("Start Run")} />
            <QuickAction icon="🚶" label="Walk" onPress={() => console.log("Start Walk")} />
            <QuickAction icon="🚴" label="Cycle" onPress={() => console.log("Start Cycle")} />
            <QuickAction icon="🧘" label="Yoga" onPress={() => console.log("Start Yoga")} />
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

const qaStyles = StyleSheet.create((theme) => ({
  action: {
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
}));

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

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  syncBadge: {
    backgroundColor: theme.colors.primaryGlow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
  },
  syncBadgeText: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  watchCard: {
    marginBottom: theme.spacing.xl,
  },
  ringsCard: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
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
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  ringUnit: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
    marginTop: -2,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.xl,
  },
  statCardSpacing: {},
  actionsCard: {
    marginBottom: theme.spacing.xl,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
}));
