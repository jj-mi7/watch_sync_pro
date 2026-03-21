export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Steps: undefined;
  Device: undefined;
  Settings: undefined;
};

export type DeviceStackParamList = {
  WatchProfile: undefined;
  Sync: undefined;
  FindPhone: undefined;
};

export interface DailyRecord {
  date: string; // ISO date string
  steps: number;
  calories: number;
  distanceKm: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: "casio" | "xiaomi" | "fitbit" | "generic";
  photoUri?: string;
  batteryLevel: number;
  lastSyncTime?: string;
}

export type ConnectionStatus = "disconnected" | "scanning" | "connecting" | "connected" | "syncing";
