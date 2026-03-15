export interface WatchDevice {
  id: string;
  name: string;
  model: string;
  brand: string;
  serviceUUID: string;
  characteristicUUID: string;
  rssi?: number;
  connected: boolean;
  lastSynced?: number;
  photoUri?: string;
}

export interface ActivityData {
  date: string;
  steps: number;
  calories: number;
  distanceKm: number;
  activeMinutes: number;
  heartRate?: number;
  timestamp: number;
}

export interface DailyGoal {
  steps: number;
  calories: number;
  distanceKm: number;
}

export interface SyncResult {
  success: boolean;
  error?: string;
  data?: ActivityData;
  timestamp: number;
}

export interface BleDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  serviceUUIDs?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  idToken?: string;
}

export type TabParamList = {
  Dashboard: undefined;
  Activity: undefined;
  Device: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddDevice: undefined;
  DeviceDetail: { deviceId: string };
};
