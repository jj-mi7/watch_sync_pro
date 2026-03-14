import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import {
  Settings, Smartphone, Sliders, Target, MapPin, Camera, Watch, Tag,
  Bluetooth, LogOut, User, ChevronRight, X, Zap, Flame, Heart,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessContext";
import { useBle } from "@/context/BleContext";
import { useAuth } from "@/lib/auth";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };

function InfoRow({ Icon, label, value, color = C.textSecondary }: { Icon: any; label: string; value: string; color?: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: `${color}22` }]}>
        <Icon size={14} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

function WatchDisplay({ photo, onPhotoPress, status, battery }: { photo: string | null; onPhotoPress: () => void; status: string; battery: number | null }) {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (status === "connected") {
      pulse.value = withRepeat(withSequence(withTiming(1.04, { duration: 1200 }), withTiming(1, { duration: 1200 })), -1, false);
    } else {
      pulse.value = withTiming(1);
    }
  }, [status]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View style={[{ alignItems: "center", marginBottom: 20 }, animStyle]}>
      <View style={[styles.watchFrame, status === "connected" && styles.watchFrameGlow]}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.watchPhoto} resizeMode="cover" />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
            <Watch size={60} color={C.accent} strokeWidth={1.5} />
          </View>
        )}
        {status === "connected" && <View style={styles.connectedDot} />}
      </View>
      {battery != null && (
        <Text style={{ color: battery < 20 ? C.error : C.accentGreen, fontFamily: F.semibold, fontSize: 14, marginTop: 10 }}>
          {battery}% battery
        </Text>
      )}
      <TouchableOpacity style={styles.uploadPhotoBtn} onPress={onPhotoPress}>
        <Camera size={14} color={C.textSecondary} strokeWidth={2} />
        <Text style={styles.uploadPhotoText}>Change Photo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function WatchScreen() {
  const insets = useSafeAreaInsets();
  const { watchPhoto, watchName, watchDeviceId, lastSync, setWatchPhoto } = useFitness();
  const { status, connectedDevice, watchData, battery, triggerFindPhone, disconnect } = useBle();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [findingPhone, setFindingPhone] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handlePhotoUpload = useCallback(async () => {
    const { status: s } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (s !== "granted") { Alert.alert("Permission Required", "Please allow photo access."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await setWatchPhoto(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [setWatchPhoto]);

  const handleFindPhone = useCallback(async () => {
    setFindingPhone(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await triggerFindPhone();
    setTimeout(() => setFindingPhone(false), 3000);
  }, [triggerFindPhone]);

  const statusColor = ({ connected: C.accentGreen, connecting: C.accent, scanning: C.accentBlue, error: C.error, idle: C.textMuted, disconnected: C.textMuted, unsupported: C.error } as Record<string, string>)[status] ?? C.textMuted;
  const statusLabel = ({ connected: "Connected", connecting: "Connecting...", scanning: "Scanning...", error: "Error", idle: "Not Connected", disconnected: "Disconnected", unsupported: "Unavailable" } as Record<string, string>)[status] ?? "—";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Watch</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push("/settings")}>
            <Settings size={20} color={C.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <WatchDisplay photo={watchPhoto} onPhotoPress={handlePhotoUpload} status={status} battery={battery ?? null} />

        <Animated.View entering={FadeInDown.springify()} style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
              {connectedDevice && <Text style={styles.deviceName}>{connectedDevice.name ?? "Unknown Device"}</Text>}
            </View>
            {status === "connected" ? (
              <TouchableOpacity style={styles.disconnectBtn} onPress={disconnect}>
                <X size={16} color={C.error} strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.connectBtn} onPress={() => router.push("/connect")}>
                <Bluetooth size={16} color={C.accent} strokeWidth={2} />
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
          {lastSync && <Text style={styles.lastSyncText}>Synced {lastSync.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Text>}
        </Animated.View>

        {watchData && (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.dataCard}>
            <Text style={styles.cardTitle}>Latest Readings</Text>
            <InfoRow Icon={Zap} label="Steps" value={watchData.steps.toLocaleString()} color={C.accent} />
            <InfoRow Icon={Flame} label="Calories" value={`${Math.round(watchData.calories)} kcal`} color={C.warning} />
            <InfoRow Icon={MapPin} label="Distance" value={`${watchData.distanceKm.toFixed(2)} km`} color={C.accentTeal} />
            {watchData.heartRate != null && <InfoRow Icon={Heart} label="Heart Rate" value={`${watchData.heartRate} bpm`} color={C.error} />}
          </Animated.View>
        )}

        <View style={styles.actionsGrid}>
          {[
            { Icon: Smartphone, label: "Find Phone", sub: findingPhone ? "Vibrating..." : "Ring & vibrate", color: C.accentBlue, onPress: handleFindPhone, loading: findingPhone },
            { Icon: Sliders, label: "Configure", sub: "UUID & BLE", color: C.accent, onPress: () => router.push("/settings"), loading: false },
            { Icon: Target, label: "Daily Goal", sub: "Set targets", color: C.accentGreen, onPress: () => router.push("/goal"), loading: false },
            { Icon: MapPin, label: "Location", sub: "Activity map", color: C.accentTeal, onPress: () => router.push("/location"), loading: false },
          ].map(item => (
            <TouchableOpacity key={item.label} style={[styles.actionCard, item.loading && { opacity: 0.7 }]} onPress={item.onPress} disabled={item.loading}>
              <View style={[styles.actionIcon, { backgroundColor: `${item.color}22` }]}>
                {item.loading ? <ActivityIndicator color={item.color} size="small" /> : <item.Icon size={24} color={item.color} strokeWidth={1.8} />}
              </View>
              <Text style={styles.actionTitle}>{item.label}</Text>
              <Text style={styles.actionSubtitle}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.authCard}>
          {isAuthenticated ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitial}>{user?.firstName?.charAt(0) ?? "U"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                  <Text style={styles.userEmail}>{user?.email ?? "—"}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                  <LogOut size={18} color={C.error} strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <Text style={{ color: C.textMuted, fontFamily: F.regular, fontSize: 12 }}>Cloud sync active</Text>
            </>
          ) : (
            <>
              <Text style={styles.authTitle}>Sign In to Sync Cloud</Text>
              <Text style={styles.authSubtitle}>Back up your fitness data anywhere</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={login}>
                <User size={16} color={C.background} strokeWidth={2.5} />
                <Text style={styles.loginBtnText}>Sign In with Replit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.watchInfoCard}>
          <Text style={styles.cardTitle}>Watch Info</Text>
          <InfoRow Icon={Watch} label="Model" value="Casio ABL-100WE" />
          <InfoRow Icon={Tag} label="Name" value={watchName} />
          {watchDeviceId && <InfoRow Icon={Bluetooth} label="Device ID" value={watchDeviceId.slice(0, 17) + "…"} color={C.textMuted} />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16 },
  title: { color: C.text, fontSize: 28, fontFamily: F.bold },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  watchFrame: { width: 180, height: 180, borderRadius: 40, backgroundColor: C.backgroundCard, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.border, overflow: "hidden" },
  watchFrameGlow: { borderColor: C.accentGreen, shadowColor: C.accentGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20 },
  watchPhoto: { width: "100%", height: "100%" },
  connectedDot: { position: "absolute", top: 12, right: 12, width: 12, height: 12, borderRadius: 6, backgroundColor: C.accentGreen, borderWidth: 2, borderColor: C.backgroundCard },
  uploadPhotoBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.backgroundCard, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  uploadPhotoText: { color: C.textSecondary, fontFamily: F.regular, fontSize: 13 },
  statusCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12, gap: 8 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontFamily: F.semibold, fontSize: 15 },
  deviceName: { color: C.textMuted, fontFamily: F.regular, fontSize: 12, marginTop: 2 },
  lastSyncText: { color: C.textMuted, fontFamily: F.regular, fontSize: 12 },
  connectBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: `${C.accent}22`, borderRadius: 12, borderWidth: 1, borderColor: C.accent },
  connectText: { color: C.accent, fontFamily: F.semibold, fontSize: 13 },
  disconnectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${C.error}22`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.error },
  dataCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.borderGlow, marginBottom: 12 },
  cardTitle: { color: C.textSecondary, fontFamily: F.semibold, fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  infoIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoLabel: { flex: 1, color: C.textSecondary, fontFamily: F.regular, fontSize: 14 },
  infoValue: { fontFamily: F.semibold, fontSize: 14 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  actionCard: { width: "47%", backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: C.border },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionTitle: { color: C.text, fontFamily: F.semibold, fontSize: 14 },
  actionSubtitle: { color: C.textMuted, fontFamily: F.regular, fontSize: 12 },
  authCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${C.accent}33`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.accent },
  userInitial: { color: C.accent, fontFamily: F.bold, fontSize: 18 },
  userName: { color: C.text, fontFamily: F.semibold, fontSize: 15 },
  userEmail: { color: C.textMuted, fontFamily: F.regular, fontSize: 12 },
  logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${C.error}22`, alignItems: "center", justifyContent: "center" },
  authTitle: { color: C.text, fontFamily: F.semibold, fontSize: 16, marginBottom: 6 },
  authSubtitle: { color: C.textMuted, fontFamily: F.regular, fontSize: 13, marginBottom: 16 },
  loginBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 14 },
  loginBtnText: { color: C.background, fontFamily: F.bold, fontSize: 15 },
  watchInfoCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
});
