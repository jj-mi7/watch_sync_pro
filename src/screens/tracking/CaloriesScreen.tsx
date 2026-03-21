import { GlassCard } from "@/components/cards/GlassCard";
import { HealthChart } from "@/components/charts/HealthChart";
import { AnimatedRing } from "@/components/common/AnimatedRing";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSelector } from "react-redux";

const DAYS_LABEL_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const CaloriesScreen: React.FC = () => {
  const { theme } = useUnistyles();
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
        <AnimatedRing
          progress={progress}
          size={180}
          strokeWidth={12}
          color={theme.colors.chartPurple}
        >
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
        color={theme.colors.chartPurple}
        title="CALORIE HISTORY"
        unit="cal"
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard glowColor={theme.colors.chartPurple} style={styles.infoCard}>
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

const styles = StyleSheet.create((theme) => ({
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
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
    color: theme.colors.chartPurple,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  infoCard: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  infoText: {
    fontSize: theme.fontSize.body,
    fontWeight: "400",
    color: theme.colors.textTertiary,
    lineHeight: 20,
  },
  formulaRow: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceLight,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  formulaText: {
    fontFamily: "SpaceMono", // Assuming global generic if mono not loaded, or system mono
    color: theme.colors.chartPurple,
    fontSize: 12,
  },
}));
