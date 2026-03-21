import { GlassCard } from "@/components/cards/GlassCard";
import { moderateScale } from "react-native-size-matters";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { setDevice, setWatchPhoto } from "@/redux/slices/deviceSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

export const WatchProfileScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  // biome-ignore lint/suspicious/noExplicitAny: Root stack param list not fully enforced yet
  const navigation = useNavigation<any>();
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
        <GlassCard style={styles.photoCard}>
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
            color={theme.colors.secondary}
            size="md"
            style={styles.changePhotoBtn}
          />
        </GlassCard>
      </Animated.View>

      {/* Device Info */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <GlassCard style={styles.infoCard}>
          <Text style={styles.sectionLabel}>DEVICE INFORMATION</Text>

          <InfoRow label="Model" value={device?.name || "CASIO ABL-100WE"} />
          <InfoRow label="Type" value={device?.type?.toUpperCase() || "CASIO"} />
          <InfoRow label="Device ID" value={device?.id || "casio-abl-100we"} />
          <InfoRow
            label="Status"
            value={connectionStatus.toUpperCase()}
            valueColor={
              connectionStatus === "connected" ? theme.colors.success : theme.colors.textTertiary
            }
          />
          <InfoRow label="Battery" value={`${device?.batteryLevel ?? 85}%`} />
          <InfoRow label="Last Sync" value={device?.lastSyncTime || "Never"} />
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <NeoButton
          title="SYNC DATA"
          onPress={() => navigation.navigate("Sync")}
          color={theme.colors.primary}
          size="lg"
          style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl }}
        />
      </Animated.View>

    </ScreenWrapper>
  );
};

const InfoRow: React.FC<{ label: string; value: string; valueColor?: string }> = ({
  label,
  value,
  valueColor,
}) => {
  const { theme } = useUnistyles();
  const infoStyles = infoStylesDef(theme);
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
};



const infoStylesDef = (theme: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceLight,
    },
    label: {
      fontSize: theme.fontSize.caption,
      color: theme.colors.textTertiary,
    },
    value: {
      fontSize: theme.fontSize.caption,
      color: theme.colors.textPrimary,
      fontWeight: "700",
    },
  });

const styles = StyleSheet.create((theme) => ({
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  photoCard: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  photoContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(16),
    overflow: "hidden",
    marginBottom: theme.spacing.lg,
  },
  watchPhoto: {
    width: moderateScale(80),
    height: moderateScale(80),
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: moderateScale(80),
    height: moderateScale(80),
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.surfaceBorder,
    borderStyle: "dashed",
    borderRadius: moderateScale(24),
  },
  photoPlaceholderIcon: {
    fontSize: moderateScale(24),
    marginBottom: moderateScale(2),
  },
  photoPlaceholderText: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
  },
  changePhotoBtn: {
    alignSelf: "stretch",
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    marginBottom: theme.spacing.xl,
  },
  supportText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
  },
  deviceList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
}));
