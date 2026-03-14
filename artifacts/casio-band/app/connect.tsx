import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { X, Bluetooth, Radio, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useBle } from "@/context/BleContext";
import { useFitness } from "@/context/FitnessContext";
import type { BleDevice } from "@/lib/bluetooth";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };

function SignalBars({ rssi }: { rssi: number | null }) {
  if (rssi == null) return null;
  const strength = rssi > -60 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
      {[1, 2, 3].map(b => (
        <View key={b} style={{ width: 4, height: 4 + b * 4, borderRadius: 2, backgroundColor: b <= strength ? C.accentGreen : C.border }} />
      ))}
    </View>
  );
}

function DeviceRow({ device, onPress, isConnecting }: { device: BleDevice; onPress: () => void; isConnecting: boolean }) {
  return (
    <TouchableOpacity style={styles.deviceRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.deviceIconBg}>
        <Bluetooth size={18} color={C.accent} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.deviceName}>{device.name ?? "Unknown Device"}</Text>
        <Text style={styles.deviceId}>{device.id.slice(0, 20)}</Text>
      </View>
      <SignalBars rssi={device.rssi} />
      {isConnecting
        ? <ActivityIndicator color={C.accent} size="small" style={{ marginLeft: 10 }} />
        : <ChevronRight size={18} color={C.textMuted} style={{ marginLeft: 10 } as any} />}
    </TouchableOpacity>
  );
}

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const { startScan, stopScan, scannedDevices, isScanning, connectTo, status, connectedDevice, disconnect } = useBle();
  const { setWatchDeviceId, setWatchName } = useFitness();
  const [connectingId, setConnectingId] = React.useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const scanRot = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      scanRot.value = withRepeat(withTiming(360, { duration: 1800 }), -1, false);
    } else {
      scanRot.value = withTiming(0, { duration: 400 });
    }
  }, [isScanning]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${scanRot.value}deg` }] }));

  const handleConnect = async (device: BleDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnectingId(device.id);
    await connectTo(device);
    await setWatchDeviceId(device.id);
    if (device.name) await setWatchName(device.name);
    setConnectingId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Connect Watch</Text>
        <View style={{ width: 40 }} />
      </View>

      {status === "connected" && connectedDevice && (
        <Animated.View entering={FadeInDown.springify()} style={styles.connectedCard}>
          <View style={[styles.connectedDot, { backgroundColor: C.accentGreen }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.connectedLabel}>Connected</Text>
            <Text style={styles.connectedDevice}>{connectedDevice.name ?? "Watch"}</Text>
          </View>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 6 }} onPress={disconnect}>
            <X size={18} color={C.error} strokeWidth={2} />
            <Text style={{ color: C.error, fontFamily: F.medium, fontSize: 14 }}>Disconnect</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.scanArea}>
        <Animated.View style={[styles.scanRing, spinStyle]}>
          <View style={styles.scanInner}>
            <Bluetooth size={32} color={C.accent} strokeWidth={1.5} />
          </View>
        </Animated.View>
        <Text style={styles.scanStatus}>{isScanning ? "Scanning for devices..." : status === "connected" ? "Connected" : "Ready to scan"}</Text>
        <Text style={styles.scanHint}>Make sure your Casio is nearby and not already paired</Text>
      </View>

      <TouchableOpacity
        style={[styles.scanBtn, isScanning && { backgroundColor: C.backgroundCard, borderColor: C.accent, borderWidth: 1 }]}
        onPress={isScanning ? stopScan : startScan}
      >
        {isScanning ? (
          <><ActivityIndicator color={C.accent} size="small" /><Text style={[styles.scanBtnText, { color: C.accent }]}>Stop Scanning</Text></>
        ) : (
          <><Radio size={18} color={C.background} strokeWidth={2} /><Text style={styles.scanBtnText}>Scan for Devices</Text></>
        )}
      </TouchableOpacity>

      {scannedDevices.length > 0 && (
        <>
          <Text style={styles.listLabel}>Found {scannedDevices.length} device{scannedDevices.length !== 1 ? "s" : ""}</Text>
          <FlatList
            data={scannedDevices} keyExtractor={d => d.id}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
                <DeviceRow device={item} onPress={() => handleConnect(item)} isConnecting={connectingId === item.id} />
              </Animated.View>
            )}
          />
        </>
      )}

      <View style={styles.noteCard}>
        <Bluetooth size={14} color={C.textMuted} strokeWidth={2} />
        <Text style={styles.noteText}>On web, demo mode shows mock devices. On a real device, configure UUIDs in Settings for your Casio ABL-100WE using nRF Connect.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  title: { color: C.text, fontFamily: F.bold, fontSize: 18 },
  connectedCard: { marginHorizontal: 20, backgroundColor: `${C.accentGreen}11`, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: C.accentGreen, marginBottom: 16 },
  connectedDot: { width: 10, height: 10, borderRadius: 5 },
  connectedLabel: { color: C.accentGreen, fontFamily: F.semibold, fontSize: 13 },
  connectedDevice: { color: C.text, fontFamily: F.bold, fontSize: 16 },
  scanArea: { alignItems: "center", paddingVertical: 28 },
  scanRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: `${C.accent}44`, alignItems: "center", justifyContent: "center", marginBottom: 16, borderStyle: "dashed" },
  scanInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${C.accent}22`, alignItems: "center", justifyContent: "center" },
  scanStatus: { color: C.text, fontFamily: F.semibold, fontSize: 16, marginBottom: 8 },
  scanHint: { color: C.textMuted, fontFamily: F.regular, fontSize: 13, textAlign: "center", paddingHorizontal: 40 },
  scanBtn: { marginHorizontal: 20, backgroundColor: C.accent, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, marginBottom: 16 },
  scanBtnText: { color: C.background, fontFamily: F.bold, fontSize: 16 },
  listLabel: { color: C.textSecondary, fontFamily: F.medium, fontSize: 13, paddingHorizontal: 20, marginBottom: 10 },
  deviceRow: { backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: C.border },
  deviceIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: `${C.accent}22`, alignItems: "center", justifyContent: "center" },
  deviceName: { color: C.text, fontFamily: F.semibold, fontSize: 14 },
  deviceId: { color: C.textMuted, fontFamily: F.regular, fontSize: 11, marginTop: 2 },
  noteCard: { flexDirection: "row", gap: 10, margin: 20, backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginTop: "auto" },
  noteText: { flex: 1, color: C.textMuted, fontFamily: F.regular, fontSize: 12, lineHeight: 18 },
});
