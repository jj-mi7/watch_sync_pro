import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Rect, Line, Text as SvgText } from "react-native-svg";

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
  color = Colors.chartCyan,
  title,
  unit,
  activeRange,
  onRangeChange,
}) => {
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
              style={[styles.rangeBtn, activeRange === range && { backgroundColor: `${color}30` }]}
            >
              <Text style={[styles.rangeText, activeRange === range && { color }]}>
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
              stroke={Colors.surfaceLight}
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
              <React.Fragment key={i}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={barWidth / 2 > 6 ? 6 : barWidth / 2}
                  fill={color}
                  opacity={0.85}
                />
                {/* Label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  fill={Colors.textTertiary}
                  fontSize={9}
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
          <Text style={[styles.summaryValue, { color }]}>
            {data.reduce((a, b) => a + b, 0).toLocaleString()} {unit}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>AVG</Text>
          <Text style={[styles.summaryValue, { color }]}>
            {data.length > 0
              ? Math.round(data.reduce((a, b) => a + b, 0) / data.length).toLocaleString()
              : 0}{" "}
            {unit}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>BEST</Text>
          <Text style={[styles.summaryValue, { color }]}>
            {Math.max(...data, 0).toLocaleString()} {unit}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  rangeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  rangeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm - 2,
  },
  rangeText: {
    ...Typography.label,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    ...Typography.label,
    fontSize: 9,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  summaryValue: {
    ...Typography.caption,
    fontWeight: "800",
  },
});
