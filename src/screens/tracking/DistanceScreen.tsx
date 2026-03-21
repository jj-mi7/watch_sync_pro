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

export const DistanceScreen: React.FC = () => {
  const { theme } = useUnistyles();
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
        <AnimatedRing
          progress={progress}
          size={180}
          strokeWidth={12}
          color={theme.colors.chartGreen}
        >
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
        color={theme.colors.chartGreen}
        title="DISTANCE HISTORY"
        unit={unitLabel}
        activeRange={chartRange}
        onRangeChange={setChartRange}
      />

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard glowColor={theme.colors.chartGreen} style={styles.infoCard}>
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

const BreakdownItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const { theme } = useUnistyles();
  return (
    <View style={styles.breakdownItem}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{value}</Text>
    </View>
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
    color: theme.colors.chartGreen,
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
  infoCard: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
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
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
}));
