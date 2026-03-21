import { GlassCard } from "@/components/cards/GlassCard";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import { setDevice, setWatchPhoto } from "@/redux/slices/deviceSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export const WatchProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { device, connectionStatus } = useSelector((state: RootState) => state.device);

  const handlePickImage = () => {
    Alert.alert("Upload Watch Photo", "Choose a source", [
      {
        text: "Camera",
        onPress: () => {
          launchCamera({ mediaType: "photo", quality: 0.8, maxWidth: 600 }, (response) => {
            if (response.assets?.[0]?.uri) {
              ensureDevice();
              dispatch(setWatchPhoto(response.assets[0].uri));
            }
          });
        },
      },
      {
        text: "Gallery",
        onPress: () => {
          launchImageLibrary({ mediaType: "photo", quality: 0.8, maxWidth: 600 }, (response) => {
            if (response.assets?.[0]?.uri) {
              ensureDevice();
              dispatch(setWatchPhoto(response.assets[0].uri));
            }
          });
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const ensureDevice = () => {
    if (!device) {
      dispatch(
        setDevice({
          id: "casio-abl-100we",
          name: "CASIO ABL-100WE",
          type: "casio",
          batteryLevel: 85,
        }),
      );
    }
  };

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Watch Profile</Text>
      </Animated.View>

      {/* Photo Section */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <GlassCard glowColor={Colors.secondary} style={styles.photoCard}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
            <View style={styles.photoContainer}>
              {device?.photoUri ? (
                <Image source={{ uri: device.photoUri }} style={styles.watchPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderIcon}>📸</Text>
                  <Text style={styles.photoPlaceholderText}>TAP TO UPLOAD</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <NeoButton
            title="CHANGE PHOTO"
            onPress={handlePickImage}
            variant="outline"
            color={Colors.secondary}
            size="md"
            style={styles.changePhotoBtn}
          />
        </GlassCard>
      </Animated.View>

      {/* Device Info */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <GlassCard glowColor={Colors.primary} style={styles.infoCard}>
          <Text style={styles.sectionLabel}>DEVICE INFORMATION</Text>

          <InfoRow label="Model" value={device?.name || "CASIO ABL-100WE"} />
          <InfoRow label="Type" value={device?.type?.toUpperCase() || "CASIO"} />
          <InfoRow label="Device ID" value={device?.id || "casio-abl-100we"} />
          <InfoRow
            label="Status"
            value={connectionStatus.toUpperCase()}
            valueColor={connectionStatus === "connected" ? Colors.success : Colors.textTertiary}
          />
          <InfoRow label="Battery" value={`${device?.batteryLevel ?? 85}%`} />
          <InfoRow label="Last Sync" value={device?.lastSyncTime || "Never"} />
        </GlassCard>
      </Animated.View>

      {/* Supported Devices */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <GlassCard glowColor={Colors.chartGreen} style={styles.infoCard}>
          <Text style={styles.sectionLabel}>SUPPORTED DEVICES</Text>
          <Text style={styles.supportText}>Currently supported:</Text>
          <View style={styles.deviceList}>
            <DeviceTag name="CASIO ABL-100WE" active />
            <DeviceTag name="Mi Band" />
            <DeviceTag name="Fitbit" />
            <DeviceTag name="Generic BLE" />
          </View>
        </GlassCard>
      </Animated.View>
    </ScreenWrapper>
  );
};

const InfoRow: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor,
}) => (
  <View style={infoStyles.row}>
    <Text style={infoStyles.label}>{label}</Text>
    <Text style={[infoStyles.value, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
  </View>
);

const DeviceTag: React.FC<{ name: string; active?: boolean }> = ({ name, active }) => (
  <View style={[tagStyles.tag, active && tagStyles.activeTag]}>
    <Text style={[tagStyles.text, active && tagStyles.activeText]}>{name}</Text>
    {!active && <Text style={tagStyles.soon}>SOON</Text>}
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  label: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  value: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
});

const tagStyles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  activeTag: {
    borderColor: Colors.success,
    backgroundColor: `${Colors.success}15`,
  },
  text: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  activeText: {
    color: Colors.success,
  },
  soon: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.textDisabled,
    marginLeft: 6,
  },
});

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  photoCard: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  photoContainer: {
    width: 200,
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  watchPhoto: {
    width: 200,
    height: 200,
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    borderStyle: "dashed",
    borderRadius: 24,
  },
  photoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  photoPlaceholderText: {
    ...Typography.label,
    color: Colors.textTertiary,
  },
  changePhotoBtn: {
    alignSelf: "stretch",
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  supportText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  deviceList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
