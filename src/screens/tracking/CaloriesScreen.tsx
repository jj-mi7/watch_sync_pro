import { GlassCard } from "@/components/cards/GlassCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Colors, Spacing, Typography } from "@/constants";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSelector } from "react-redux";

const DAYS_LABEL_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const CaloriesScreen: React.FC = () => {
  const { todayCalories, history } = useSelector((state: RootState) => state.health);
  const { dailyCalorieGoal } = useSelector((state: RootState) => state.settings);
  const [chartRange, setChartRange] = useState<"week" | "month">("week");

  const progress = dailyCalorieGoal > 0 ? todayCalories / dailyCalorieGoal : 0;

  const chartData = useMemo(() => {
    const count = chartRange === "week" ? 7 : 30;
    if (history.length === 0) {
      return chartRange === "week"
        ? [128, 224, 324, 180, 368, 312, todayCalories || 260]
        : Array.from({ length: 30 }, () => Math.floor(Math.random() * 400) + 80);
    }
    return history.slice(-count).map((r) => r.calories);
  }, [history, chartRange, todayCalories]);

  const chartLabels = useMemo(() => {
    if (chartRange === "week") return DAYS_LABEL_7;
    return Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? `${i + 1}` : ""));
  }, [chartRange]);

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Calories</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
        <AnimatedRing progress={progress} size={180} strokeWidth={12} color={Colors.chartPurple}>
          <Text style={styles.heroValue}>{todayCalories}</Text>
          <Text style={styles.heroLabel}>KCAL BURNED</Text>
          <Text style={styles.heroGoal}>
            {Math.round(progress * 100)}% of {dailyCalorieGoal}
          </Text>
        </AnimatedRing>
      </Animated.View>

      <HealthChart
        data={chartData}
        labels={chartLabels}
        color={Colors.chartPurple}
        title="CALORIE HISTORY"
        unit="cal"
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard glowColor={Colors.chartPurple} style={styles.infoCard}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          <Text style={styles.infoText}>
            Calories are estimated from your step count using average metabolic equivalents. For
            more accurate tracking, input your weight in Settings.
          </Text>
          <View style={styles.formulaRow}>
            <Text style={styles.formulaText}>Steps × 0.04 ≈ Calories</Text>
          </View>
        </GlassCard>
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
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
    color: Colors.chartPurple,
    fontSize: 10,
    marginTop: 2,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  infoCard: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textTertiary,
    fontSize: 13,
    lineHeight: 20,
  },
  formulaRow: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  formulaText: {
    ...Typography.mono,
    color: Colors.chartPurple,
    fontSize: 12,
  },
});
