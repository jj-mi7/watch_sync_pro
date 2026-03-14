import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Zap, Thermometer, Map, Heart, Target, Settings, RefreshCw, MapPin, ChevronRight, Flame, Award, TrendingUp, Activity } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessContext";
import { useBle } from "@/context/BleContext";
import { useAuth } from "@/lib/auth";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };

function RingProgress({ value, goal, color, size = 110 }: { value: number; goal: number; color: string; size?: number }) {
  const pct = Math.min(value / goal, 1);
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: stroke, borderColor: `${color}22` }]} />
      {pct > 0 && (
        <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: stroke, borderColor: color, opacity: Math.min(pct + 0.2, 1) }]} />
      )}
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: C.text, fontFamily: F.bold, fontSize: size * 0.22, lineHeight: size * 0.24 }}>
          {Math.round(pct * 100)}%
        </Text>
        <Text style={{ color: C.textMuted, fontFamily: F.regular, fontSize: 10 }}>of goal</Text>
      </View>
    </View>
  );
}

function MetricCard({ Icon, label, value, unit, color, goal }: {
  Icon: any; label: string; value: number; unit: string; color: string; goal: number;
}) {
  const pct = Math.min(value / goal, 1);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.springify()} style={[animStyle, styles.metricCard]}>
      <TouchableOpacity
        onPress={() => { scale.value = withSpring(0.97, {}, () => { scale.value = withSpring(1); }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        activeOpacity={1}
        style={{ flex: 1 }}
      >
        <View style={styles.metricHeader}>
          <View style={[styles.iconBg, { backgroundColor: `${color}22` }]}>
            <Icon size={16} color={color} strokeWidth={2} />
          </View>
          <Text style={[styles.metricLabel, { color: C.textSecondary }]}>{label}</Text>
        </View>
        <Text style={[styles.metricValue, { color }]}>
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value.toLocaleString()}
          <Text style={styles.metricUnit}> {unit}</Text>
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={styles.metricGoal}>{Math.round(pct * 100)}% of {goal.toLocaleString()}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function BleStatusBadge() {
  const { status, connectedDevice } = useBle();
  const colorMap: Record<string, string> = {
    connected: C.accentGreen, connecting: C.accent, scanning: C.accentBlue,
    disconnected: C.textMuted, error: C.error, idle: C.textMuted, unsupported: C.error,
  };
  const labelMap: Record<string, string> = {
    connected: connectedDevice?.name ?? "Connected", connecting: "Connecting...", scanning: "Scanning...",
    disconnected: "Disconnected", error: "BLE Error", idle: "Tap to Connect", unsupported: "BLE Unavailable",
  };
  const color = colorMap[status] ?? C.textMuted;
  return (
    <TouchableOpacity style={styles.bleBadge} onPress={() => router.push("/connect")}>
      <View style={[styles.bleDot, { backgroundColor: color }]} />
      <Text style={[styles.bleText, { color }]}>{labelMap[status]}</Text>
      <ChevronRight size={14} color={C.textMuted} />
    </TouchableOpacity>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return (
    <View style={styles.streakBadge}>
      <Flame size={14} color="#FF6B35" />
      <Text style={styles.streakText}>{streak} day streak!</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { todaySteps, todayCalories, todayDistanceKm, todayHeartRate, dailyGoal, lastSync, isLoading, refreshLogs, streak } = useFitness();
  const { syncData, status: bleStatus } = useBle();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSync = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSyncing(true);
    await syncData();
    setSyncing(false);
  }, [syncData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLogs();
    setRefreshing(false);
  }, [refreshLogs]);

  if (isLoading) {
    return <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color={C.accent} size="large" /></View>;
  }

  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  const getKmBadge = () => {
    const km = todayDistanceKm;
    if (km >= 10) return { label: "Ultra Walker 🏆", color: C.accentGreen };
    if (km >= 5) return { label: "5K Club", color: C.accent };
    if (km >= 3) return { label: "Active", color: C.accentBlue };
    if (km >= 1) return { label: "Moving", color: C.accentTeal };
    return null;
  };
  const badge = getKmBadge();

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{user?.firstName ?? "Athlete"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/goal")}>
              <Target size={20} color={C.accent} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/settings")}>
              <Settings size={20} color={C.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <BleStatusBadge />
        </View>

        <Animated.View entering={FadeInDown.springify()} style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroDate}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</Text>
            <Text style={styles.heroTitle}>Today</Text>
            <StreakBadge streak={streak} />
            {badge && (
              <View style={[styles.badge, { backgroundColor: `${badge.color}22`, borderColor: `${badge.color}44` }]}>
                <Award size={12} color={badge.color} />
                <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
            )}
            {lastSync && (
              <Text style={styles.syncTime}>Synced {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
            )}
          </View>
          <RingProgress value={todaySteps} goal={dailyGoal.steps} color={C.accent} size={110} />
        </Animated.View>

        <View style={styles.metricsGrid}>
          <MetricCard Icon={Zap} label="Steps" value={todaySteps} unit="steps" color={C.accent} goal={dailyGoal.steps} />
          <MetricCard Icon={Thermometer} label="Calories" value={Math.round(todayCalories)} unit="kcal" color={C.warning} goal={dailyGoal.calories} />
          <MetricCard Icon={Map} label="Distance" value={parseFloat(todayDistanceKm.toFixed(2))} unit="km" color={C.accentTeal} goal={dailyGoal.distanceKm} />
          {todayHeartRate ? <MetricCard Icon={Heart} label="Heart Rate" value={todayHeartRate} unit="bpm" color={C.error} goal={180} /> : null}
        </View>

        <TouchableOpacity
          style={[styles.syncBtn, (syncing || bleStatus !== "connected") && { opacity: 0.6 }]}
          onPress={handleSync}
          disabled={syncing || bleStatus !== "connected"}
        >
          {syncing ? <ActivityIndicator color={C.background} size="small" /> : <RefreshCw size={18} color={C.background} strokeWidth={2.5} />}
          <Text style={styles.syncBtnText}>{syncing ? "Syncing..." : "Sync Watch"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationBtn} onPress={() => router.push("/location")}>
          <MapPin size={16} color={C.accentTeal} strokeWidth={2} />
          <Text style={styles.locationBtnText}>View Location Log</Text>
          <ChevronRight size={16} color={C.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12 },
  greeting: { color: C.textMuted, fontSize: 13, fontFamily: F.regular },
  userName: { color: C.text, fontSize: 26, fontFamily: F.bold, marginTop: 2 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  bleBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.backgroundCard, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  bleDot: { width: 8, height: 8, borderRadius: 4 },
  bleText: { flex: 1, fontFamily: F.medium, fontSize: 13 },
  heroCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: C.borderGlow, marginBottom: 16 },
  heroLeft: { flex: 1, gap: 6 },
  heroDate: { color: C.textMuted, fontFamily: F.regular, fontSize: 12 },
  heroTitle: { color: C.text, fontFamily: F.bold, fontSize: 30 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  streakText: { color: "#FF6B35", fontFamily: F.semibold, fontSize: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, alignSelf: "flex-start" },
  badgeText: { fontFamily: F.semibold, fontSize: 12 },
  syncTime: { color: C.textMuted, fontFamily: F.regular, fontSize: 11 },
  metricsGrid: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  metricCard: { backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  metricHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  iconBg: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  metricLabel: { fontFamily: F.medium, fontSize: 13, flex: 1 },
  metricValue: { fontFamily: F.bold, fontSize: 32, marginBottom: 10 },
  metricUnit: { fontFamily: F.regular, fontSize: 16, color: C.textSecondary },
  progressBar: { height: 4, backgroundColor: C.border, borderRadius: 2, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", borderRadius: 2 },
  metricGoal: { color: C.textMuted, fontFamily: F.regular, fontSize: 11 },
  syncBtn: { marginHorizontal: 20, backgroundColor: C.accent, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, marginBottom: 12 },
  syncBtnText: { color: C.background, fontFamily: F.bold, fontSize: 16 },
  locationBtn: { marginHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.backgroundCard, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: C.border },
  locationBtnText: { flex: 1, color: C.text, fontFamily: F.medium, fontSize: 14 },
});
