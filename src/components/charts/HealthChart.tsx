import React, { useMemo } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface HealthChartProps {
  data: number[];
  labels: string[];
  color?: string;
  title: string;
  unit: string;
  activeRange: "week" | "month";
  onRangeChange?: (range: "week" | "month") => void;
}

export const HealthChart: React.FC<HealthChartProps> = ({
  data,
  labels,
  color,
  title,
  unit,
  activeRange,
  onRangeChange,
}) => {
  const { theme } = useUnistyles();
  const activeColor = color || theme.colors.chartCyan;

  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 160;
  const barPadding = 4;

  const maxVal = useMemo(() => Math.max(...data, 1), [data]);
  const barWidth = useMemo(
    () => (chartWidth - barPadding * (data.length + 1)) / data.length,
    [data.length, chartWidth],
  );

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rangeToggle}>
          {(["week", "month"] as const).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => onRangeChange?.(range)}
              style={[
                styles.rangeBtn,
                activeRange === range && { backgroundColor: `${activeColor}30` },
              ]}
            >
              <Text style={[styles.rangeText, activeRange === range && { color: activeColor }]}>
                {range === "week" ? "7D" : "30D"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight + 24}>
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <Line
              key={pct}
              x1={0}
              y1={chartHeight * (1 - pct)}
              x2={chartWidth}
              y2={chartHeight * (1 - pct)}
              stroke={theme.colors.surfaceLight}
              strokeWidth={0.5}
              strokeDasharray="4,4"
            />
          ))}

          {/* Bars */}
          {data.map((value, i) => {
            const barHeight = (value / maxVal) * (chartHeight - 8);
            const x = barPadding + i * (barWidth + barPadding);
            const y = chartHeight - barHeight;

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: order and length are static per duration
              <React.Fragment key={i}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={barWidth / 2 > 6 ? 6 : barWidth / 2}
                  fill={activeColor}
                  opacity={0.85}
                />
                {/* Label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  fill={theme.colors.textTertiary}
                  fontSize={theme.fontSize.xs}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {labels[i] || ""}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TOTAL</Text>
          <Text style={[styles.summaryValue, { color: activeColor }]}>
            {data.reduce((a, b) => a + b, 0).toLocaleString()} {unit}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>AVG</Text>
          <Text style={[styles.summaryValue, { color: activeColor }]}>
            {data.length > 0
              ? Math.round(data.reduce((a, b) => a + b, 0) / data.length).toLocaleString()
              : 0}{" "}
            {unit}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>BEST</Text>
          <Text style={[styles.summaryValue, { color: activeColor }]}>
            {Math.max(...data, 0).toLocaleString()} {unit}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  rangeToggle: {
    flexDirection: "row",
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    padding: 2,
  },
  rangeBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm - 2,
  },
  rangeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    fontWeight: "600",
    letterSpacing: 1,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: theme.fontSize.caption,
    fontWeight: "800",
  },
}));
