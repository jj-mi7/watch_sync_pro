import { GlassCard } from "@/components/cards/GlassCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { setDailyActiveGoal } from "@/redux/slices/settingsSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";

const DAYS_LABEL_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const ActiveScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const { todayActiveMinutes, history } = useSelector((state: RootState) => state.health);
  const { dailyActiveGoal } = useSelector((state: RootState) => state.settings);
  const [chartRange, setChartRange] = useState<"week" | "month">("week");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyActiveGoal);

  const progress = dailyActiveGoal > 0 ? todayActiveMinutes / dailyActiveGoal : 0;

  const chartData = useMemo(() => {
    const count = chartRange === "week" ? 7 : 30;
    if (history.length === 0) {
      return Array.from({ length: count }, () => 0);
    }
    const last = history.slice(-count);
    return last.map((r) => r.activeMinutes || 0);
  }, [history, chartRange]);

  const chartLabels = useMemo(() => {
    if (chartRange === "week") return DAYS_LABEL_7;
    return Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? `${i + 1}` : ""));
  }, [chartRange]);

  const goalPresets = [15, 30, 45, 60, 90];

  return (
    <ScreenWrapper>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Active Mins</Text>
        <TouchableOpacity style={styles.goalBadge} onPress={() => setShowGoalModal(true)}>
          <Text style={styles.goalBadgeText}>🎯 {dailyActiveGoal.toLocaleString()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Hero Ring */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
        <AnimatedRing progress={progress} size={180} strokeWidth={12} color={theme.colors.info}>
          <Text style={styles.heroValue}>{todayActiveMinutes.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>MINS TODAY</Text>
          <Text style={styles.heroGoal}>
            {Math.round(progress * 100)}% of {dailyActiveGoal.toLocaleString()}
          </Text>
        </AnimatedRing>
      </Animated.View>

      {/* Chart */}
      <HealthChart
        data={chartData}
        labels={chartLabels}
        color={theme.colors.info}
        title="ACTIVE HISTORY"
        unit="mins"
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      {/* Daily Log */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <GlassCard style={styles.logCard}>
          <Text style={styles.sectionLabel}>RECENT LOG</Text>
          {history.length > 0 ? (
            history.slice(-7).reverse().map((record, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: array is static
              <View key={i} style={styles.logRow}>
                <Text style={styles.logDate}>{formatDate(record.date)}</Text>
                <View style={styles.logBarContainer}>
                  <View
                    style={[
                      styles.logBar,
                      {
                        width: `${Math.min(((record.activeMinutes || 0) / dailyActiveGoal) * 100, 100)}%`,
                        backgroundColor:
                          (record.activeMinutes || 0) >= dailyActiveGoal
                            ? theme.colors.success
                            : theme.colors.info,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.logSteps}>{record.activeMinutes || 0}m</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No data yet — sync your watch to see history</Text>
          )}
        </GlassCard>
      </Animated.View>

      {/* Goal Setter Modal */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Daily Active Goal</Text>
            <View style={styles.goalPresets}>
              {goalPresets.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetBtn,
                    tempGoal === preset && {
                      backgroundColor: theme.colors.primaryGlow,
                      borderColor: theme.colors.info,
                    },
                  ]}
                  onPress={() => setTempGoal(preset)}
                >
                  <Text
                    style={[styles.presetText, tempGoal === preset && { color: theme.colors.info }]}
                  >
                    {preset.toLocaleString()} m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedGoal}>{tempGoal.toLocaleString()} mins/day</Text>
            <NeoButton
              title="SET GOAL"
              onPress={() => {
                dispatch(setDailyActiveGoal(tempGoal));
                setShowGoalModal(false);
              }}
              color={theme.colors.info}
              size="md"
              style={{ marginTop: theme.spacing.lg }}
            />
            <NeoButton
              title="CANCEL"
              onPress={() => setShowGoalModal(false)}
              variant="ghost"
              color={theme.colors.textTertiary}
              size="sm"
              style={{ marginTop: theme.spacing.sm }}
            />
          </GlassCard>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};



function formatDate(dateStr: string): string {
  if (!dateStr.includes("-")) return dateStr; // already formatted like "Today"
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  goalBadge: {
    backgroundColor: theme.colors.primaryGlow,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: `${theme.colors.info}40`,
  },
  goalBadgeText: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.info,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  heroValue: {
    fontSize: theme.fontSize.hero,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  heroLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: -2,
  },
  heroGoal: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.info,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  logCard: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  logDate: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    width: 60,
  },
  logBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    marginHorizontal: theme.spacing.sm,
    overflow: "hidden",
  },
  logBar: {
    height: 6,
    borderRadius: 3,
  },
  logSteps: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textPrimary,
    width: 52,
    textAlign: "right",
    fontWeight: "700",
  },
  emptyText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    textAlign: "center",
    paddingVertical: theme.spacing.lg,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxl,
  },
  modalCard: {},
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  goalPresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  presetBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.surfaceLight,
  },
  presetText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  selectedGoal: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
}));
