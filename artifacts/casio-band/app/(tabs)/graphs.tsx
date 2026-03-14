import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Zap, Thermometer, Map, TrendingUp } from "lucide-react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessContext";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };
const SCREEN_W = Dimensions.get("window").width;
type Tab = "steps" | "calories" | "distance";

const TAB_LABELS: { key: Tab; label: string; color: string; Icon: any }[] = [
  { key: "steps", label: "Steps", color: C.accent, Icon: Zap },
  { key: "calories", label: "Calories", color: C.warning, Icon: Thermometer },
  { key: "distance", label: "Distance", color: C.accentTeal, Icon: Map },
];

const chartConfig = (color: string) => ({
  backgroundColor: C.backgroundCard, backgroundGradientFrom: C.backgroundCard, backgroundGradientTo: C.backgroundCard,
  decimalPlaces: 0,
  color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
  labelColor: () => C.textSecondary,
  style: { borderRadius: 16 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: color },
  propsForBackgroundLines: { stroke: C.border, strokeWidth: 1 },
  propsForLabels: { fontFamily: F.medium },
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

export default function GraphsScreen() {
  const insets = useSafeAreaInsets();
  const { activityLogs, dailyGoal } = useFitness();
  const [activeTab, setActiveTab] = useState<Tab>("steps");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const last7 = activityLogs.slice(0, 7).reverse();
  const last30 = activityLogs.slice(0, 30);

  const getLabels = () => last7.map(l => new Date(l.date).toLocaleDateString("en", { weekday: "short" }).slice(0, 3));
  const getData = (tab: Tab) => last7.map(l => tab === "steps" ? l.steps : tab === "calories" ? Math.round(l.calories) : parseFloat(l.distanceKm.toFixed(1)));

  const activeConfig = TAB_LABELS.find(t => t.key === activeTab)!;
  const data = getData(activeTab);
  const labels = getLabels();
  const hasData = last7.length > 0;

  const avg30Steps = last30.length > 0 ? Math.round(last30.reduce((s, l) => s + l.steps, 0) / last30.length) : 0;
  const avg30Cal = last30.length > 0 ? Math.round(last30.reduce((s, l) => s + l.calories, 0) / last30.length) : 0;
  const avg30Km = last30.length > 0 ? (last30.reduce((s, l) => s + l.distanceKm, 0) / last30.length).toFixed(1) : "0";
  const totalKm = last30.reduce((s, l) => s + l.distanceKm, 0).toFixed(1);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity Graphs</Text>
          <Text style={styles.subtitle}>Last 7 days overview</Text>
        </View>

        <View style={styles.tabRow}>
          {TAB_LABELS.map(tab => (
            <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && { backgroundColor: `${tab.color}22`, borderColor: tab.color }]} onPress={() => setActiveTab(tab.key)}>
              <tab.Icon size={14} color={activeTab === tab.key ? tab.color : C.textMuted} strokeWidth={2} />
              <Text style={[styles.tabText, activeTab === tab.key && { color: tab.color }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {hasData ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.chartCard}>
            <Text style={styles.chartTitle}>{activeConfig.label} — 7 Days</Text>
            <LineChart
              data={{ labels: labels.length > 0 ? labels : ["—"], datasets: [{ data: data.length > 0 ? data : [0] }] }}
              width={SCREEN_W - 40} height={200}
              chartConfig={chartConfig(activeConfig.color)} bezier
              style={{ borderRadius: 12, marginLeft: -16 }}
              withInnerLines withOuterLines={false} withVerticalLines={false}
            />
          </Animated.View>
        ) : (
          <View style={styles.emptyChart}>
            <TrendingUp size={40} color={C.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No data yet</Text>
            <Text style={styles.emptySubtext}>Sync your watch to see graphs</Text>
          </View>
        )}

        {hasData && (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.chartCard}>
            <Text style={styles.chartTitle}>Goal Progress — 7 Days</Text>
            <BarChart
              data={{ labels, datasets: [{ data: last7.map(l => Math.min(l.steps / dailyGoal.steps * 100, 100)) }] }}
              width={SCREEN_W - 40} height={180}
              chartConfig={chartConfig(C.accentBlue)}
              style={{ borderRadius: 12, marginLeft: -16 }}
              fromZero showValuesOnTopOfBars={false} yAxisSuffix="%" yAxisLabel="" withInnerLines
            />
          </Animated.View>
        )}

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>30-Day Summary</Text></View>
        <View style={styles.summaryGrid}>
          <SummaryCard Icon={Zap} label="Avg Steps" value={avg30Steps.toLocaleString()} unit="/ day" color={C.accent} />
          <SummaryCard Icon={Thermometer} label="Avg Cal" value={avg30Cal.toString()} unit="kcal" color={C.warning} />
          <SummaryCard Icon={Map} label="Avg Dist" value={avg30Km} unit="km" color={C.accentTeal} />
          <SummaryCard Icon={TrendingUp} label="Total KM" value={totalKm} unit="km" color={C.accentGreen} />
        </View>

        {activityLogs.length > 0 && (
          <>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent Activity</Text></View>
            <View style={styles.logTable}>
              <View style={styles.logHeader}>
                <Text style={[styles.logCell, styles.logHeaderText, { flex: 2 }]}>Date</Text>
                <Text style={[styles.logCell, styles.logHeaderText]}>Steps</Text>
                <Text style={[styles.logCell, styles.logHeaderText]}>kcal</Text>
                <Text style={[styles.logCell, styles.logHeaderText]}>km</Text>
              </View>
              {activityLogs.slice(0, 14).map(log => (
                <View key={log.id} style={styles.logRow}>
                  <Text style={[styles.logCell, { flex: 2, color: C.textSecondary, fontFamily: F.regular, fontSize: 12 }]}>{new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
                  <Text style={[styles.logCell, { color: C.accent }]}>{log.steps.toLocaleString()}</Text>
                  <Text style={[styles.logCell, { color: C.warning }]}>{Math.round(log.calories)}</Text>
                  <Text style={[styles.logCell, { color: C.accentTeal }]}>{log.distanceKm.toFixed(1)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { color: C.text, fontSize: 28, fontFamily: F.bold },
  subtitle: { color: C.textMuted, fontSize: 14, fontFamily: F.regular, marginTop: 4 },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.backgroundCard },
  tabText: { fontFamily: F.medium, fontSize: 12, color: C.textMuted },
  chartCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  chartTitle: { color: C.textSecondary, fontFamily: F.medium, fontSize: 13, marginBottom: 12 },
  emptyChart: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 20, padding: 40, alignItems: "center", gap: 10, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  emptyText: { color: C.text, fontFamily: F.semibold, fontSize: 16 },
  emptySubtext: { color: C.textMuted, fontFamily: F.regular, fontSize: 13 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { color: C.text, fontFamily: F.semibold, fontSize: 17 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  summaryCard: { width: "47%", backgroundColor: C.backgroundCard, borderRadius: 16, padding: 14, borderWidth: 1, gap: 4 },
  summaryIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  summaryLabel: { color: C.textMuted, fontFamily: F.regular, fontSize: 12 },
  summaryValue: { fontFamily: F.bold, fontSize: 22 },
  summaryUnit: { color: C.textMuted, fontFamily: F.regular, fontSize: 12 },
  logTable: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  logHeader: { flexDirection: "row", backgroundColor: C.backgroundElevated, paddingHorizontal: 12, paddingVertical: 8 },
  logHeaderText: { color: C.textMuted, fontFamily: F.semibold, fontSize: 12 },
  logRow: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border },
  logCell: { flex: 1, fontFamily: F.medium, fontSize: 13 },
});
