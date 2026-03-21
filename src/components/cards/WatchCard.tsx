import type { ConnectionStatus } from "@/types";
import type React from "react";
import { Image, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface WatchCardProps {
  watchName: string;
  photoUri?: string;
  connectionStatus: ConnectionStatus;
  batteryLevel: number;
  lastSyncTime?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const getStatusConfig = (
  status: ConnectionStatus,
  theme: ReturnType<typeof useUnistyles>["theme"],
) => {
  const map: Record<ConnectionStatus, { label: string; color: string }> = {
    disconnected: { label: "DISCONNECTED", color: theme.colors.error },
    scanning: { label: "SCANNING...", color: theme.colors.warning },
    connecting: { label: "CONNECTING...", color: theme.colors.warning },
    connected: { label: "CONNECTED", color: theme.colors.success },
    syncing: { label: "SYNCING...", color: theme.colors.info },
  };
  return map[status];
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
  const { theme } = useUnistyles();
  const status = getStatusConfig(connectionStatus, theme);

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
                    ? theme.colors.success
                    : batteryLevel > 20
                      ? theme.colors.warning
                      : theme.colors.error,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
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
    marginRight: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceLight,
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
    backgroundColor: theme.colors.surfaceLight,
  },
  placeholderIcon: {
    fontSize: theme.fontSize.stat,
  },
  info: {
    flex: 1,
  },
  watchName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.textPrimary,
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
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
  },
  batteryBar: {
    height: 3,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 2,
    marginTop: theme.spacing.md,
    overflow: "hidden",
  },
  batteryFill: {
    height: 3,
    borderRadius: 2,
  },
}));
