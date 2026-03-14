import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyGoal {
  steps: number;
  calories: number;
  distanceKm: number;
}

export interface ActivityLog {
  date: string;
  steps: number;
  calories: number;
  distanceKm: number;
  heartRate?: number;
}

export interface LocationLog {
  id: string;
  lat: number;
  lon: number;
  date: string;
  steps: number;
}

export interface BleUuids {
  serviceUuid: string;
  stepsCharUuid: string;
  caloriesCharUuid: string;
  distanceCharUuid: string;
  heartRateCharUuid: string;
  batteryCharUuid: string;
  findPhoneCharUuid: string;
}

const DEFAULT_UUIDS: BleUuids = {
  serviceUuid: '0000180f-0000-1000-8000-00805f9b34fb',
  stepsCharUuid: '00002a37-0000-1000-8000-00805f9b34fb',
  caloriesCharUuid: '00002a7f-0000-1000-8000-00805f9b34fb',
  distanceCharUuid: '00002a99-0000-1000-8000-00805f9b34fb',
  heartRateCharUuid: '00002a38-0000-1000-8000-00805f9b34fb',
  batteryCharUuid: '00002a19-0000-1000-8000-00805f9b34fb',
  findPhoneCharUuid: '00002a39-0000-1000-8000-00805f9b34fb',
};

const KEYS = {
  DAILY_GOAL: '@casio_daily_goal',
  ACTIVITY_LOGS: '@casio_activity_logs',
  LAST_SYNC: '@casio_last_sync',
  LOCATION_LOGS: '@casio_location_logs',
  WATCH_NAME: '@casio_watch_name',
  WATCH_DEVICE_ID: '@casio_watch_device_id',
  WATCH_PHOTO: '@casio_watch_photo',
  BLE_UUIDS: '@casio_ble_uuids',
  AUTH_TOKEN: '@casio_auth_token',
};

export const storage = {
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
    const idx = logs.findIndex(l => l.date === log.date);
    if (idx >= 0) logs[idx] = log;
    else { logs.unshift(log); if (logs.length > 90) logs.pop(); }
    await AsyncStorage.setItem(KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  },
  async getLastSync(): Promise<Date | null> {
    const raw = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    return raw ? new Date(raw) : null;
  },
  async setLastSync(date: Date): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, date.toISOString());
  },
  async getTodayData(): Promise<{ steps: number; calories: number; distanceKm: number }> {
    const today = new Date().toISOString().split('T')[0];
    const logs = await this.getActivityLogs();
    return logs.find(l => l.date === today) ?? { steps: 0, calories: 0, distanceKm: 0 };
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
  async getWatchName(): Promise<string> {
    return (await AsyncStorage.getItem(KEYS.WATCH_NAME)) ?? 'Casio ABL-100WE';
  },
  async setWatchName(name: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.WATCH_NAME, name);
  },
  async getWatchDeviceId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.WATCH_DEVICE_ID);
  },
  async setWatchDeviceId(id: string | null): Promise<void> {
    if (id) await AsyncStorage.setItem(KEYS.WATCH_DEVICE_ID, id);
    else await AsyncStorage.removeItem(KEYS.WATCH_DEVICE_ID);
  },
  async getWatchPhoto(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.WATCH_PHOTO);
  },
  async setWatchPhoto(uri: string | null): Promise<void> {
    if (uri) await AsyncStorage.setItem(KEYS.WATCH_PHOTO, uri);
    else await AsyncStorage.removeItem(KEYS.WATCH_PHOTO);
  },
  async getBleUuids(): Promise<BleUuids> {
    const raw = await AsyncStorage.getItem(KEYS.BLE_UUIDS);
    if (!raw) return DEFAULT_UUIDS;
    try { return { ...DEFAULT_UUIDS, ...JSON.parse(raw) }; } catch { return DEFAULT_UUIDS; }
  },
  async setBleUuids(partial: Partial<BleUuids>): Promise<void> {
    const current = await this.getBleUuids();
    await AsyncStorage.setItem(KEYS.BLE_UUIDS, JSON.stringify({ ...current, ...partial }));
  },
  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },
  async setAuthToken(token: string | null): Promise<void> {
    if (token) await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    else await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },
};
