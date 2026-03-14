import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X, MapPin, Plus, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';
import { useFitness } from '@/context/FitnessContext';
import type { LocationLog } from '@/lib/storage';

const C = Colors.dark;

function LogRow({ log, index }: { log: LocationLog; index: number }) {
  const date = new Date(log.date);
  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()} style={styles.logRow}>
      <View style={styles.logIconBg}>
        <MapPin size={16} color={C.accentTeal} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.logCoords}>{log.lat.toFixed(5)}, {log.lon.toFixed(5)}</Text>
        <Text style={styles.logDate}>{date.toLocaleString()}</Text>
      </View>
      <View style={styles.logSteps}>
        <Text style={styles.logStepsText}>{log.steps.toLocaleString()} steps</Text>
      </View>
    </Animated.View>
  );
}

export function LocationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { locationLogs, todaySteps, addLocationLog } = useFitness();
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 8;

  const handleLogLocation = async () => {
    setError(null);
    setLogging(true);
    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) throw new Error('Geolocation not supported');
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            pos => {
              addLocationLog({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                date: new Date().toISOString(),
                steps: todaySteps,
              }).then(resolve);
            },
            err => reject(new Error(err.message)),
            { timeout: 10000 },
          );
        });
      } else {
        const Geolocation = (await import('react-native-geolocation-service')).default;
        await new Promise<void>((resolve, reject) => {
          Geolocation.getCurrentPosition(
            pos => {
              addLocationLog({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                date: new Date().toISOString(),
                steps: todaySteps,
              }).then(resolve);
            },
            err => reject(new Error(err.message)),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
          );
        });
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to get location');
    } finally {
      setLogging(false);
    }
  };

  const hasLogs = locationLogs.length > 0;
  const latestLog = locationLogs[0];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Location Log</Text>
        <TouchableOpacity onPress={handleLogLocation} style={styles.addBtn} disabled={logging}>
          {logging ? <ActivityIndicator color={C.accent} size="small" /> : <Plus size={20} color={C.accent} strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={C.error} strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {hasLogs && latestLog && (
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Last Known Position</Text>
            <View style={styles.mapGrid}>
              <View style={[styles.mapDotLatest, {
                left: '50%', top: '50%',
              }]} />
              {locationLogs.slice(1, 6).map((log, i) => (
                <View key={log.id} style={[styles.mapDot, {
                  left: `${50 + (log.lon - latestLog.lon) * 500}%`,
                  top: `${50 - (log.lat - latestLog.lat) * 500}%`,
                }]} />
              ))}
            </View>
            <Text style={styles.mapNote}>{latestLog.lat.toFixed(5)}, {latestLog.lon.toFixed(5)}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.accent }]}>{locationLogs.length}</Text>
            <Text style={styles.statLabel}>Logged</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.accentTeal }]}>{todaySteps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Today's Steps</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logBtn} onPress={handleLogLocation} disabled={logging}>
          {logging ? <ActivityIndicator color={C.background} size="small" /> : <MapPin size={20} color={C.background} strokeWidth={2.5} />}
          <Text style={styles.logBtnText}>{logging ? 'Getting location...' : 'Log Current Position'}</Text>
        </TouchableOpacity>

        {hasLogs ? (
          <View style={styles.logList}>
            <Text style={styles.listTitle}>RECENT LOCATIONS</Text>
            {locationLogs.map((log, i) => <LogRow key={log.id} log={log} index={i} />)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color={C.textMuted} strokeWidth={1} />
            <Text style={styles.emptyTitle}>No locations yet</Text>
            <Text style={styles.emptySub}>Tap the button above to log your current position</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  title: { color: C.text, ...F.bold, fontSize: 18 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${C.accent}22`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.accent },
  errorBox: { flexDirection: 'row', gap: 10, backgroundColor: `${C.error}11`, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${C.error}33` },
  errorText: { flex: 1, color: C.error, ...F.regular, fontSize: 13 },
  mapCard: { backgroundColor: C.backgroundCard, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.borderGlow },
  mapTitle: { color: C.text, ...F.semibold, fontSize: 14, marginBottom: 12 },
  mapGrid: { height: 160, backgroundColor: C.backgroundElevated, borderRadius: 12, position: 'relative', overflow: 'hidden', marginBottom: 8 },
  mapDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: C.accentTeal, transform: [{ translateX: -4 }, { translateY: -4 }] },
  mapDotLatest: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: C.accent, transform: [{ translateX: -7 }, { translateY: -7 }], borderWidth: 3, borderColor: C.background },
  mapNote: { color: C.textMuted, ...F.regular, fontSize: 11, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.border },
  statValue: { ...F.bold, fontSize: 22 },
  statLabel: { color: C.textMuted, ...F.regular, fontSize: 11 },
  logBtn: { backgroundColor: C.accentTeal, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  logBtnText: { color: C.background, ...F.bold, fontSize: 16 },
  logList: { gap: 8 },
  listTitle: { color: C.textMuted, ...F.semibold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  logRow: { backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border },
  logIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: `${C.accentTeal}22`, alignItems: 'center', justifyContent: 'center' },
  logCoords: { color: C.text, ...F.medium, fontSize: 13 },
  logDate: { color: C.textMuted, ...F.regular, fontSize: 11, marginTop: 2 },
  logSteps: { alignItems: 'flex-end' },
  logStepsText: { color: C.accent, ...F.semibold, fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { color: C.text, ...F.semibold, fontSize: 18 },
  emptySub: { color: C.textMuted, ...F.regular, fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
});
