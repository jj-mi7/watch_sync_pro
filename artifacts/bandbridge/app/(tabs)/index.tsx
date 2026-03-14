import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Footprints, RefreshCw, Watch, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { GoalProgress } from '@/components/GoalProgress';
import { StatsGrid } from '@/components/StatsGrid';
import { WatchCard } from '@/components/WatchCard';
import { useApp } from '@/context/AppContext';
import { useBle } from '@/context/BleContext';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { devices, activeDeviceId, todayStats, lastSynced, syncData, updateWatchImage } = useApp();
  const ble = useBle();
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeDevice = devices.find(d => d.id === activeDeviceId) ?? devices[0] ?? null;
  const isConnected = ble.connectedDevice !== null;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const formatSynced = () => {
    if (!lastSynced) return 'Never';
    const d = new Date(lastSynced);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSync = async () => {
    if (!activeDevice) return;
    setSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(r => setTimeout(r, 1500));
    const steps = Math.floor(Math.random() * 2000 + todayStats.steps);
    const calories = steps * 0.04;
    const km = steps * 0.000762;
    await syncData(steps, calories, km);
    setSyncing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleConnect = async () => {
    if (!activeDevice) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await ble.connectToDevice(activeDevice.id, activeDevice.serviceUUID, activeDevice.characteristicUUID);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <LinearGradient
        colors={['rgba(0,245,196,0.04)', 'transparent', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.neon}
            colors={[Colors.neon]}
          />
        }
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
          </View>
          <View style={styles.syncBadge}>
            <RefreshCw size={12} color={Colors.neon} />
            <Text style={styles.syncText}>{formatSynced()}</Text>
          </View>
        </Animated.View>

        {ble.bleError ? (
          <Animated.View entering={FadeInUp} style={styles.errorBanner}>
            <AlertTriangle size={14} color={Colors.amber} />
            <Text style={styles.errorText} numberOfLines={2}>{ble.bleError}</Text>
            <Pressable onPress={ble.clearError}>
              <X size={16} color={Colors.textMuted} />
            </Pressable>
          </Animated.View>
        ) : null}

        {activeDevice ? (
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <WatchCard
              device={activeDevice}
              isConnected={isConnected}
              isConnecting={ble.isScanning}
              onConnect={handleConnect}
              onDisconnect={ble.disconnect}
              onSync={handleSync}
              onFindPhone={ble.findPhone}
              onImageUpdate={(uri) => updateWatchImage(activeDevice.id, uri)}
              syncing={syncing}
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.noDevice}>
            <Watch size={36} color={Colors.textMuted} />
            <Text style={styles.noDeviceTitle}>No device added</Text>
            <Text style={styles.noDeviceText}>Go to Devices tab to pair your Casio or any smartband</Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <GoalProgress stats={todayStats} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <StatsGrid stats={todayStats} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.bigSteps}>
          <LinearGradient
            colors={[Colors.neonDim, 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.bigStepsInner}>
            <Footprints size={22} color={Colors.neon} />
            <View>
              <Text style={styles.bigStepsLabel}>Total Steps Today</Text>
              <Text style={styles.bigStepsValue}>{todayStats.steps.toLocaleString()}</Text>
            </View>
          </View>
          <Text style={styles.bigStepsEst}>
            ≈ {todayStats.km.toFixed(2)} km · {Math.round(todayStats.calories)} kcal
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neonDim,
    borderWidth: 1,
    borderColor: Colors.neonBorder,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  syncText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.neon,
  },
  noDevice: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  noDeviceTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  noDeviceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.amberDim,
    borderWidth: 1,
    borderColor: Colors.amber + '50',
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.amber,
  },
  bigSteps: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neonBorder,
    padding: 16,
    gap: 8,
    overflow: 'hidden',
  },
  bigStepsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bigStepsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bigStepsValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.neon,
    letterSpacing: -1,
  },
  bigStepsEst: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 34,
  },
});
