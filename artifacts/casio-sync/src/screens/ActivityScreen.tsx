import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { GlowCard } from '../components/GlowCard';
import { NeoHeader } from '../components/NeoHeader';
import { useStore } from '../store/useStore';
import { Colors, Spacing, Typography } from '../theme';
import { getLast7DaysData } from '../utils/helpers';

const { width } = Dimensions.get('window');

type MetricType = 'steps' | 'calories' | 'km';

const METRICS: { key: MetricType; label: string; color: string; unit: string }[] = [
  { key: 'steps', label: 'Steps', color: Colors.primary, unit: 'steps' },
  { key: 'calories', label: 'Calories', color: Colors.orange, unit: 'kcal' },
  { key: 'km', label: 'Distance', color: Colors.green, unit: 'km' },
];

export const ActivityScreen: React.FC = () => {
  const { activityHistory } = useStore();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('steps');
  const weekData = getLast7DaysData(activityHistory);

  const metric = METRICS.find((m) => m.key === selectedMetric)!;

  const chartValues = weekData.map((d) =>
    selectedMetric === 'steps'
      ? d.steps
      : selectedMetric === 'calories'
        ? d.calories
        : d.km,
  );

  const totalSteps = activityHistory.reduce((s, a) => s + a.steps, 0);
  const totalCals = activityHistory.reduce((s, a) => s + a.calories, 0);
  const totalKm = activityHistory.reduce((s, a) => s + a.distanceKm, 0);
  const avgSteps = activityHistory.length
    ? Math.round(totalSteps / activityHistory.length)
    : 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <NeoHeader title="Activity Log" subtitle={`${activityHistory.length} days tracked`} />

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total Steps', value: totalSteps.toLocaleString(), color: Colors.primary },
          { label: 'Total Cals', value: totalCals.toLocaleString(), color: Colors.orange },
          { label: 'Total KM', value: totalKm.toFixed(1), color: Colors.green },
        ].map((item) => (
          <GlowCard key={item.label} style={styles.summaryCard} glowColor={`${item.color}30`}>
            <Text style={[Typography.h3, { color: item.color }]}>{item.value}</Text>
            <Text style={[Typography.caption, styles.summaryLabel]}>{item.label}</Text>
          </GlowCard>
        ))}
      </View>

      {/* Metric Selector */}
      <View style={styles.metricRow}>
        {METRICS.map((m) => (
          <TouchableOpacity
            key={m.key}
            onPress={() => setSelectedMetric(m.key)}
            style={[
              styles.metricBtn,
              selectedMetric === m.key && { borderColor: m.color, backgroundColor: `${m.color}15` },
            ]}
          >
            <Text
              style={[
                Typography.label,
                { color: selectedMetric === m.key ? m.color : Colors.textMuted },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bar Chart */}
      <GlowCard noPadding glowColor={`${metric.color}20`}>
        <View style={styles.chartHeader}>
          <Text style={[Typography.label, styles.chartTitle]}>
            7-Day {metric.label} ({metric.unit})
          </Text>
        </View>
        <BarChart
          data={{
            labels: weekData.map((d) => d.label),
            datasets: [{ data: chartValues.map((v) => Math.max(v, 0)) }],
          }}
          width={width - Spacing.base * 2 - 2}
          height={200}
          chartConfig={{
            backgroundGradientFrom: Colors.surfaceCard,
            backgroundGradientTo: Colors.surfaceCard,
            color: (opacity = 1) => `${metric.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
            labelColor: () => Colors.textMuted,
            strokeWidth: 2,
            decimalPlaces: selectedMetric === 'km' ? 1 : 0,
            barPercentage: 0.7,
          }}
          style={styles.chart}
          withInnerLines={false}
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
        />
      </GlowCard>

      {/* Daily History List */}
      <GlowCard>
        <Text style={[Typography.label, styles.chartTitle]}>Daily History</Text>
        {activityHistory
          .slice()
          .reverse()
          .slice(0, 14)
          .map((item) => (
            <View key={item.date} style={styles.historyRow}>
              <Text style={[Typography.bodySmall, styles.historyDate]}>{item.date}</Text>
              <View style={styles.historyStats}>
                <Text style={[Typography.bodySmall, { color: Colors.primary }]}>
                  {item.steps.toLocaleString()}
                </Text>
                <Text style={[Typography.bodySmall, { color: Colors.orange }]}>
                  {item.calories} kcal
                </Text>
                <Text style={[Typography.bodySmall, { color: Colors.green }]}>
                  {item.distanceKm.toFixed(2)} km
                </Text>
              </View>
            </View>
          ))}
        {activityHistory.length === 0 && (
          <Text style={[Typography.body, styles.empty]}>
            No activity recorded yet. Sync your device to get started!
          </Text>
        )}
      </GlowCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryCard: { flex: 1, marginBottom: 0 },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  chartHeader: { padding: Spacing.base, paddingBottom: 0 },
  chartTitle: { color: Colors.textSecondary, marginBottom: Spacing.sm },
  chart: { borderRadius: 12 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyDate: { color: Colors.textSecondary },
  historyStats: { flexDirection: 'row', gap: Spacing.md },
  empty: { color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.lg },
});
