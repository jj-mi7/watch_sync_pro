import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import type { ConnectionStatus } from "@/types";
import type React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface WatchCardProps {
  watchName: string;
  photoUri?: string;
  connectionStatus: ConnectionStatus;
  batteryLevel: number;
  lastSyncTime?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  disconnected: { label: "DISCONNECTED", color: Colors.error },
  scanning: { label: "SCANNING...", color: Colors.warning },
  connecting: { label: "CONNECTING...", color: Colors.warning },
  connected: { label: "CONNECTED", color: Colors.success },
  syncing: { label: "SYNCING...", color: Colors.info },
};

export const WatchCard: React.FC<WatchCardProps> = ({
  watchName,
  photoUri,
  connectionStatus,
  batteryLevel,
  lastSyncTime,
  onPress,
  style,
}) => {
  const status = statusConfig[connectionStatus];

  return (
    <Animated.View entering={FadeInUp.duration(500)}>
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.row}>
          <View style={styles.imageContainer}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.watchImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderIcon}>⌚</Text>
              </View>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.watchName}>{watchName || "No Watch"}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>🔋 {batteryLevel}%</Text>
              {lastSyncTime && <Text style={styles.metaText}>⟳ {lastSyncTime}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.batteryBar}>
          <View
            style={[
              styles.batteryFill,
              {
                width: `${Math.min(batteryLevel, 100)}%`,
                backgroundColor:
                  batteryLevel > 50
                    ? Colors.success
                    : batteryLevel > 20
                      ? Colors.warning
                      : Colors.error,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
  },
  watchImage: {
    width: 72,
    height: 72,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  watchName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...Typography.label,
    fontSize: 10,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  batteryBar: {
    height: 3,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  batteryFill: {
    height: 3,
    borderRadius: 2,
  },
});
