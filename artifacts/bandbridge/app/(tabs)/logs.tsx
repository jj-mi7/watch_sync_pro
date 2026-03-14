import { Calendar, Check, Flame, Footprints, Route } from 'lucide-react-native';
import React, { useState } from 'react';
import type { DailyStats as DailyStatsType } from '@/context/AppContext';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { NeoCard } from '@/components/ui/NeoCard';
import { StepsChart } from '@/components/StepsChart';
import { useApp } from '@/context/AppContext';

type MetricTab = 'steps' | 'calories' | 'km';

type MetricConfig = {
  key: MetricTab;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
};

const METRIC_TABS: MetricConfig[] = [
  { key: 'steps', label: 'Steps', Icon: Footprints, color: Colors.neon },
  { key: 'calories', label: 'Calories', Icon: Flame, color: Colors.amber },
  { key: 'km', label: 'Distance', Icon: Route, color: Colors.accent },
];

export default function LogsScreen() {
  const insets = useSafeAreaInsets();
  const { dailyStats, todayStats } = useApp();
  const [activeMetric, setActiveMetric] = useState<MetricTab>('steps');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const allStats = [...dailyStats];
  if (!allStats.find(s => s.date === todayStats.date)) {
    allStats.push(todayStats);
  }

  const last7 = [...allStats].sort((a, b) => a.date.localeCompare(b.date)).slice(-7).reverse();

  const activeConfig = METRIC_TABS.find(t => t.key === activeMetric)!;

  const totalSteps = allStats.reduce((sum, s) => sum + s.steps, 0);
  const totalCals = allStats.reduce((sum, s) => sum + s.calories, 0);
  const totalKm = allStats.reduce((sum, s) => sum + s.km, 0);
  const avgSteps = allStats.length > 0 ? Math.round(totalSteps / allStats.length) : 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={styles.title}>Activity Logs</Text>
          <Text style={styles.subtitle}>Last 30 days of data</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.summaryRow}>
          <SummaryPill label="Avg Steps" value={avgSteps.toLocaleString()} color={Colors.neon} />
          <SummaryPill label="Total km" value={totalKm.toFixed(1)} color={Colors.accent} />
          <SummaryPill label="Kcal" value={Math.round(totalCals).toLocaleString()} color={Colors.amber} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <NeoCard accent={activeMetric === 'steps' ? 'neon' : activeMetric === 'calories' ? 'amber' : 'accent'} style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: activeConfig.color }]}>{activeConfig.label}</Text>
              <Text style={styles.chartSubtitle}>Last 7 days</Text>
            </View>

            <View style={styles.metricTabs}>
              {METRIC_TABS.map(tab => (
                <Pressable
                  key={tab.key}
                  style={[styles.metricTab, activeMetric === tab.key && { backgroundColor: tab.color + '20', borderColor: tab.color }]}
                  onPress={() => setActiveMetric(tab.key)}
                >
                  <tab.Icon
                    size={14}
                    color={activeMetric === tab.key ? tab.color : Colors.textMuted}
                  />
                  <Text style={[styles.metricTabText, activeMetric === tab.key && { color: tab.color }]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <StepsChart stats={allStats} metric={activeMetric} />
          </NeoCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text style={styles.sectionTitle}>Daily History</Text>
          {last7.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Calendar size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No history yet. Sync your watch to log activity.</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {last7.map((stat, i) => (
                <Animated.View key={stat.date} entering={FadeInDown.delay(200 + i * 40).springify()}>
                  <HistoryRow stat={stat} />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function SummaryPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.summaryPill, { borderColor: color + '40', backgroundColor: color + '10' }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function HistoryRow({ stat }: { stat: DailyStatsType }) {
  const progress = stat.goal > 0 ? Math.min(stat.steps / stat.goal, 1) : 0;
  const d = new Date(stat.date);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  const isGoalMet = stat.steps >= stat.goal;

  return (
    <View style={styles.historyRow}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyDate}>{dateStr}</Text>
        <View style={styles.historyProgressBar}>
          <View style={[styles.historyProgressFill, { width: `${progress * 100}%`, backgroundColor: isGoalMet ? Colors.neon : Colors.accent }]} />
        </View>
      </View>
      <View style={styles.historyRight}>
        <Text style={[styles.historySteps, { color: isGoalMet ? Colors.neon : Colors.textPrimary }]}>
          {stat.steps.toLocaleString()}
        </Text>
        <Text style={styles.historyMeta}>{stat.km.toFixed(2)}km · {Math.round(stat.calories)}kcal</Text>
      </View>
      {isGoalMet && (
        <View style={styles.goalBadge}>
          <Check size={10} color={Colors.bg} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    gap: 2,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  chartCard: {
    padding: 16,
    gap: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  chartSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
  },
  metricTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  metricTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  metricTabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: -6,
  },
  emptyHistory: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  historyList: {
    gap: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  historyLeft: {
    flex: 1,
    gap: 8,
  },
  historyDate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  historyProgressBar: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  historyProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historySteps: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  historyMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
  goalBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
