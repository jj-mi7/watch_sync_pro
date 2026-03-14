import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Image, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Bluetooth, Settings, Battery, Heart, Zap, Map,
  Camera, RefreshCw, Phone, LogOut, User, ChevronRight, Watch,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';
import { useBle } from '@/context/BleContext';
import { useFitness } from '@/context/FitnessContext';
import { useAuth } from '@/lib/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

const C = Colors.dark;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function DataRow({ Icon, label, value, color }: { Icon: any; label: string; value: string; color: string }) {
  return (
    <View style={styles.dataRow}>
      <View style={[styles.dataIcon, { backgroundColor: `${color}22` }]}>
        <Icon size={16} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={[styles.dataValue, { color }]}>{value}</Text>
    </View>
  );
}

export function WatchScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { status, connectedDevice, watchData, battery, disconnect, syncData, triggerFindPhone } = useBle();
  const { watchPhoto, watchName, lastSync, setWatchPhoto, setTodayData } = useFitness();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 4;

  const handlePickPhoto = async () => {
    if (Platform.OS === 'web') return;
    try {
      const { launchImageLibrary } = await import('react-native-image-picker');
      launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async resp => {
        if (resp.assets?.[0]?.uri) await setWatchPhoto(resp.assets[0].uri);
      });
    } catch {}
  };

  const handleSync = async () => {
    setSyncing(true);
    const data = await syncData();
    if (data) {
      await setTodayData({ steps: data.steps, calories: data.calories, distanceKm: data.distanceKm, heartRate: data.heartRate });
    }
    setSyncing(false);
  };

  const handleFindPhone = () => triggerFindPhone();

  const bleColor = status === 'connected' ? C.accentGreen : status === 'error' ? C.error : C.textMuted;
  const bleLabel = status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : status === 'scanning' ? 'Scanning...' : 'Disconnected';

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Watch</Text>
            <Text style={styles.subtitle}>{watchName}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Settings size={18} color={C.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.watchCard}>
          <TouchableOpacity style={styles.watchPhotoArea} onPress={handlePickPhoto} activeOpacity={0.8}>
            {watchPhoto ? (
              <Image source={{ uri: watchPhoto }} style={styles.watchPhoto} resizeMode="cover" />
            ) : (
              <View style={styles.watchPlaceholder}>
                <Watch size={40} color={C.textMuted} strokeWidth={1.5} />
              </View>
            )}
            {Platform.OS !== 'web' && (
              <View style={styles.cameraOverlay}>
                <Camera size={14} color={C.text} strokeWidth={2} />
              </View>
            )}
          </TouchableOpacity>
          <View style={[styles.connectedDot, { backgroundColor: bleColor }]} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: bleColor }]} />
            <Text style={[styles.statusLabel, { color: bleColor }]}>{bleLabel}</Text>
            {battery != null && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <Battery size={14} color={battery > 20 ? C.accentGreen : C.error} strokeWidth={2} />
                <Text style={{ color: C.textSecondary, ...F.medium, fontSize: 12 }}>{battery}%</Text>
              </View>
            )}
          </View>
          {connectedDevice && <Text style={styles.deviceName}>{connectedDevice.name}</Text>}
          {lastSync && <Text style={styles.lastSync}>Last sync: {lastSync.toLocaleTimeString()}</Text>}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {status === 'connected' ? (
              <TouchableOpacity style={styles.connectBtn} onPress={() => disconnect()}>
                <Bluetooth size={14} color={C.error} strokeWidth={2} />
                <Text style={[styles.connectText, { color: C.error }]}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.connectBtn} onPress={() => navigation.navigate('Connect')}>
                <Bluetooth size={14} color={C.accent} strokeWidth={2} />
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {watchData && (
          <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.dataCard}>
            <Text style={styles.cardTitle}>WATCH DATA</Text>
            <DataRow Icon={Zap} label="Steps" value={watchData.steps.toLocaleString()} color={C.accent} />
            <DataRow Icon={Map} label="Distance" value={`${watchData.distanceKm.toFixed(2)} km`} color={C.accentTeal} />
            {watchData.heartRate != null && (
              <DataRow Icon={Heart} label="Heart Rate" value={`${watchData.heartRate} bpm`} color={C.error} />
            )}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleSync} disabled={syncing || status !== 'connected'}>
            <View style={[styles.actionIcon, { backgroundColor: `${C.accent}22` }]}>
              {syncing ? <ActivityIndicator color={C.accent} /> : <RefreshCw size={22} color={C.accent} strokeWidth={2} />}
            </View>
            <Text style={styles.actionTitle}>Sync Data</Text>
            <Text style={styles.actionSub}>{status !== 'connected' ? 'Connect first' : 'Pull latest'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={handleFindPhone} disabled={status !== 'connected'}>
            <View style={[styles.actionIcon, { backgroundColor: `${C.accentTeal}22` }]}>
              <Phone size={22} color={C.accentTeal} strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Find Phone</Text>
            <Text style={styles.actionSub}>Vibrate phone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Connect')}>
            <View style={[styles.actionIcon, { backgroundColor: `${C.accentBlue}22` }]}>
              <Bluetooth size={22} color={C.accentBlue} strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Connect</Text>
            <Text style={styles.actionSub}>Scan for watch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Settings')}>
            <View style={[styles.actionIcon, { backgroundColor: `${C.textMuted}22` }]}>
              <Settings size={22} color={C.textSecondary} strokeWidth={2} />
            </View>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSub}>BLE UUIDs</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.authCard}>
          {isAuthenticated && user ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user.firstName ?? user.email ?? 'U')[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user.firstName ?? 'User'} {user.lastName ?? ''}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <LogOut size={16} color={C.error} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <Text style={styles.authTitle}>Sync to Cloud</Text>
              <Text style={styles.authSub}>Log in to save your fitness data across devices</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={login}>
                <User size={18} color={C.background} strokeWidth={2} />
                <Text style={styles.loginBtnText}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  title: { color: C.text, ...F.bold, fontSize: 26 },
  subtitle: { color: C.textMuted, ...F.regular, fontSize: 13, marginTop: 2 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.backgroundCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  watchCard: { marginHorizontal: 20, marginBottom: 16, alignItems: 'center', position: 'relative' },
  watchPhotoArea: { width: 160, height: 160, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: C.borderGlow },
  watchPhoto: { width: '100%', height: '100%' },
  watchPlaceholder: { flex: 1, backgroundColor: C.backgroundCard, alignItems: 'center', justifyContent: 'center' },
  cameraOverlay: { position: 'absolute', bottom: 8, right: 8, backgroundColor: C.backgroundElevated, borderRadius: 16, padding: 6, borderWidth: 1, borderColor: C.border },
  connectedDot: { position: 'absolute', top: 8, right: 8, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: C.backgroundCard },
  statusCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12, gap: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { ...F.semibold, fontSize: 15 },
  deviceName: { color: C.textMuted, ...F.regular, fontSize: 12 },
  lastSync: { color: C.textMuted, ...F.regular, fontSize: 12 },
  connectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: `${C.accent}22`, borderRadius: 12, borderWidth: 1, borderColor: C.accent },
  connectText: { color: C.accent, ...F.semibold, fontSize: 13 },
  dataCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.borderGlow, marginBottom: 12 },
  cardTitle: { color: C.textSecondary, ...F.semibold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  dataIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dataLabel: { flex: 1, color: C.textSecondary, ...F.regular, fontSize: 14 },
  dataValue: { ...F.semibold, fontSize: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  actionCard: { width: '47%', backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: C.text, ...F.semibold, fontSize: 14 },
  actionSub: { color: C.textMuted, ...F.regular, fontSize: 12 },
  authCard: { marginHorizontal: 20, backgroundColor: C.backgroundCard, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${C.accent}33`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.accent },
  avatarText: { color: C.accent, ...F.bold, fontSize: 18 },
  userName: { color: C.text, ...F.semibold, fontSize: 15 },
  userEmail: { color: C.textMuted, ...F.regular, fontSize: 12 },
  logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${C.error}22`, alignItems: 'center', justifyContent: 'center' },
  authTitle: { color: C.text, ...F.semibold, fontSize: 16 },
  authSub: { color: C.textMuted, ...F.regular, fontSize: 13 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.accent, borderRadius: 14, paddingVertical: 14 },
  loginBtnText: { color: C.background, ...F.bold, fontSize: 15 },
});
