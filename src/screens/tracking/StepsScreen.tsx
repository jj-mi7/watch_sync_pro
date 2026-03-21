import { GlassCard } from "@/components/cards/GlassCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { setDailyStepGoal } from "@/redux/slices/settingsSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";

const DAYS_LABEL_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const StepsScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const { todaySteps, history } = useSelector((state: RootState) => state.health);
  const { dailyStepGoal } = useSelector((state: RootState) => state.settings);
  const [chartRange, setChartRange] = useState<"week" | "month">("week");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyStepGoal);

  const progress = dailyStepGoal > 0 ? todaySteps / dailyStepGoal : 0;

  const chartData = useMemo(() => {
    const count = chartRange === "week" ? 7 : 30;
    if (history.length === 0) {
      // Demo data when no history
      return chartRange === "week"
        ? [3200, 5600, 8100, 4500, 9200, 7800, todaySteps || 6500]
        : Array.from({ length: 30 }, () => Math.floor(Math.random() * 10000) + 2000);
    }
    const last = history.slice(-count);
    return last.map((r) => r.steps);
  }, [history, chartRange, todaySteps]);

  const chartLabels = useMemo(() => {
    if (chartRange === "week") return DAYS_LABEL_7;
    return Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? `${i + 1}` : ""));
  }, [chartRange]);

  const goalPresets = [5000, 8000, 10000, 12000, 15000];

  return (
    <ScreenWrapper>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Steps</Text>
        <TouchableOpacity style={styles.goalBadge} onPress={() => setShowGoalModal(true)}>
          <Text style={styles.goalBadgeText}>🎯 {dailyStepGoal.toLocaleString()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Hero Ring */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
        <AnimatedRing
          progress={progress}
          size={180}
          strokeWidth={12}
          color={theme.colors.chartCyan}
        >
          <Text style={styles.heroValue}>{todaySteps.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>STEPS TODAY</Text>
          <Text style={styles.heroGoal}>
            {Math.round(progress * 100)}% of {dailyStepGoal.toLocaleString()}
          </Text>
        </AnimatedRing>
      </Animated.View>

      {/* Chart */}
      <HealthChart
        data={chartData}
        labels={chartLabels}
        color={theme.colors.chartCyan}
        title="STEP HISTORY"
        unit="steps"
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      {/* Daily Log */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <GlassCard glowColor={theme.colors.chartCyan} style={styles.logCard}>
          <Text style={styles.sectionLabel}>RECENT LOG</Text>
          {(history.length > 0 ? history.slice(-7).reverse() : demoLog()).map((record, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: array is static
            <View key={i} style={styles.logRow}>
              <Text style={styles.logDate}>{formatDate(record.date)}</Text>
              <View style={styles.logBarContainer}>
                <View
                  style={[
                    styles.logBar,
                    {
                      width: `${Math.min((record.steps / dailyStepGoal) * 100, 100)}%`,
                      backgroundColor:
                        record.steps >= dailyStepGoal
                          ? theme.colors.success
                          : theme.colors.chartCyan,
                    },
                  ]}
                />
              </View>
              <Text style={styles.logSteps}>{record.steps.toLocaleString()}</Text>
            </View>
          ))}
        </GlassCard>
      </Animated.View>

      {/* Goal Setter Modal */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard glowColor={theme.colors.primary} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Daily Step Goal</Text>
            <View style={styles.goalPresets}>
              {goalPresets.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetBtn,
                    tempGoal === preset && {
                      backgroundColor: theme.colors.primaryGlow,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setTempGoal(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      tempGoal === preset && { color: theme.colors.primary },
                    ]}
                  >
                    {preset.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedGoal}>{tempGoal.toLocaleString()} steps/day</Text>
            <NeoButton
              title="SET GOAL"
              onPress={() => {
                dispatch(setDailyStepGoal(tempGoal));
                setShowGoalModal(false);
              }}
              color={theme.colors.primary}
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

// Helpers
function demoLog() {
  const days = ["Today", "Yesterday", "2d ago", "3d ago", "4d ago", "5d ago", "6d ago"];
  const steps = [6500, 8200, 3400, 11000, 7600, 9100, 5800];
  return days.map((d, i) => ({ date: d, steps: steps[i], calories: 0, distanceKm: 0 }));
}

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
    borderColor: `${theme.colors.primary}40`,
  },
  goalBadgeText: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.primary,
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
    color: theme.colors.chartCyan,
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
