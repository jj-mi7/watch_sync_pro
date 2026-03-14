import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Zap, Thermometer, Map, TrendingUp } from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';
import { useFitness } from '@/context/FitnessContext';

const C = Colors.dark;
const SCREEN_W = Dimensions.get('window').width;
type Tab = 'steps' | 'calories' | 'distance';

const TABS: { key: Tab; label: string; color: string; Icon: any }[] = [
  { key: 'steps', label: 'Steps', color: C.accent, Icon: Zap },
  { key: 'calories', label: 'Calories', color: C.warning, Icon: Thermometer },
  { key: 'distance', label: 'Distance', color: C.accentTeal, Icon: Map },
];

const chartConfig = (color: string) => ({
  backgroundColor: C.backgroundCard,
  backgroundGradientFrom: C.backgroundCard,
  backgroundGradientTo: C.backgroundCard,
  decimalPlaces: 0,
  color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  labelColor: () => C.textSecondary,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: color },
  propsForBackgroundLines: { stroke: C.border, strokeWidth: 1 },
});

function SummaryCard({ Icon, label, value, unit, color }: { Icon: any; label: string; value: string; unit: string; color: string }) {
  return (
    <View style={[styles.summaryCard, { borderColor: `${color}44` }]}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}22` }]}>
        <Icon size={16} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryUnit}>{unit}</Text>
    </View>
  );
}

export function GraphsScreen() {
  const insets = useSafeAreaInsets();
  const { activityLogs, dailyGoal } = useFitness();
  const [activeTab, setActiveTab] = useState<Tab>('steps');
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 4;

  const last7 = activityLogs.slice(0, 7).reverse();
  const last30 = activityLogs.slice(0, 30);

  const getLabels = () => last7.map(l => new Date(l.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 3));
  const getData = (tab: Tab) => last7.map(l =>
    tab === 'steps' ? l.steps : tab === 'calories' ? Math.round(l.calories) : parseFloat(l.distanceKm.toFixed(1))
  );

  const activeConfig = TABS.find(t => t.key === activeTab)!;
  const data = getData(activeTab);
  const labels = getLabels();
  const hasData = last7.length > 0;

  const avg30Steps = last30.length > 0 ? Math.round(last30.reduce((s, l) => s + l.steps, 0) / last30.length) : 0;
  const avg30Cal = last30.length > 0 ? Math.round(last30.reduce((s, l) => s + l.calories, 0) / last30.length) : 0;
  const avg30Km = last30.length > 0 ? (last30.reduce((s, l) => s + l.distanceKm, 0) / last30.length).toFixed(1) : '0';
  const totalKm = last30.reduce((s, l) => s + l.distanceKm, 0).toFixed(1);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={styles.title}>Activity Graphs</Text>
          <Text style={styles.subtitle}>Last 7 days overview</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && { backgroundColor: `${tab.color}22`, borderColor: `${tab.color}66` }]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <tab.Icon size={14} color={activeTab === tab.key ? tab.color : C.textMuted} strokeWidth={2} />
              <Text style={[styles.tabLabel, { color: activeTab === tab.key ? tab.color : C.textMuted }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.chartCard}>
          {hasData ? (
            <LineChart
              data={{ labels, datasets: [{ data: data.length > 0 ? data : [0] }] }}
              width={SCREEN_W - 40}
              height={180}
              chartConfig={chartConfig(activeConfig.color)}
              bezier
              style={{ borderRadius: 12, marginHorizontal: -8 }}
            />
          ) : (
            <View style={styles.noData}>
              <TrendingUp size={32} color={C.textMuted} strokeWidth={1.5} />
              <Text style={styles.noDataText}>No activity data yet. Sync your watch to see graphs.</Text>
            </View>
          )}
        </Animated.View>

        {hasData && (
          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.barCard}>
            <Text style={styles.cardTitle}>DAILY COMPARISON</Text>
            <BarChart
              data={{ labels, datasets: [{ data: data.length > 0 ? data : [0] }] }}
              width={SCREEN_W - 40}
              height={160}
              chartConfig={chartConfig(activeConfig.color)}
              style={{ borderRadius: 12, marginHorizontal: -8 }}
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.summarySection}>
          <Text style={styles.sectionTitle}>30-DAY AVERAGES</Text>
          <View style={styles.summaryRow}>
            <SummaryCard Icon={Zap} label="Steps" value={avg30Steps.toLocaleString()} unit="/day" color={C.accent} />
            <SummaryCard Icon={Thermometer} label="Calories" value={avg30Cal.toString()} unit="kcal/day" color={C.warning} />
          </View>
          <View style={styles.summaryRow}>
            <SummaryCard Icon={Map} label="Avg Dist" value={avg30Km} unit="km/day" color={C.accentTeal} />
            <SummaryCard Icon={TrendingUp} label="Total Dist" value={totalKm} unit="km" color={C.accentBlue} />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { color: C.text, ...F.bold, fontSize: 26 },
  subtitle: { color: C.textMuted, ...F.regular, fontSize: 13, marginTop: 4 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 12, backgroundColor: C.backgroundCard, borderWidth: 1, borderColor: C.border },
  tabLabel: { ...F.semibold, fontSize: 13 },
  chartCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.borderGlow, marginBottom: 12 },
  barCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  cardTitle: { color: C.textSecondary, ...F.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  noData: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noDataText: { color: C.textMuted, ...F.regular, fontSize: 13, textAlign: 'center' },
  summarySection: { paddingHorizontal: 20 },
  sectionTitle: { color: C.textMuted, ...F.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  summaryCard: { flex: 1, backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  summaryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  summaryLabel: { color: C.textMuted, ...F.regular, fontSize: 11 },
  summaryValue: { ...F.bold, fontSize: 20 },
  summaryUnit: { color: C.textMuted, ...F.regular, fontSize: 11 },
});
