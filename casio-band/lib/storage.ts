import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  WATCH_DEVICE_ID: "watch_device_id",
  WATCH_NAME: "watch_name",
  WATCH_PHOTO: "watch_photo",
  BLE_UUIDS: "ble_uuids",
  DAILY_STEPS: "daily_steps",
  DAILY_CALORIES: "daily_calories",
  DAILY_DISTANCE: "daily_distance",
  LAST_SYNC: "last_sync",
  DAILY_GOAL: "daily_goal",
  ACTIVITY_LOGS: "activity_logs",
  LOCATION_LOGS: "location_logs",
};

export interface BleUuids {
  serviceUuid: string;
  stepsCharUuid: string;
  caloriesCharUuid: string;
  distanceCharUuid: string;
  heartRateCharUuid: string;
  batteryCharUuid: string;
  findPhoneCharUuid: string;
}

export interface DailyGoal {
  steps: number;
  calories: number;
  distanceKm: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  steps: number;
  calories: number;
  distanceKm: number;
  heartRate?: number;
  synced?: boolean;
}

export interface LocationLog {
  id: string;
  date: string;
  lat: number;
  lon: number;
  steps: number;
}

const DEFAULT_UUIDS: BleUuids = {
  serviceUuid: "0000FEE0-0000-1000-8000-00805F9B34FB",
  stepsCharUuid: "0000FEE1-0000-1000-8000-00805F9B34FB",
  caloriesCharUuid: "0000FEE2-0000-1000-8000-00805F9B34FB",
  distanceCharUuid: "0000FEE3-0000-1000-8000-00805F9B34FB",
  heartRateCharUuid: "00002A37-0000-1000-8000-00805F9B34FB",
  batteryCharUuid: "00002A19-0000-1000-8000-00805F9B34FB",
  findPhoneCharUuid: "0000FEE4-0000-1000-8000-00805F9B34FB",
};

export const storage = {
  async getWatchDeviceId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.WATCH_DEVICE_ID);
  },
  async setWatchDeviceId(id: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.WATCH_DEVICE_ID, id);
  },
  async getWatchName(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.WATCH_NAME);
  },
  async setWatchName(name: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.WATCH_NAME, name);
  },
  async getWatchPhoto(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.WATCH_PHOTO);
  },
  async setWatchPhoto(uri: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.WATCH_PHOTO, uri);
  },
  async getBleUuids(): Promise<BleUuids> {
    const raw = await AsyncStorage.getItem(KEYS.BLE_UUIDS);
    if (!raw) return DEFAULT_UUIDS;
    try { return { ...DEFAULT_UUIDS, ...JSON.parse(raw) }; } catch { return DEFAULT_UUIDS; }
  },
  async setBleUuids(uuids: Partial<BleUuids>): Promise<void> {
    const current = await this.getBleUuids();
    await AsyncStorage.setItem(KEYS.BLE_UUIDS, JSON.stringify({ ...current, ...uuids }));
  },
  async getDailyGoal(): Promise<DailyGoal> {
    const raw = await AsyncStorage.getItem(KEYS.DAILY_GOAL);
    if (!raw) return { steps: 8000, calories: 500, distanceKm: 5 };
    try { return JSON.parse(raw); } catch { return { steps: 8000, calories: 500, distanceKm: 5 }; }
  },
  async setDailyGoal(goal: DailyGoal): Promise<void> {
    await AsyncStorage.setItem(KEYS.DAILY_GOAL, JSON.stringify(goal));
  },
  async getActivityLogs(): Promise<ActivityLog[]> {
    const raw = await AsyncStorage.getItem(KEYS.ACTIVITY_LOGS);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  },
  async addActivityLog(log: ActivityLog): Promise<void> {
    const logs = await this.getActivityLogs();
    const existingIdx = logs.findIndex(l => l.date === log.date);
    if (existingIdx >= 0) {
      logs[existingIdx] = log;
    } else {
      logs.unshift(log);
      if (logs.length > 90) logs.pop();
    }
    await AsyncStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  },
  async getLastSync(): Promise<Date | null> {
    const raw = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    if (!raw) return null;
    return new Date(raw);
  },
  async setLastSync(date: Date): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, date.toISOString());
  },
  async getTodayData(): Promise<{ steps: number; calories: number; distanceKm: number }> {
    const today = new Date().toISOString().split("T")[0];
    const logs = await this.getActivityLogs();
    const todayLog = logs.find(l => l.date === today);
    return todayLog ?? { steps: 0, calories: 0, distanceKm: 0 };
  },
  async getLocationLogs(): Promise<LocationLog[]> {
    const raw = await AsyncStorage.getItem(KEYS.LOCATION_LOGS);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  },
  async addLocationLog(log: LocationLog): Promise<void> {
    const logs = await this.getLocationLogs();
    logs.unshift(log);
    if (logs.length > 50) logs.pop();
    await AsyncStorage.setItem(KEYS.LOCATION_LOGS, JSON.stringify(logs));
  },
};
