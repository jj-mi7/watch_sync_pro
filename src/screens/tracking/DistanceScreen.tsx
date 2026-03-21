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

export const DistanceScreen: React.FC = () => {
  const { todayDistanceKm, history } = useSelector((state: RootState) => state.health);
  const { dailyDistanceGoalKm, units } = useSelector((state: RootState) => state.settings);
  const [chartRange, setChartRange] = useState<"week" | "month">("week");

  const displayDistance = units === "imperial" ? todayDistanceKm * 0.621371 : todayDistanceKm;
  const displayGoal = units === "imperial" ? dailyDistanceGoalKm * 0.621371 : dailyDistanceGoalKm;
  const unitLabel = units === "imperial" ? "mi" : "km";

  const progress = dailyDistanceGoalKm > 0 ? todayDistanceKm / dailyDistanceGoalKm : 0;

  const chartData = useMemo(() => {
    const count = chartRange === "week" ? 7 : 30;
    if (history.length === 0) {
      return chartRange === "week"
        ? [2.2, 3.9, 5.7, 3.2, 6.4, 5.5, todayDistanceKm || 4.6]
        : Array.from({ length: 30 }, () => Number.parseFloat((Math.random() * 7 + 1).toFixed(1)));
    }
    return history
      .slice(-count)
      .map((r) =>
        units === "imperial"
          ? Number.parseFloat((r.distanceKm * 0.621371).toFixed(1))
          : r.distanceKm,
      );
  }, [history, chartRange, todayDistanceKm, units]);

  const chartLabels = useMemo(() => {
    if (chartRange === "week") return DAYS_LABEL_7;
    return Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? `${i + 1}` : ""));
  }, [chartRange]);

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Distance</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
        <AnimatedRing progress={progress} size={180} strokeWidth={12} color={Colors.chartGreen}>
          <Text style={styles.heroValue}>{displayDistance.toFixed(1)}</Text>
          <Text style={styles.heroLabel}>{unitLabel.toUpperCase()} WALKED</Text>
          <Text style={styles.heroGoal}>
            {Math.round(progress * 100)}% of {displayGoal.toFixed(1)} {unitLabel}
          </Text>
        </AnimatedRing>
      </Animated.View>

      <HealthChart
        data={chartData}
        labels={chartLabels}
        color={Colors.chartGreen}
        title="DISTANCE HISTORY"
        unit={unitLabel}
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard glowColor={Colors.chartGreen} style={styles.infoCard}>
          <Text style={styles.sectionLabel}>DISTANCE BREAKDOWN</Text>
          <View style={styles.breakdownRow}>
            <BreakdownItem label="AVG STRIDE" value="~70 cm" />
            <BreakdownItem label="CONVERSION" value="Steps × 0.7m" />
            <BreakdownItem label="UNIT" value={units === "metric" ? "Kilometers" : "Miles"} />
          </View>
        </GlassCard>
      </Animated.View>
    </ScreenWrapper>
  );
};

const BreakdownItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.breakdownItem}>
    <Text style={styles.breakdownLabel}>{label}</Text>
    <Text style={styles.breakdownValue}>{value}</Text>
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
    color: Colors.chartGreen,
    fontSize: 10,
    marginTop: 2,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  infoCard: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownItem: {
    alignItems: "center",
    flex: 1,
  },
  breakdownLabel: {
    ...Typography.label,
    color: Colors.textTertiary,
    fontSize: 9,
    marginBottom: 4,
  },
  breakdownValue: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
});
