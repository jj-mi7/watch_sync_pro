import { Buffer } from "buffer";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import {
  addSyncLog,
  clearSyncLogs,
  setConnectionStatus,
  setDevice,
  setLastSyncTime,
} from "@/redux/slices/deviceSlice";
import { addDailyRecord, setTodaySteps, unlockBadge } from "@/redux/slices/healthSlice";
import type { RootState } from "@/redux/store";
import { NotificationService } from "@/services/notifications/NotificationService";
import { calculateActiveMinutes, calculateCalories, calculateDistanceKm } from "@/utils/healthMath";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, PermissionsAndroid, Platform, Text, View } from "react-native";
import { BleManager, State as BleState } from "react-native-ble-plx";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  cancelAnimation,
  interpolate,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { moderateScale } from "react-native-size-matters";
import { useDispatch, useSelector } from "react-redux";

// ─── CASIO BLE CONSTANTS ─────────────────────────────────────────────────────
const SERVICE_UUID = "26eb000d-b012-49a8-b1f8-394fb2032b0f";
const SYS_WRITE_NO_RESP = "26eb002c-b012-49a8-b1f8-394fb2032b0f";
const SYS_NOTIFY_AND_WRITE = "26eb002d-b012-49a8-b1f8-394fb2032b0f";
const FILE_WRITE_AND_NOTIFY = "26eb0023-b012-49a8-b1f8-394fb2032b0f";
const FILE_DATA_DUMP = "26eb0024-b012-49a8-b1f8-394fb2032b0f";

const bleManager = new BleManager();

// ─── Pulse Ring Component ────────────────────────────────────────────────────
const PulseRing: React.FC<{
  delay: number;
  color: string;
  size: number;
}> = ({ delay, color, size }) => {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.4, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, [delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    position: "absolute" as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: color,
  }));

  return <Animated.View style={animatedStyle} />;
};

export const SyncScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const { connectionStatus, syncLogs, device } = useSelector((state: RootState) => state.device);
  const user = useSelector((state: RootState) => state.user);
  const { badges } = useSelector((state: RootState) => state.health);
  const { dailyStepGoal } = useSelector((state: RootState) => state.settings);
  // biome-ignore lint/suspicious/noExplicitAny: BleDevice type not imported yet
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasError, setHasError] = useState(false);

  const sysSubRef = useRef<import("react-native-ble-plx").Subscription | null>(null);
  const fileCmdSubRef = useRef<import("react-native-ble-plx").Subscription | null>(null);
  const fileDataSubRef = useRef<import("react-native-ble-plx").Subscription | null>(null);
  const fileBuffer = useRef("");
  const expectedFileBytes = useRef(0);
  const fileReceiveResolve = useRef<(() => void) | null>(null);

  // Animation values
  const successScale = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const syncRotation = useSharedValue(0);

  useEffect(() => {
    // Reset stale connection state on mount (e.g. from persist across app restart)
    if (connectionStatus === "scanning" || connectionStatus === "connecting") {
      dispatch(setConnectionStatus("disconnected"));
    }
    return () => {
      sysSubRef.current?.remove();
      fileCmdSubRef.current?.remove();
      fileDataSubRef.current?.remove();
    };
  }, []);

  // Start/stop sync rotation animation
  useEffect(() => {
    if (connectionStatus === "syncing") {
      syncRotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(syncRotation);
      syncRotation.value = withTiming(0, { duration: 300 });
    }
  }, [connectionStatus, syncRotation]);

  // Success animation
  useEffect(() => {
    if (connectionStatus === "connected" && !isSyncing) {
      successScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, { damping: 8, stiffness: 100 }),
      );
    }
  }, [connectionStatus, isSyncing, successScale]);

  // Error animation shake
  useEffect(() => {
    if (hasError) {
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      const timer = setTimeout(() => setHasError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasError, errorShake]);

  const successAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  const errorAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const syncAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${syncRotation.value}deg` }],
  }));

  const addLog = useCallback(
    (type: string, msg: string) => {
      const time = new Date().toLocaleTimeString("en-US", {
        hour12: false,
      });
      dispatch(addSyncLog({ time, type, msg }));
    },
    [dispatch],
  );

  const bcdByte = useCallback((hexStr: string): number => {
    const b = Number.parseInt(hexStr, 16);
    return (b >> 4) * 10 + (b & 0x0f);
  }, []);

  const parseSystemHex = useCallback(
    (hex: string) => {
      if (!hex) return;
      const cmd = hex.substring(0, 2);
      if (cmd !== "28" && cmd !== "11") addLog("SYS_RX", `[${cmd}] ${hex}`);
    },
    [addLog],
  );

  const parseFileCommandHex = useCallback(
    (hex: string) => {
      if (!hex) return;
      const cmd = hex.substring(0, 2);
      addLog("FILE_CMD", `[${cmd}] ${hex}`);
      if (cmd === "00" && hex.length >= 8 && hex.substring(2, 4) === "11") {
        const sizeLE = hex.substring(4, 8);
        const size = Number.parseInt(sizeLE[2] + sizeLE[3] + sizeLE[0] + sizeLE[1], 16);
        expectedFileBytes.current = size;
        addLog("FILE_CMD", `File ready: ${size} bytes expected`);
      }
    },
    [addLog],
  );

  const parseFileDataHex = useCallback(
    (hex: string) => {
      if (!hex) return;
      fileBuffer.current += hex;
      const receivedBytes = fileBuffer.current.length / 2;
      addLog(
        "FILE_DATA",
        `+${hex.length / 2}B  (total ${receivedBytes}B / ${expectedFileBytes.current}B)`,
      );

      const gotAll =
        expectedFileBytes.current > 0
          ? receivedBytes >= expectedFileBytes.current
          : receivedBytes >= 12;
      if (!gotAll) return;

      const buf = fileBuffer.current;
      if (buf.length < 12) {
        addLog("ERR", "File data too short");
        return;
      }

      const year = 2000 + bcdByte(buf.substring(0, 2));
      const month = bcdByte(buf.substring(2, 4));
      const day = bcdByte(buf.substring(4, 6));
      addLog(
        "PARSE",
        `Header Date: ${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      );

      const dataHex = buf.substring(12);
      const recordCount = Math.floor(dataHex.length / 32);

      let finalSteps = 0;
      let latestNonZero = 0;

      for (let i = 0; i < recordCount; i++) {
        const record = dataHex.substring(i * 32, i * 32 + 32);
        const stepsLE = record.substring(0, 4);
        const steps = Number.parseInt(stepsLE[2] + stepsLE[3] + stepsLE[0] + stepsLE[1], 16);

        if (steps !== 0xffff && steps !== 0xfffe) {
          if (steps > 0) latestNonZero = steps;
          if (i === recordCount - 1) finalSteps = steps;

          if (steps > 0 || i === recordCount - 1) {
            addLog("DAY_RECORD", `Day -${recordCount - 1 - i}: ${steps.toLocaleString()} steps`);

            // Store in Redux history
            const recordDate = new Date(year, month - 1, day);
            recordDate.setDate(recordDate.getDate() + i - (recordCount - 1));
            dispatch(
              addDailyRecord({
                date: recordDate.toISOString().split("T")[0],
                steps,
                calories: calculateCalories(steps, user.weightKg, user.heightCm, user.gender),
                distanceKm: calculateDistanceKm(steps, user.heightCm, user.gender),
                activeMinutes: calculateActiveMinutes(steps),
              }),
            );
          }
        }
      }

      const displaySteps = finalSteps > 0 ? finalSteps : latestNonZero;
      addLog(
        "STEPS",
        `Parsed Today: ${finalSteps.toLocaleString()} | Display: ${displaySteps.toLocaleString()}`,
      );
      dispatch(
        setTodaySteps({
          steps: displaySteps,
          heightCm: user.heightCm,
          weightKg: user.weightKg,
          gender: user.gender,
        }),
      );
      dispatch(setLastSyncTime(new Date().toLocaleTimeString("en-US", { hour12: false })));

      // Check Gamification
      const dist = calculateDistanceKm(displaySteps, user.heightCm, user.gender);
      const active = calculateActiveMinutes(displaySteps);

      for (const b of badges) {
        if (b.unlockedAt) continue;
        let earned = false;
        if (b.id === "steps_5k" && displaySteps >= 5000) earned = true;
        if (b.id === "steps_10k" && displaySteps >= 10000) earned = true;
        if (b.id === "steps_20k" && displaySteps >= 20000) earned = true;
        if (b.id === "dist_5k" && dist >= 5) earned = true;
        if (b.id === "active_30m" && active >= 30) earned = true;

        if (earned) {
          dispatch(unlockBadge(b.id));
          NotificationService.displayGoalNotification(
            "New Milestone! 🏆",
            `You earned the ${b.name} badge: ${b.description}`,
          );
        }
      }

      // Check daily goal proximity
      const stepsRemaining = dailyStepGoal - displaySteps;
      if (stepsRemaining > 0 && stepsRemaining <= 1000) {
        NotificationService.displayGoalNotification(
          "Almost there! 🎯",
          `You are only ${stepsRemaining.toLocaleString()} steps away from your daily goal!`,
        );
      } else if (stepsRemaining <= 0 && displaySteps - finalSteps < dailyStepGoal) {
        NotificationService.displayGoalNotification(
          "Goal Reached! 🌟",
          `Congratulations! You've reached your daily goal of ${dailyStepGoal.toLocaleString()} steps.`,
        );
      }

      fileBuffer.current = "";
      expectedFileBytes.current = 0;
      if (fileReceiveResolve.current) {
        fileReceiveResolve.current();
        fileReceiveResolve.current = null;
      }
    },
    [addLog, dispatch, bcdByte, user, badges, dailyStepGoal],
  );

  const sendToWatch = async (
    // biome-ignore lint/suspicious/noExplicitAny: BleDevice type not imported yet
    targetDevice: any,
    characteristic: string,
    hex: string,
    withResponse: boolean,
  ) => {
    if (!targetDevice) return;
    try {
      const b64 = Buffer.from(hex, "hex").toString("base64");
      if (withResponse) {
        await targetDevice.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          characteristic,
          b64,
        );
      } else {
        await targetDevice.writeCharacteristicWithoutResponseForService(
          SERVICE_UUID,
          characteristic,
          b64,
        );
      }
      addLog(characteristic === FILE_WRITE_AND_NOTIFY ? "FILE_TX" : "TX", `→ ${hex}`);
    } catch (e: unknown) {
      addLog("ERR", `Write fail: ${e instanceof Error ? e.message : String(e)}`);
      throw e;
    }
  };

  const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  // biome-ignore lint/suspicious/noExplicitAny: BleDevice type not imported yet
  const syncSequence = async (overrideDevice?: any) => {
    const dev = overrideDevice || connectedDevice;
    if (!dev || isSyncing) return;

    setIsSyncing(true);
    setHasError(false);
    dispatch(setConnectionStatus("syncing"));
    fileBuffer.current = "";
    expectedFileBytes.current = 0;
    addLog("SYS", "── COMMENCING DATA PULL ──");

    const sysCmd = async (h: string) => {
      await sendToWatch(dev, SYS_WRITE_NO_RESP, h, false);
      await delay(400);
    };
    const sysReq = async (h: string) => {
      await sendToWatch(dev, SYS_NOTIFY_AND_WRITE, h, true);
      await delay(600);
    };
    const fileReq = async (h: string) => {
      await sendToWatch(dev, FILE_WRITE_AND_NOTIFY, h, true);
      await delay(1000);
    };

    try {
      await sysCmd("22");
      await sysCmd("10");
      await sysReq("23434153494f2041424c2d313030574500000000");
      await sysCmd("26");

      addLog("SYS", "Requesting step file (type 0x11)…");

      const dataReceived = new Promise<void>((resolve) => {
        fileReceiveResolve.current = resolve;
      });

      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<void>((resolve) => {
        timeoutId = setTimeout(() => {
          addLog("WARN", "File transfer timeout – parsing what we have");
          resolve();
        }, 8000);
      });

      await fileReq("0011000000");
      await Promise.race([dataReceived, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      await fileReq("0411000000");
      addLog("SYS", "── SYNC COMPLETE ──");
      dispatch(setConnectionStatus("connected"));
    } catch (e: unknown) {
      addLog("ERR", `Sync aborted: ${e instanceof Error ? e.message : String(e)}`);
      dispatch(setConnectionStatus("connected"));
      setHasError(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const startScan = async () => {
    dispatch(clearSyncLogs());
    dispatch(setConnectionStatus("scanning"));
    setHasError(false);
    addLog("SYS", "Checking Bluetooth…");

    // Request BLE permissions on Android
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        const allGranted = Object.values(granted).every(
          (v) => v === PermissionsAndroid.RESULTS.GRANTED,
        );
        if (!allGranted) {
          addLog("ERR", "Bluetooth permissions not granted");
          dispatch(setConnectionStatus("disconnected"));
          setHasError(true);
          Alert.alert(
            "Permission Required",
            "Bluetooth and Location permissions are needed to scan for your watch.",
          );
          return;
        }
      } catch (e) {
        addLog("ERR", "Permission request failed");
        dispatch(setConnectionStatus("disconnected"));
        setHasError(true);
        return;
      }
    }

    const state = await bleManager.state();
    if (state !== BleState.PoweredOn) {
      addLog("ERR", `Bluetooth is ${state}. Please enable it.`);
      dispatch(setConnectionStatus("disconnected"));
      setHasError(true);
      Alert.alert(
        "Bluetooth Off",
        "Please enable Bluetooth in your device settings to connect to your watch.",
      );
      return;
    }

    addLog("SYS", "Scanning (30s timeout)…");

    // 30-second scan timeout
    const scanTimeout = setTimeout(() => {
      bleManager.stopDeviceScan();
      addLog("WARN", "Scan timed out after 30 seconds");
      dispatch(setConnectionStatus("disconnected"));
      setHasError(true);
    }, 30000);

    bleManager.startDeviceScan(null, { allowDuplicates: false }, async (error, scanDevice) => {
      if (error) {
        clearTimeout(scanTimeout);
        addLog("ERR", `Scan error: ${error.message}`);
        setHasError(true);
        dispatch(setConnectionStatus("disconnected"));
        return;
      }
      if (scanDevice?.name?.includes("CASIO") || scanDevice?.id === "CF:76:44:C4:B8:14") {
        clearTimeout(scanTimeout);
        bleManager.stopDeviceScan();
        dispatch(setConnectionStatus("connecting"));
        addLog("SYS", `Found: ${scanDevice.name || scanDevice.id}`);
        try {
          const connected = await scanDevice.connect();
          await connected.discoverAllServicesAndCharacteristics();
          setConnectedDevice(connected);
          dispatch(setConnectionStatus("connected"));
          dispatch(
            setDevice({
              id: scanDevice.id,
              name: scanDevice.name || "CASIO ABL-100WE",
              type: "casio",
              batteryLevel: 85,
            }),
          );
          addLog("SYS", "GATT resolved – subscribing…");

          sysSubRef.current = connected.monitorCharacteristicForService(
            SERVICE_UUID,
            SYS_NOTIFY_AND_WRITE,
            (err, char) => {
              if (char?.value) parseSystemHex(Buffer.from(char.value, "base64").toString("hex"));
            },
          );
          fileCmdSubRef.current = connected.monitorCharacteristicForService(
            SERVICE_UUID,
            FILE_WRITE_AND_NOTIFY,
            (err, char) => {
              if (char?.value)
                parseFileCommandHex(Buffer.from(char.value, "base64").toString("hex"));
            },
          );
          fileDataSubRef.current = connected.monitorCharacteristicForService(
            SERVICE_UUID,
            FILE_DATA_DUMP,
            (err, char) => {
              if (char?.value) parseFileDataHex(Buffer.from(char.value, "base64").toString("hex"));
            },
          );

          await delay(1500);
          addLog("SYS", "READY – Auto-pulling data...");
          syncSequence(connected);
        } catch (e: unknown) {
          addLog("ERR", `Connection failed: ${e instanceof Error ? e.message : String(e)}`);
          dispatch(setConnectionStatus("disconnected"));
          setHasError(true);
        }
      }
    });
  };

  const getStatusLabel = (): string => {
    if (hasError) return "Connection Failed";
    switch (connectionStatus) {
      case "disconnected":
        return "Not Connected";
      case "scanning":
        return "Scanning for Watch…";
      case "connecting":
        return "Connecting…";
      case "connected":
        return isSyncing ? "Syncing Data…" : "Connected";
      case "syncing":
        return "Syncing Data…";
      default:
        return "Not Connected";
    }
  };

  const getStatusColor = (): string => {
    if (hasError) return theme.colors.error;
    switch (connectionStatus) {
      case "connected":
        return theme.colors.success;
      case "syncing":
        return theme.colors.info;
      case "scanning":
      case "connecting":
        return theme.colors.warning;
      default:
        return theme.colors.textTertiary;
    }
  };

  const isScanning = connectionStatus === "scanning" || connectionStatus === "connecting";
  const isConnected = connectionStatus === "connected" || connectionStatus === "syncing";

  return (
    <ScreenWrapper scrollable={false} padded={true}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Watch</Text>
        <View
          style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
        />
      </Animated.View>

      {/* Central Status Area */}
      <View style={styles.statusArea}>
        {/* Scanning Animation */}
        {isScanning && !hasError && (
          <View style={styles.pulseContainer}>
            <PulseRing delay={0} color={theme.colors.warning} size={180} />
            <PulseRing delay={600} color={theme.colors.warning} size={180} />
            <PulseRing delay={1200} color={theme.colors.warning} size={180} />
            <View style={styles.centerIcon}>
              <Text style={styles.centerEmoji}>⌚</Text>
            </View>
          </View>
        )}

        {/* Connected State */}
        {isConnected && !hasError && !isSyncing && (
          <Animated.View style={[styles.successContainer, successAnimStyle]}>
            <View style={[styles.successCircle, { borderColor: theme.colors.success }]}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
          </Animated.View>
        )}

        {/* Syncing Animation */}
        {(connectionStatus === "syncing" || isSyncing) && !hasError && (
          <View style={styles.syncContainer}>
            <Animated.View style={[styles.syncRing, syncAnimStyle]}>
              <View style={[styles.syncArc, { borderColor: theme.colors.info }]} />
            </Animated.View>
            <Text style={styles.centerEmoji}>⟳</Text>
          </View>
        )}

        {/* Error State */}
        {hasError && (
          <Animated.View style={[styles.errorContainer, errorAnimStyle]}>
            <View style={[styles.errorCircle, { borderColor: theme.colors.error }]}>
              <Text style={styles.errorX}>✕</Text>
            </View>
          </Animated.View>
        )}

        {/* Disconnected / Idle */}
        {connectionStatus === "disconnected" && !hasError && (
          <View style={styles.idleContainer}>
            <View style={[styles.idleCircle, { borderColor: theme.colors.surfaceBorder }]}>
              <Text style={styles.idleEmoji}>⌚</Text>
            </View>
          </View>
        )}

        {/* Status Label */}
        <Text style={[styles.statusLabel, { color: getStatusColor() }]}>
          {getStatusLabel()}
        </Text>
        <Text style={styles.statusHint}>
          {hasError
            ? "Check Bluetooth is enabled and watch is nearby"
            : connectionStatus === "disconnected"
              ? "Tap below to scan & connect"
              : isConnected && !isSyncing
                ? device?.name || "CASIO ABL-100WE"
                : ""}
        </Text>
      </View>

      {/* Device Info (when connected) */}
      {isConnected && device && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.deviceInfo}>
          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoLabel}>Device</Text>
            <Text style={styles.deviceInfoValue}>{device.name}</Text>
          </View>
          <View style={styles.deviceInfoRow}>
            <Text style={styles.deviceInfoLabel}>Battery</Text>
            <Text style={styles.deviceInfoValue}>{device.batteryLevel}%</Text>
          </View>
          {device.lastSyncTime && (
            <View style={styles.deviceInfoRow}>
              <Text style={styles.deviceInfoLabel}>Last Sync</Text>
              <Text style={styles.deviceInfoValue}>{device.lastSyncTime}</Text>
            </View>
          )}
        </Animated.View>
      )}

      <View style={styles.bottomActions}>
        <NeoButton
          title={
            isSyncing
              ? "SYNCING…"
              : connectedDevice
                ? "SYNC NOW"
                : hasError
                  ? "RETRY"
                  : isScanning
                    ? "SCANNING…"
                    : "SCAN & CONNECT"
          }
          onPress={() => {
            if (hasError) {
              setHasError(false);
              startScan();
            } else if (connectedDevice) {
              syncSequence();
            } else {
              startScan();
            }
          }}
          color={
            hasError
              ? theme.colors.error
              : connectedDevice
                ? theme.colors.success
                : theme.colors.info
          }
          disabled={isSyncing || isScanning}
          size="lg"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  statusDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
  },
  statusArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Pulse scanning
  pulseContainer: {
    width: moderateScale(160),
    height: moderateScale(160),
    justifyContent: "center",
    alignItems: "center",
  },
  centerIcon: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.warning,
    justifyContent: "center",
    alignItems: "center",
  },
  centerEmoji: {
    fontSize: 32,
  },
  // Connected success
  successContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  successCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 3,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  successCheck: {
    fontSize: 48,
    color: theme.colors.success,
    fontWeight: "800",
  },
  // Syncing
  syncContainer: {
    width: moderateScale(100),
    height: moderateScale(100),
    justifyContent: "center",
    alignItems: "center",
  },
  syncRing: {
    position: "absolute",
    width: moderateScale(100),
    height: moderateScale(100),
    justifyContent: "center",
    alignItems: "center",
  },
  syncArc: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 3,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  // Error
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 3,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  errorX: {
    fontSize: 48,
    color: theme.colors.error,
    fontWeight: "800",
  },
  // Idle
  idleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  idleCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 2,
    borderStyle: "dashed",
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  idleEmoji: {
    fontSize: 48,
    opacity: 0.4,
  },
  // Labels
  statusLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: theme.spacing.xl,
  },
  statusHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },
  // Device Info
  deviceInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginBottom: theme.spacing.lg,
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.xs,
  },
  deviceInfoLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
  },
  deviceInfoValue: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textPrimary,
    fontWeight: "700",
  },
  bottomActions: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
}));
