import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { X, MapPin, Plus, Trash2, Calendar, Zap, AlertCircle } from "lucide-react-native";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessContext";
import type { LocationLog } from "@/lib/storage";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };

function LogRow({ log, index }: { log: LocationLog; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={styles.logRow}>
      <View style={styles.logIconBg}>
        <MapPin size={16} color={C.accentTeal} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.logCoords}>{log.lat.toFixed(5)}, {log.lon.toFixed(5)}</Text>
        <Text style={styles.logDate}>{new Date(log.date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Text>
      </View>
      <View style={styles.logSteps}>
        <Zap size={12} color={C.accent} strokeWidth={2} />
        <Text style={styles.logStepsText}>{log.steps.toLocaleString()}</Text>
      </View>
    </Animated.View>
  );
}

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const { locationLogs, addLocationLog, todaySteps } = useFitness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission not granted. Please allow it in your device settings.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await addLocationLog({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        steps: todaySteps,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError("Could not get location. Try again.");
    } finally {
      setLoading(false);
    }
  }, [addLocationLog, todaySteps]);

  const hasLogs = locationLogs.length > 0;

  const latRange = hasLogs ? {
    min: Math.min(...locationLogs.map(l => l.lat)),
    max: Math.max(...locationLogs.map(l => l.lat)),
  } : null;

  const lonRange = hasLogs ? {
    min: Math.min(...locationLogs.map(l => l.lon)),
    max: Math.max(...locationLogs.map(l => l.lon)),
  } : null;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Location Log</Text>
        <TouchableOpacity
          style={[styles.addBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogLocation}
          disabled={loading}
        >
          <Plus size={20} color={C.accent} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={C.error} strokeWidth={2} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {hasLogs && latRange && lonRange && (
          <Animated.View entering={FadeInDown.springify()} style={styles.mapCard}>
            <Text style={styles.mapTitle}>Activity Area</Text>
            <View style={styles.mapGrid}>
              {locationLogs.slice(0, 20).map((log, i) => {
                const x = latRange.max === latRange.min ? 50 : ((log.lat - latRange.min) / (latRange.max - latRange.min)) * 90 + 5;
                const y = lonRange.max === lonRange.min ? 50 : ((log.lon - lonRange.min) / (lonRange.max - lonRange.min)) * 90 + 5;
                return (
                  <View key={log.id} style={[styles.mapDot, { left: `${y}%` as any, top: `${x}%` as any, opacity: 0.4 + (i / locationLogs.length) * 0.6 }]} />
                );
              })}
              {locationLogs[0] && (
                <View style={[styles.mapDotLatest, {
                  left: `${lonRange.max === lonRange.min ? 50 : ((locationLogs[0].lon - lonRange.min) / (lonRange.max - lonRange.min)) * 90 + 5}%` as any,
                  top: `${latRange.max === latRange.min ? 50 : ((locationLogs[0].lat - latRange.min) / (latRange.max - latRange.min)) * 90 + 5}%` as any,
                }]} />
              )}
            </View>
            <Text style={styles.mapNote}>{locationLogs.length} locations logged · latest is brightest</Text>
          </Animated.View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.accentTeal }]}>{locationLogs.length}</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={18} color={C.accent} strokeWidth={2} />
            <Text style={[styles.statValue, { color: C.accent }]}>
              {hasLogs ? new Set(locationLogs.map(l => l.date.split("T")[0])).size : 0}
            </Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: C.accentGreen }]}>
              {hasLogs ? Math.round(locationLogs.reduce((s, l) => s + l.steps, 0) / locationLogs.length).toLocaleString() : "—"}
            </Text>
            <Text style={styles.statLabel}>Avg Steps</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.logBtn, loading && { opacity: 0.6 }]} onPress={handleLogLocation} disabled={loading}>
          <MapPin size={18} color={C.background} strokeWidth={2} />
          <Text style={styles.logBtnText}>{loading ? "Getting location..." : "Log Current Location"}</Text>
        </TouchableOpacity>

        {hasLogs ? (
          <View style={styles.logList}>
            <Text style={styles.listTitle}>Recent Locations</Text>
            {locationLogs.map((log, i) => <LogRow key={log.id} log={log} index={i} />)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color={C.textMuted} strokeWidth={1} />
            <Text style={styles.emptyTitle}>No locations logged yet</Text>
            <Text style={styles.emptySubtitle}>Tap the button above to log your current position with today's step count</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  title: { color: C.text, fontFamily: F.bold, fontSize: 18 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${C.accent}22`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.accent },
  errorBox: { flexDirection: "row", gap: 10, backgroundColor: `${C.error}11`, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: `${C.error}33`, marginBottom: 12 },
  errorText: { flex: 1, color: C.error, fontFamily: F.regular, fontSize: 13 },
  mapCard: { backgroundColor: C.backgroundCard, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.borderGlow, marginBottom: 16 },
  mapTitle: { color: C.text, fontFamily: F.semibold, fontSize: 14, marginBottom: 12 },
  mapGrid: { height: 200, backgroundColor: C.backgroundElevated, borderRadius: 12, position: "relative", overflow: "hidden", marginBottom: 8 },
  mapDot: { position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: C.accentTeal, transform: [{ translateX: -5 }, { translateY: -5 }] },
  mapDotLatest: { position: "absolute", width: 16, height: 16, borderRadius: 8, backgroundColor: C.accent, transform: [{ translateX: -8 }, { translateY: -8 }], borderWidth: 3, borderColor: C.background },
  mapNote: { color: C.textMuted, fontFamily: F.regular, fontSize: 11, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14, alignItems: "center", gap: 4, borderWidth: 1, borderColor: C.border },
  statValue: { fontFamily: F.bold, fontSize: 20 },
  statLabel: { color: C.textMuted, fontFamily: F.regular, fontSize: 11 },
  logBtn: { backgroundColor: C.accentTeal, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, marginBottom: 20 },
  logBtnText: { color: C.background, fontFamily: F.bold, fontSize: 16 },
  logList: { gap: 8 },
  listTitle: { color: C.textSecondary, fontFamily: F.semibold, fontSize: 13, marginBottom: 4 },
  logRow: { backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: C.border },
  logIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: `${C.accentTeal}22`, alignItems: "center", justifyContent: "center" },
  logCoords: { color: C.text, fontFamily: F.medium, fontSize: 13 },
  logDate: { color: C.textMuted, fontFamily: F.regular, fontSize: 11, marginTop: 2 },
  logSteps: { flexDirection: "row", alignItems: "center", gap: 4 },
  logStepsText: { color: C.accent, fontFamily: F.semibold, fontSize: 13 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { color: C.text, fontFamily: F.semibold, fontSize: 18 },
  emptySubtitle: { color: C.textMuted, fontFamily: F.regular, fontSize: 14, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
});
