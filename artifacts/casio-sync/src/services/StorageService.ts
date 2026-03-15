import { MMKV } from 'react-native-mmkv';
import type { ActivityData, DailyGoal, User, WatchDevice } from '../types';

const storage = new MMKV({ id: 'casio-sync-storage' });

const DEFAULT_GOAL: DailyGoal = {
  steps: 10000,
  calories: 500,
  distanceKm: 8,
};

export const StorageService = {
  setUser: (user: User | null) => {
    if (user) storage.set('user', JSON.stringify(user));
    else storage.delete('user');
  },

  getUser: (): User | null => {
    const raw = storage.getString('user');
    return raw ? (JSON.parse(raw) as User) : null;
  },

  setDevices: (devices: WatchDevice[]) => {
    storage.set('devices', JSON.stringify(devices));
  },

  getDevices: (): WatchDevice[] => {
    const raw = storage.getString('devices');
    return raw ? (JSON.parse(raw) as WatchDevice[]) : [];
  },

  setActiveDeviceId: (id: string | null) => {
    if (id) storage.set('activeDeviceId', id);
    else storage.delete('activeDeviceId');
  },

  getActiveDeviceId: (): string | null => {
    return storage.getString('activeDeviceId') ?? null;
  },

  setActivityHistory: (history: ActivityData[]) => {
    const last90 = history.slice(-90);
    storage.set('activityHistory', JSON.stringify(last90));
  },

  getActivityHistory: (): ActivityData[] => {
    const raw = storage.getString('activityHistory');
    return raw ? (JSON.parse(raw) as ActivityData[]) : [];
  },

  setDailyGoal: (goal: DailyGoal) => {
    storage.set('dailyGoal', JSON.stringify(goal));
  },

  getDailyGoal: (): DailyGoal => {
    const raw = storage.getString('dailyGoal');
    return raw ? (JSON.parse(raw) as DailyGoal) : DEFAULT_GOAL;
  },

  clearAll: () => {
    storage.clearAll();
  },
};
