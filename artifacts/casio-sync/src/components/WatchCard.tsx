import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radii, Spacing, Typography } from '../theme';
import type { WatchDevice } from '../types';

interface WatchCardProps {
  device: WatchDevice;
  onPress: () => void;
  onPhotoPress: () => void;
  isSyncing: boolean;
  lastSynced?: number;
}

export const WatchCard: React.FC<WatchCardProps> = ({
  device,
  onPress,
  onPhotoPress,
  isSyncing,
  lastSynced,
}) => {
  const syncLabel = lastSynced
    ? `Last synced: ${new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Never synced';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, device.connected && styles.connected]}
    >
      <TouchableOpacity onPress={onPhotoPress} style={styles.photoArea}>
        {device.photoUri ? (
          <Image source={{ uri: device.photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>⌚</Text>
            <Text style={[Typography.caption, styles.photoHint]}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[Typography.h4, styles.name]}>{device.name}</Text>
          <View style={[styles.statusDot, device.connected && styles.statusDotOn]} />
        </View>
        <Text style={[Typography.bodySmall, styles.model]}>{device.brand} · {device.model}</Text>
        <Text style={[Typography.caption, styles.syncTime]}>{syncLabel}</Text>
        {device.rssi !== undefined && (
          <Text style={[Typography.caption, styles.rssi]}>
            Signal: {device.rssi} dBm
          </Text>
        )}
      </View>

      <View style={styles.badge}>
        <Text style={[Typography.caption, device.connected ? styles.badgeOn : styles.badgeOff]}>
          {device.connected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  connected: {
    borderColor: Colors.primary,
  },
  photoArea: {
    width: 64,
    height: 64,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  photoIcon: {
    fontSize: 24,
  },
  photoHint: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    color: Colors.text,
  },
  model: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  syncTime: {
    color: Colors.textMuted,
    marginTop: 4,
  },
  rssi: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  statusDotOn: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceElevated,
  },
  badgeOn: {
    color: Colors.green,
  },
  badgeOff: {
    color: Colors.textMuted,
  },
});
