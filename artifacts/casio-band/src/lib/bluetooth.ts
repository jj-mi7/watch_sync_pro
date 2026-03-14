import { Platform } from 'react-native';

export type BleStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface BleDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

export interface WatchData {
  steps: number;
  calories: number;
  distanceKm: number;
  heartRate?: number;
  battery?: number;
}

export function isMockMode(): boolean {
  return Platform.OS === 'web';
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

let managerInstance: any = null;

async function getBleManager() {
  if (isMockMode()) return null;
  if (!managerInstance) {
    const { BleManager } = await import('react-native-ble-plx');
    managerInstance = new BleManager();
  }
  return managerInstance;
}

export async function scanForDevices(
  onDevice: (device: BleDevice) => void,
  serviceUuids: string[],
  timeoutMs = 12000,
): Promise<void> {
  const m = await getBleManager();
  if (!m) return;

  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      m.stopDeviceScan();
      resolve();
    }, timeoutMs);

    m.startDeviceScan(serviceUuids.filter(Boolean), null, (error: any, device: any) => {
      if (error) {
        clearTimeout(timer);
        m.stopDeviceScan();
        reject(error);
        return;
      }
      if (device) {
        onDevice({ id: device.id, name: device.name ?? null, rssi: device.rssi ?? null });
      }
    });
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
    await m.connectToDevice(deviceId);
    await m.discoverAllServicesAndCharacteristicsForDevice(deviceId);
    return true;
  } catch {
    return false;
  }
}

export async function disconnectDevice(deviceId: string): Promise<void> {
  const m = await getBleManager();
  if (!m) return;
  try { await m.cancelDeviceConnection(deviceId); } catch {}
}

export async function readWatchData(
  deviceId: string,
  uuids: { serviceUuid: string; stepsCharUuid: string; caloriesCharUuid: string; distanceCharUuid: string; heartRateCharUuid: string; batteryCharUuid: string },
): Promise<WatchData> {
  const m = await getBleManager();
  if (!m) return { steps: 0, calories: 0, distanceKm: 0 };

  const readChar = async (charUuid: string): Promise<number | null> => {
    try {
      const char = await m.readCharacteristicForDevice(deviceId, uuids.serviceUuid, charUuid);
      if (!char?.value) return null;
      const buf = Buffer.from(char.value, 'base64');
      return buf.readUInt16LE(0);
    } catch { return null; }
  };

  const [steps, calories, distance, heartRate, battery] = await Promise.all([
    readChar(uuids.stepsCharUuid),
    readChar(uuids.caloriesCharUuid),
    readChar(uuids.distanceCharUuid),
    readChar(uuids.heartRateCharUuid),
    readChar(uuids.batteryCharUuid),
  ]);

  return {
    steps: steps ?? 0,
    calories: calories != null ? calories / 100 : 0,
    distanceKm: distance != null ? distance / 100 : 0,
    heartRate: heartRate ?? undefined,
    battery: battery ?? undefined,
  };
}

export async function triggerFindPhone(deviceId: string, serviceUuid: string, charUuid: string): Promise<void> {
  const m = await getBleManager();
  if (!m) return;
  try {
    await m.writeCharacteristicWithResponseForDevice(deviceId, serviceUuid, charUuid, Buffer.from([0x01]).toString('base64'));
  } catch {}
}
