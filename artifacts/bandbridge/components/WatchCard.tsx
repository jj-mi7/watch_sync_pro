import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Bluetooth, BluetoothOff, Camera, RefreshCw, Smartphone, Watch } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { NeoCard } from '@/components/ui/NeoCard';
import { ConnectionPulse } from '@/components/ui/ConnectionPulse';
import { Device } from '@/context/AppContext';

interface WatchCardProps {
  device: Device;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  onFindPhone: () => void;
  onImageUpdate: (uri: string) => void;
  syncing?: boolean;
}

export function WatchCard({
  device, isConnected, isConnecting, onConnect, onDisconnect,
  onSync, onFindPhone, onImageUpdate, syncing = false,
}: WatchCardProps) {
  const [imageLoading, setImageLoading] = useState(false);

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onImageUpdate(result.assets[0].uri);
    }
  };

  return (
    <NeoCard accent={isConnected ? 'neon' : 'none'} glow={isConnected} style={styles.card}>
      <LinearGradient
        colors={['rgba(0,245,196,0.04)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={styles.deviceInfo}>
          <ConnectionPulse connected={isConnected} scanning={isConnecting} size={10} />
          <View style={styles.deviceText}>
            <Text style={styles.deviceName} numberOfLines={1}>{device.name}</Text>
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <Pressable onPress={handlePickImage} style={styles.watchImageContainer}>
          {device.watchImageUri ? (
            <Image
              source={{ uri: device.watchImageUri }}
              style={styles.watchImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.watchImagePlaceholder}>
              <Watch size={28} color={Colors.neon} />
            </View>
          )}
          <View style={styles.editBadge}>
            <Camera size={10} color={Colors.bg} />
          </View>
        </Pressable>
      </View>

      <View style={styles.uuidSection}>
        <Text style={styles.uuidLabel}>Service UUID</Text>
        <Text style={styles.uuidValue} numberOfLines={1}>{device.serviceUUID || '—'}</Text>
      </View>

      <View style={styles.actions}>
        {isConnected ? (
          <>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.syncBtn, pressed && { opacity: 0.8 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSync();
              }}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator size="small" color={Colors.bg} />
              ) : (
                <RefreshCw size={16} color={Colors.bg} />
              )}
              <Text style={styles.syncBtnText}>{syncing ? 'Syncing...' : 'Sync'}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.findBtn, pressed && { opacity: 0.8 }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onFindPhone();
              }}
            >
              <Smartphone size={16} color={Colors.accent} />
              <Text style={[styles.syncBtnText, { color: Colors.accent }]}>Find</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.disconnectBtn, pressed && { opacity: 0.8 }]}
              onPress={onDisconnect}
            >
              <BluetoothOff size={16} color={Colors.textSecondary} />
            </Pressable>
          </>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.connectBtn, pressed && { opacity: 0.85 }]}
            onPress={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color={Colors.bg} />
            ) : (
              <Bluetooth size={16} color={Colors.bg} />
            )}
            <Text style={styles.connectBtnText}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Text>
          </Pressable>
        )}
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  statusText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  watchImageContainer: {
    position: 'relative',
  },
  watchImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neonBorder,
  },
  watchImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.neonDim,
    borderWidth: 1,
    borderColor: Colors.neonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.neon,
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uuidSection: {
    backgroundColor: Colors.bg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uuidLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  uuidValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.neon,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  syncBtn: {
    flex: 1,
    backgroundColor: Colors.neon,
    justifyContent: 'center',
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  findBtn: {
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  disconnectBtn: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  syncBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.bg,
  },
  connectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.neon,
    borderRadius: 10,
    shadowColor: Colors.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  connectBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.bg,
  },
});
