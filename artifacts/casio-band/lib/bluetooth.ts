import { Platform } from "react-native";

export interface WatchData {
  steps: number;
  calories: number;
  distanceKm: number;
  heartRate?: number;
  battery?: number;
}

export type BleStatus =
  | "idle"
  | "scanning"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "unsupported";

export interface BleDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

let BleManager: typeof import("react-native-ble-plx").BleManager | null = null;
let manager: import("react-native-ble-plx").BleManager | null = null;

async function getBleManager() {
  if (Platform.OS === "web") return null;
  if (manager) return manager;
  try {
    const mod = await import("react-native-ble-plx");
    BleManager = mod.BleManager;
    manager = new mod.BleManager();
    return manager;
  } catch {
    return null;
  }
}

export async function isBleSupported(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const m = await getBleManager();
    if (!m) return false;
    const state = await m.state();
    return state !== "Unsupported";
  } catch {
    return false;
  }
}

export async function scanForDevices(
  onDevice: (device: BleDevice) => void,
  serviceUuids: string[],
  timeoutMs = 10000
): Promise<void> {
  const m = await getBleManager();
  if (!m) return;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      m.stopDeviceScan();
      resolve();
    }, timeoutMs);

    m.startDeviceScan(
      serviceUuids.length > 0 ? serviceUuids : null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          clearTimeout(timer);
          m.stopDeviceScan();
          reject(error);
          return;
        }
        if (device) {
          onDevice({ id: device.id, name: device.name, rssi: device.rssi });
        }
      }
    );
  });
}

export async function stopScan(): Promise<void> {
  const m = await getBleManager();
  m?.stopDeviceScan();
}

export async function connectToDevice(deviceId: string): Promise<boolean> {
  const m = await getBleManager();
  if (!m) return false;
  try {
    const connected = await m.connectToDevice(deviceId);
    await connected.discoverAllServicesAndCharacteristics();
    return true;
  } catch {
    return false;
  }
}

export async function disconnectDevice(deviceId: string): Promise<void> {
  const m = await getBleManager();
  if (!m) return;
  try {
    await m.cancelDeviceConnection(deviceId);
  } catch { }
}

export async function readWatchData(
  deviceId: string,
  serviceUuid: string,
  chars: { steps: string; calories: string; distance: string; heartRate: string; battery: string }
): Promise<WatchData> {
  const m = await getBleManager();
  if (!m) return { steps: 0, calories: 0, distanceKm: 0 };

  try {
    const readChar = async (charUuid: string): Promise<number | null> => {
      try {
        const char = await m.readCharacteristicForDevice(deviceId, serviceUuid, charUuid);
        if (!char.value) return null;
        const buf = Buffer.from(char.value, "base64");
        return buf.readUInt16LE(0);
      } catch { return null; }
    };

    const [steps, calories, distance, heartRate, battery] = await Promise.all([
      readChar(chars.steps),
      readChar(chars.calories),
      readChar(chars.distance),
      readChar(chars.heartRate),
      readChar(chars.battery),
    ]);

    return {
      steps: steps ?? 0,
      calories: calories != null ? calories / 100 : 0,
      distanceKm: distance != null ? distance / 100 : 0,
      heartRate: heartRate ?? undefined,
      battery: battery ?? undefined,
    };
  } catch {
    return { steps: 0, calories: 0, distanceKm: 0 };
  }
}

export async function triggerFindPhone(
  deviceId: string,
  serviceUuid: string,
  charUuid: string
): Promise<void> {
  const m = await getBleManager();
  if (!m) return;
  try {
    await m.writeCharacteristicWithResponseForDevice(deviceId, serviceUuid, charUuid, Buffer.from([0x01]).toString("base64"));
  } catch { }
}

export function isMockMode(): boolean {
  return Platform.OS === "web";
}

export function generateMockData(): WatchData {
  const base = Math.floor(Date.now() / 60000);
  return {
    steps: 4200 + (base % 1000),
    calories: 280 + (base % 100),
    distanceKm: 3.1 + (base % 10) * 0.1,
    heartRate: 68 + (base % 20),
    battery: 85,
  };
}
