import { GlassCard } from "@/components/cards/GlassCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { setDailyStepGoal } from "@/redux/slices/settingsSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

const DAYS_LABEL_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const StepsScreen: React.FC = () => {
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
        <AnimatedRing progress={progress} size={180} strokeWidth={12} color={Colors.chartCyan}>
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
        color={Colors.chartCyan}
        title="STEP HISTORY"
        unit="steps"
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      {/* Daily Log */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <GlassCard glowColor={Colors.chartCyan} style={styles.logCard}>
          <Text style={styles.sectionLabel}>RECENT LOG</Text>
          {(history.length > 0 ? history.slice(-7).reverse() : demoLog()).map((record, i) => (
            <View key={i} style={styles.logRow}>
              <Text style={styles.logDate}>{formatDate(record.date)}</Text>
              <View style={styles.logBarContainer}>
                <View
                  style={[
                    styles.logBar,
                    {
                      width: `${Math.min((record.steps / dailyStepGoal) * 100, 100)}%`,
                      backgroundColor:
                        record.steps >= dailyStepGoal ? Colors.success : Colors.chartCyan,
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
          <GlassCard glowColor={Colors.primary} style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Daily Step Goal</Text>
            <View style={styles.goalPresets}>
              {goalPresets.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetBtn,
                    tempGoal === preset && {
                      backgroundColor: Colors.primaryGlow,
                      borderColor: Colors.primary,
                    },
                  ]}
                  onPress={() => setTempGoal(preset)}
                >
                  <Text
                    style={[styles.presetText, tempGoal === preset && { color: Colors.primary }]}
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
              color={Colors.primary}
              size="md"
              style={{ marginTop: Spacing.lg }}
            />
            <NeoButton
              title="CANCEL"
              onPress={() => setShowGoalModal(false)}
              variant="ghost"
              color={Colors.textTertiary}
              size="sm"
              style={{ marginTop: Spacing.sm }}
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

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  goalBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  goalBadgeText: {
    ...Typography.label,
    color: Colors.primary,
    fontSize: 10,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  heroValue: {
    ...Typography.hero,
    color: Colors.textPrimary,
    fontSize: 32,
  },
  heroLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 9,
    marginTop: -2,
  },
  heroGoal: {
    ...Typography.caption,
    color: Colors.chartCyan,
    fontSize: 10,
    marginTop: 2,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  logCard: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  logDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
    width: 60,
  },
  logBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    marginHorizontal: Spacing.sm,
    overflow: "hidden",
  },
  logBar: {
    height: 6,
    borderRadius: 3,
  },
  logSteps: {
    ...Typography.caption,
    color: Colors.textPrimary,
    width: 52,
    textAlign: "right",
    fontWeight: "700",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
  },
  modalCard: {},
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  goalPresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  presetBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceLight,
  },
  presetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: "700",
  },
  selectedGoal: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: "center",
  },
});
