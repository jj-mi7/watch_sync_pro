import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, ActivityIndicator, Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown, FadeIn, useAnimatedStyle, useSharedValue,
  withRepeat, withTiming, withDelay, withSpring, Easing,
  cancelAnimation, runOnJS,
} from 'react-native-reanimated';
import { X, Bluetooth, ChevronRight, CheckCircle, Radio } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';
import { useBle } from '@/context/BleContext';
import { useFitness } from '@/context/FitnessContext';
import type { BleDevice } from '@/lib/bluetooth';
import { SignalBars } from '@/components/SignalBars';

const C = Colors.dark;

const TARGET_NAME = 'Casio ABL-100WE';

function RadarRing({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(withTiming(2.2, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 2400, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
    setTimeout(() => { opacity.value = withDelay(delay, withRepeat(withTiming(0, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false)); }, delay);

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: Math.max(0, 0.6 - (scale.value - 0.3) / 2.4 * 0.6),
    borderColor: color,
  }));

  return <Animated.View style={[styles.radarRing, ring]} />;
}

function CasioFoundBadge() {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.casioFoundBadge, style]}>
      <CheckCircle size={14} color={C.accentGreen} strokeWidth={2.5} />
      <Text style={styles.casioFoundText}>CASIO FOUND</Text>
    </Animated.View>
  );
}

function DeviceRow({ device, onPress, isConnecting }: {
  device: BleDevice;
  onPress: () => void;
  isConnecting: boolean;
}) {
  const isCasio = device.name === TARGET_NAME;
  const glow = useSharedValue(0);

  useEffect(() => {
    if (isCasio) {
      glow.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    }
    return () => cancelAnimation(glow);
  }, [isCasio]);

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: isCasio
      ? `rgba(0,229,255,${0.3 + glow.value * 0.5})`
      : C.border,
    shadowColor: isCasio ? C.accent : 'transparent',
    shadowOpacity: isCasio ? 0.4 + glow.value * 0.3 : 0,
    shadowRadius: 8,
  }));

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        disabled={isConnecting}
      >
        <Animated.View style={[styles.deviceRow, glowStyle]}>
          <View style={[styles.deviceIcon, { backgroundColor: isCasio ? `${C.accent}22` : `${C.textMuted}18` }]}>
            <Bluetooth size={18} color={isCasio ? C.accent : C.textSecondary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.deviceName, isCasio && { color: C.accent }]}>
                {device.name ?? 'Unknown Device'}
              </Text>
              {isCasio && <CasioFoundBadge />}
            </View>
            <Text style={styles.deviceId}>{device.id.slice(0, 20)}...</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <SignalBars rssi={device.rssi} />
            {isConnecting
              ? <ActivityIndicator color={C.accent} size="small" />
              : <ChevronRight size={16} color={isCasio ? C.accent : C.textMuted} />}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SuccessOverlay({ deviceName }: { deviceName: string }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    Vibration.vibrate([0, 120, 80, 120]);
  }, []);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.successOverlay]} entering={FadeIn.duration(200)}>
      <Animated.View style={[styles.successCard, anim]}>
        <View style={styles.successIconBg}>
          <CheckCircle size={40} color={C.accentGreen} strokeWidth={2} />
        </View>
        <Text style={styles.successTitle}>Connected!</Text>
        <Text style={styles.successSub}>{deviceName}</Text>
      </Animated.View>
    </Animated.View>
  );
}

export function ConnectScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { startScan, stopScan, scannedDevices, isScanning, connectTo, status, connectedDevice, disconnect } = useBle();
  const { setWatchDeviceId, setWatchName } = useFitness();
  const [connectingId, setConnectingId] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 8;

  const scanBtnScale = useSharedValue(1);
  const scanBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scanBtnScale.value }] }));

  const pressScanBtn = () => {
    scanBtnScale.value = withSpring(0.94, { damping: 15 }, () => {
      scanBtnScale.value = withSpring(1, { damping: 12 });
    });
    if (isScanning) stopScan();
    else startScan();
  };

  const handleConnect = async (device: BleDevice) => {
    Vibration.vibrate(50);
    setConnectingId(device.id);
    await connectTo(device);
    await setWatchDeviceId(device.id);
    if (device.name) await setWatchName(device.name);
    setConnectingId(null);
    setShowSuccess(true);
    setTimeout(() => {
      navigation.goBack();
    }, 1400);
  };

  const casioCasioFound = scannedDevices.some(d => d.name === TARGET_NAME);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={C.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Connect Watch</Text>
        <View style={{ width: 40 }} />
      </View>

      {status === 'connected' && connectedDevice && (
        <Animated.View entering={FadeInDown.springify()} style={styles.connectedCard}>
          <View style={[styles.connectedDot, { backgroundColor: C.accentGreen }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.connectedLabel}>Connected</Text>
            <Text style={styles.connectedDeviceName}>{connectedDevice.name ?? 'Device'}</Text>
          </View>
          <TouchableOpacity style={styles.disconnectBtn} onPress={() => disconnect()}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.radarContainer}>
        <View style={styles.radarCircle}>
          {isScanning && (
            <>
              <RadarRing delay={0} color={casioCasioFound ? C.accentGreen : C.accent} />
              <RadarRing delay={800} color={casioCasioFound ? C.accentGreen : C.accent} />
              <RadarRing delay={1600} color={casioCasioFound ? C.accentGreen : C.accent} />
            </>
          )}
          <View style={[
            styles.radarCenter,
            casioCasioFound && { borderColor: C.accentGreen, shadowColor: C.accentGreen, shadowOpacity: 0.6, shadowRadius: 12 },
          ]}>
            <Bluetooth size={32} color={isScanning ? (casioCasioFound ? C.accentGreen : C.accent) : C.textMuted} strokeWidth={2} />
          </View>
        </View>

        <View style={styles.statusRow}>
          {isScanning ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color={casioCasioFound ? C.accentGreen : C.accent} size="small" />
              <Text style={[styles.statusText, casioCasioFound && { color: C.accentGreen }]}>
                {casioCasioFound ? 'Casio ABL-100WE found!' : `Scanning... (${scannedDevices.length} found)`}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Radio size={14} color={C.textMuted} strokeWidth={2} />
              <Text style={styles.statusText}>
                {scannedDevices.length > 0 ? `${scannedDevices.length} device${scannedDevices.length > 1 ? 's' : ''} found` : 'Tap Scan to find devices'}
              </Text>
            </View>
          )}
        </View>

        <Animated.View style={scanBtnStyle}>
          <TouchableOpacity
            style={[styles.scanBtn, isScanning && styles.scanBtnActive]}
            onPress={pressScanBtn}
            activeOpacity={0.85}
          >
            <Text style={[styles.scanBtnText, isScanning && styles.scanBtnTextActive]}>
              {isScanning ? 'Stop Scan' : 'Start Scan'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {scannedDevices.length > 0 && (
        <View style={styles.deviceList}>
          <Text style={styles.deviceListTitle}>
            NEARBY DEVICES
          </Text>
          <FlatList
            data={[...scannedDevices].sort((a, b) => {
              if (a.name === TARGET_NAME) return -1;
              if (b.name === TARGET_NAME) return 1;
              return (b.rssi ?? -100) - (a.rssi ?? -100);
            })}
            keyExtractor={d => d.id}
            renderItem={({ item }) => (
              <DeviceRow
                device={item}
                onPress={() => handleConnect(item)}
                isConnecting={connectingId === item.id || status === 'connecting'}
              />
            )}
            contentContainerStyle={{ gap: 8 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {showSuccess && connectedDevice && (
        <SuccessOverlay deviceName={connectedDevice.name ?? 'Device'} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  title: { color: C.text, fontSize: 18, ...F.bold },
  connectedCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: `${C.accentGreen}18`, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: `${C.accentGreen}44`, gap: 12,
  },
  connectedDot: { width: 10, height: 10, borderRadius: 5 },
  connectedLabel: { color: C.accentGreen, ...F.semibold, fontSize: 12, marginBottom: 2 },
  connectedDeviceName: { color: C.text, ...F.medium, fontSize: 14 },
  disconnectBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: `${C.error}22`, borderWidth: 1, borderColor: C.error,
  },
  disconnectText: { color: C.error, ...F.semibold, fontSize: 13 },
  radarContainer: { alignItems: 'center', paddingVertical: 24, gap: 16 },
  radarCircle: {
    width: 180, height: 180, alignItems: 'center', justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    borderWidth: 1.5, borderColor: C.accent,
  },
  radarCenter: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: C.backgroundCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.border,
    shadowColor: C.accent, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  statusRow: { alignItems: 'center', minHeight: 24 },
  statusText: { color: C.textSecondary, ...F.medium, fontSize: 13 },
  scanBtn: {
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30,
    backgroundColor: C.backgroundCard, borderWidth: 1.5, borderColor: C.accent,
  },
  scanBtnActive: { backgroundColor: `${C.accent}22` },
  scanBtnText: { color: C.accent, ...F.bold, fontSize: 15 },
  scanBtnTextActive: { color: C.accent },
  deviceList: { flex: 1, paddingHorizontal: 20 },
  deviceListTitle: {
    color: C.textMuted, ...F.semibold, fontSize: 11, letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 10,
  },
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.backgroundCard, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  deviceIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  deviceName: { color: C.text, ...F.semibold, fontSize: 14 },
  deviceId: { color: C.textMuted, ...F.regular, fontSize: 11 },
  casioFoundBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${C.accentGreen}22`, borderRadius: 20, borderWidth: 1,
    borderColor: `${C.accentGreen}66`, paddingHorizontal: 8, paddingVertical: 3,
  },
  casioFoundText: { color: C.accentGreen, ...F.bold, fontSize: 10 },
  successOverlay: {
    backgroundColor: 'rgba(5,10,16,0.85)', alignItems: 'center', justifyContent: 'center',
  },
  successCard: {
    alignItems: 'center', gap: 12, backgroundColor: C.backgroundCard,
    borderRadius: 24, padding: 32, borderWidth: 1, borderColor: `${C.accentGreen}44`,
    minWidth: 200,
  },
  successIconBg: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: `${C.accentGreen}22`,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${C.accentGreen}44`,
  },
  successTitle: { color: C.text, ...F.bold, fontSize: 22 },
  successSub: { color: C.textSecondary, ...F.regular, fontSize: 14 },
});
