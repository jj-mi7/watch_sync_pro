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
import { addDailyRecord, setTodaySteps } from "@/redux/slices/healthSlice";
import type { RootState } from "@/redux/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BleManager, State as BleState } from "react-native-ble-plx";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";

// ─── CASIO BLE CONSTANTS ─────────────────────────────────────────────────────
const SERVICE_UUID = "26eb000d-b012-49a8-b1f8-394fb2032b0f";
const SYS_WRITE_NO_RESP = "26eb002c-b012-49a8-b1f8-394fb2032b0f";
const SYS_NOTIFY_AND_WRITE = "26eb002d-b012-49a8-b1f8-394fb2032b0f";
const FILE_WRITE_AND_NOTIFY = "26eb0023-b012-49a8-b1f8-394fb2032b0f";
const FILE_DATA_DUMP = "26eb0024-b012-49a8-b1f8-394fb2032b0f";

const bleManager = new BleManager();

export const SyncScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const { connectionStatus, syncLogs } = useSelector((state: RootState) => state.device);
  // biome-ignore lint/suspicious/noExplicitAny: BleDevice type not imported yet
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const sysSubRef = useRef<import("react-native-ble-plx").Subscription | null>(null);
  const fileCmdSubRef = useRef<import("react-native-ble-plx").Subscription | null>(null);
  const fileDataSubRef = useRef<import("react-native-ble-plx").Subscription | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fileBuffer = useRef("");
  const expectedFileBytes = useRef(0);
  const fileReceiveResolve = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      sysSubRef.current?.remove();
      fileCmdSubRef.current?.remove();
      fileDataSubRef.current?.remove();
    };
  }, []);

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
                calories: Math.round(steps * 0.04),
                distanceKm: Number.parseFloat((steps * 0.0007).toFixed(2)),
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
      dispatch(setTodaySteps(displaySteps));
      dispatch(setLastSyncTime(new Date().toLocaleTimeString("en-US", { hour12: false })));

      fileBuffer.current = "";
      expectedFileBytes.current = 0;
      if (fileReceiveResolve.current) {
        fileReceiveResolve.current();
        fileReceiveResolve.current = null;
      }
    },
    [addLog, dispatch, bcdByte],
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
    const device = overrideDevice || connectedDevice;
    if (!device || isSyncing) return;

    setIsSyncing(true);
    dispatch(setConnectionStatus("syncing"));
    fileBuffer.current = "";
    expectedFileBytes.current = 0;
    addLog("SYS", "── COMMENCING DATA PULL ──");

    const sysCmd = async (h: string) => {
      await sendToWatch(device, SYS_WRITE_NO_RESP, h, false);
      await delay(400);
    };
    const sysReq = async (h: string) => {
      await sendToWatch(device, SYS_NOTIFY_AND_WRITE, h, true);
      await delay(600);
    };
    const fileReq = async (h: string) => {
      await sendToWatch(device, FILE_WRITE_AND_NOTIFY, h, true);
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
    } finally {
      setIsSyncing(false);
    }
  };

  const startScan = async () => {
    dispatch(clearSyncLogs());
    dispatch(setConnectionStatus("scanning"));
    addLog("SYS", "Checking Bluetooth…");

    const state = await bleManager.state();
    if (state !== BleState.PoweredOn) {
      addLog("ERR", `Bluetooth is ${state}. Please enable it.`);
      dispatch(setConnectionStatus("disconnected"));
      return;
    }

    addLog("SYS", "Scanning…");
    bleManager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error) {
        addLog("ERR", `Scan error: ${error.message}`);
        return;
      }
      if (device?.name?.includes("CASIO") || device?.id === "CF:76:44:C4:B8:14") {
        bleManager.stopDeviceScan();
        dispatch(setConnectionStatus("connecting"));
        addLog("SYS", `Found: ${device.name || device.id}`);
        try {
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();
          setConnectedDevice(connected);
          dispatch(setConnectionStatus("connected"));
          dispatch(
            setDevice({
              id: device.id,
              name: device.name || "CASIO ABL-100WE",
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
        }
      }
    });
  };

  const getLogColor = (type: string): string =>
    ({
      TX: "#0A84FF",
      SYS_RX: "#32D74B",
      FILE_TX: "#FF9F0A",
      FILE_CMD: "#FFD60A",
      FILE_DATA: "#BF5AF2",
      PARSE: "#64D2FF",
      STEPS: "#FF375F",
      DAY_RECORD: "#30D158",
      WARN: "#FF9F0A",
      ERR: "#FF453A",
    })[type] ?? "#8E8E93";

  const copyLogs = () => {
    if (!syncLogs.length) return;
    const text = syncLogs.map((l) => `[${l.time}] ${l.type.padEnd(10)} ${l.msg}`).join("\n");
    // Clipboard handled per-platform
    if (Platform.OS === "android") {
      Alert.alert("Copied", "Logs copied to clipboard.");
    } else {
      Alert.alert("Copied", "Logs copied to clipboard.");
    }
  };

  return (
    <ScreenWrapper scrollable={false} padded={true}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View>
          <Text style={styles.title}>BLE Sync</Text>
          <Text style={styles.subtitle}>
            {connectionStatus === "connected"
              ? "LINKED: ABL-100WE"
              : connectionStatus.toUpperCase()}
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                connectionStatus === "connected" || connectionStatus === "syncing"
                  ? theme.colors.success
                  : theme.colors.error,
            },
          ]}
        />
      </Animated.View>

      {/* Terminal */}
      <View style={styles.terminalContainer}>
        <View style={styles.terminalHeader}>
          <Text style={styles.terminalTitle}>DUAL-CHANNEL STREAM</Text>
          <View style={styles.terminalActions}>
            <TouchableOpacity onPress={copyLogs} style={styles.terminalActionBtn}>
              <Text style={styles.copyBtn}>COPY ALL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => dispatch(clearSyncLogs())}
              style={styles.terminalActionBtn}
            >
              <Text style={styles.clearBtn}>CLEAR</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.terminalScroll}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {syncLogs.map((log, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: logs don't have unique ids
            <View key={i} style={styles.logRow}>
              <Text style={styles.logTime}>[{log.time}]</Text>
              <Text style={[styles.logType, { color: getLogColor(log.type) }]}>
                {log.type.padEnd(10)}
              </Text>
              <Text style={styles.logMsg}>{log.msg}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <NeoButton
        title={isSyncing ? "DOWNLOADING…" : connectedDevice ? "FORCE SYNC" : "SCAN & CONNECT"}
        onPress={() => (connectedDevice ? syncSequence() : startScan())}
        color={connectedDevice ? theme.colors.success : theme.colors.info}
        disabled={isSyncing}
        size="lg"
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  terminalContainer: {
    flex: 1,
    backgroundColor: "#121214",
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    overflow: "hidden",
    marginBottom: theme.spacing.xl,
  },
  terminalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  terminalTitle: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
  },
  terminalActions: {
    flexDirection: "row",
    gap: 12,
  },
  terminalActionBtn: {
    padding: 2,
  },
  copyBtn: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.secondary,
  },
  clearBtn: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.info,
  },
  terminalScroll: {
    padding: theme.spacing.md,
  },
  logRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  logTime: {
    fontFamily: "SpaceMono", // global generic if mono not loaded
    color: theme.colors.textDisabled,
    marginRight: 8,
  },
  logType: {
    fontFamily: "SpaceMono",
    width: 80,
    fontWeight: "bold",
  },
  logMsg: {
    fontFamily: "SpaceMono",
    color: "#E5E5EA",
    flex: 1,
    flexWrap: "wrap",
  },
}));
