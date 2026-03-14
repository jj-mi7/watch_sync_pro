import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  Zap, Map, Heart, Target, Settings, RefreshCw, MapPin,
  ChevronRight, Flame, Award, Activity,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';
import { useFitness } from '@/context/FitnessContext';
import { useBle } from '@/context/BleContext';
import { useAuth } from '@/lib/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

const C = Colors.dark;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function RingProgress({ value, goal, color, size = 110 }: { value: number; goal: number; color: string; size?: number }) {
  const pct = Math.min(value / goal, 1);
  const stroke = 8;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: stroke, borderColor: `${color}22` }]} />
      {pct > 0 && (
        <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, borderWidth: stroke, borderColor: color, opacity: Math.min(pct + 0.2, 1) }]} />
      )}
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color, fontSize: size * 0.22, ...F.bold }}>{Math.round(pct * 100)}%</Text>
        <Text style={{ color: C.textMuted, fontSize: 9, ...F.regular }}>goal</Text>
      </View>
    </View>
  );
}

function MetricCard({ Icon, label, value, unit, color, progress, goal }: {
  Icon: any; label: string; value: string; unit: string; color: string; progress: number; goal: number;
}) {
  const pct = goal > 0 ? Math.min(progress / goal, 1) : 0;
  return (
    <View style={[styles.metricCard, { borderColor: C.border }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.iconBg, { backgroundColor: `${color}22` }]}>
          <Icon size={16} color={color} strokeWidth={2} />
        </View>
        <Text style={[styles.metricLabel, { color: C.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>
        {value}<Text style={styles.metricUnit}> {unit}</Text>
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.metricGoal}>Goal: {goal.toLocaleString()} {unit}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { todaySteps, todayCalories, todayDistanceKm, todayHeartRate, dailyGoal, lastSync, streak } = useFitness();
  const { status, connectedDevice, syncData } = useBle();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 4;
  const syncScale = useSharedValue(1);
  const syncStyle = useAnimatedStyle(() => ({ transform: [{ scale: syncScale.value }] }));

  const handleSync = async () => {
    setSyncing(true);
    syncScale.value = withSpring(0.9, {}, () => { syncScale.value = withSpring(1); });
    const data = await syncData();
    if (data) {
      const { useFitness: useFit } = await import('@/context/FitnessContext');
    }
    setSyncing(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await syncData();
    setRefreshing(false);
  };

  const bleColor = status === 'connected' ? C.accentGreen : status === 'error' ? C.error : C.textMuted;
  const firstName = user?.firstName ?? 'Athlete';
  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Settings')}>
            <Settings size={18} color={C.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <TouchableOpacity style={styles.bleBadge} onPress={() => navigation.navigate('Connect')}>
            <View style={[styles.bleDot, { backgroundColor: bleColor }]} />
            <Text style={[styles.bleText, { color: C.text }]}>
              {status === 'connected' ? connectedDevice?.name ?? 'Watch' : 'Tap to connect watch'}
            </Text>
            <ChevronRight size={16} color={C.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroDate}>{today}</Text>
            <Text style={styles.heroTitle}>{todaySteps.toLocaleString()}</Text>
            <Text style={[styles.heroDate, { marginTop: 2 }]}>steps today</Text>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={14} color={C.warning} />
                <Text style={styles.streakText}>{streak}-day streak</Text>
              </View>
            )}
          </View>
          <RingProgress value={todaySteps} goal={dailyGoal.steps} color={C.accent} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.metricsGrid}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <MetricCard Icon={Zap} label="Calories" value={Math.round(todayCalories).toString()} unit="kcal" color={C.warning} progress={todayCalories} goal={dailyGoal.calories} />
            </View>
            <View style={{ flex: 1 }}>
              <MetricCard Icon={Map} label="Distance" value={todayDistanceKm.toFixed(1)} unit="km" color={C.accentTeal} progress={todayDistanceKm} goal={dailyGoal.distanceKm} />
            </View>
          </View>
          {todayHeartRate != null && (
            <View style={[styles.metricCard, { borderColor: `${C.error}33` }]}>
              <View style={styles.metricHeader}>
                <View style={[styles.iconBg, { backgroundColor: `${C.error}22` }]}>
                  <Heart size={16} color={C.error} strokeWidth={2} />
                </View>
                <Text style={[styles.metricLabel, { color: C.textSecondary }]}>Heart Rate</Text>
              </View>
              <Text style={[styles.metricValue, { color: C.error }]}>{todayHeartRate}<Text style={styles.metricUnit}> bpm</Text></Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()} style={{ paddingHorizontal: 20, gap: 12 }}>
          {lastSync && (
            <View style={styles.syncInfo}>
              <Activity size={14} color={C.textMuted} strokeWidth={2} />
              <Text style={styles.syncTime}>Last sync: {lastSync.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.goalBtn, { borderColor: C.border }]}
            onPress={() => navigation.navigate('Goal')}
          >
            <Target size={18} color={C.accentBlue} strokeWidth={2} />
            <Text style={[styles.goalBtnText, { color: C.text }]}>Edit Daily Goal</Text>
            <ChevronRight size={16} color={C.textMuted} />
          </TouchableOpacity>

          <Animated.View style={syncStyle}>
            <TouchableOpacity
              style={[styles.syncBtn, (syncing || status !== 'connected') && { opacity: 0.6 }]}
              onPress={handleSync}
              disabled={syncing || status !== 'connected'}
            >
              {syncing
                ? <ActivityIndicator color={C.background} size="small" />
                : <RefreshCw size={18} color={C.background} strokeWidth={2.5} />}
              <Text style={styles.syncBtnText}>{syncing ? 'Syncing...' : 'Sync Watch'}</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.locationBtn} onPress={() => navigation.navigate('Location')}>
            <MapPin size={16} color={C.accentTeal} strokeWidth={2} />
            <Text style={styles.locationBtnText}>View Location Log</Text>
            <ChevronRight size={16} color={C.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { color: C.textMuted, fontSize: 13, ...F.regular },
  userName: { color: C.text, fontSize: 26, ...F.bold, marginTop: 2 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  bleBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.backgroundCard, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 20, marginBottom: 14 },
  bleDot: { width: 8, height: 8, borderRadius: 4 },
  bleText: { flex: 1, ...F.medium, fontSize: 13 },
  heroCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: C.borderGlow, marginBottom: 16 },
  heroLeft: { flex: 1, gap: 6 },
  heroDate: { color: C.textMuted, ...F.regular, fontSize: 12 },
  heroTitle: { color: C.text, ...F.bold, fontSize: 38 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  streakText: { color: C.warning, ...F.semibold, fontSize: 12 },
  metricsGrid: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  metricCard: { backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  iconBg: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { ...F.medium, fontSize: 13, flex: 1 },
  metricValue: { ...F.bold, fontSize: 28, marginBottom: 10 },
  metricUnit: { ...F.regular, fontSize: 14, color: C.textSecondary },
  progressBar: { height: 4, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 2 },
  metricGoal: { color: C.textMuted, ...F.regular, fontSize: 11 },
  syncInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncTime: { color: C.textMuted, ...F.regular, fontSize: 12 },
  goalBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.backgroundCard, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1 },
  goalBtnText: { flex: 1, ...F.medium, fontSize: 14 },
  syncBtn: { backgroundColor: C.accent, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  syncBtnText: { color: C.background, ...F.bold, fontSize: 16 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.backgroundCard, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: C.border },
  locationBtnText: { flex: 1, color: C.text, ...F.medium, fontSize: 14 },
});
