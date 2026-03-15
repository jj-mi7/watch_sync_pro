import { create } from 'zustand';
import type { ActivityData, DailyGoal, User, WatchDevice } from '../types';
import { StorageService } from '../services/StorageService';

interface AppState {
  user: User | null;
  devices: WatchDevice[];
  activeDevice: WatchDevice | null;
  activityHistory: ActivityData[];
  todayActivity: ActivityData | null;
  dailyGoal: DailyGoal;
  isSyncing: boolean;
  isBleScanning: boolean;

  setUser: (user: User | null) => void;
  addDevice: (device: WatchDevice) => void;
  removeDevice: (deviceId: string) => void;
  updateDevice: (deviceId: string, updates: Partial<WatchDevice>) => void;
  setActiveDevice: (device: WatchDevice | null) => void;
  setActivityHistory: (history: ActivityData[]) => void;
  setTodayActivity: (activity: ActivityData) => void;
  updateDailyGoal: (goal: Partial<DailyGoal>) => void;
  setIsSyncing: (v: boolean) => void;
  setIsBleScanning: (v: boolean) => void;
  loadFromStorage: () => void;
}

const DEFAULT_GOAL: DailyGoal = {
  steps: 10000,
  calories: 500,
  distanceKm: 8,
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  devices: [],
  activeDevice: null,
  activityHistory: [],
  todayActivity: null,
  dailyGoal: DEFAULT_GOAL,
  isSyncing: false,
  isBleScanning: false,

  setUser: (user) => {
    set({ user });
    StorageService.setUser(user);
  },

  addDevice: (device) => {
    const devices = [...get().devices.filter((d) => d.id !== device.id), device];
    set({ devices });
    StorageService.setDevices(devices);
  },

  removeDevice: (deviceId) => {
    const devices = get().devices.filter((d) => d.id !== deviceId);
    const activeDevice = get().activeDevice?.id === deviceId ? null : get().activeDevice;
    set({ devices, activeDevice });
    StorageService.setDevices(devices);
  },

  updateDevice: (deviceId, updates) => {
    const devices = get().devices.map((d) => (d.id === deviceId ? { ...d, ...updates } : d));
    const activeDevice =
      get().activeDevice?.id === deviceId
        ? { ...get().activeDevice!, ...updates }
        : get().activeDevice;
    set({ devices, activeDevice });
    StorageService.setDevices(devices);
  },

  setActiveDevice: (device) => {
    set({ activeDevice: device });
    StorageService.setActiveDeviceId(device?.id ?? null);
  },

  setActivityHistory: (history) => {
    set({ activityHistory: history });
    StorageService.setActivityHistory(history);
  },

  setTodayActivity: (activity) => {
    const history = get().activityHistory;
    const updated = [...history.filter((h) => h.date !== activity.date), activity];
    set({ todayActivity: activity, activityHistory: updated });
    StorageService.setActivityHistory(updated);
  },

  updateDailyGoal: (goal) => {
    const dailyGoal = { ...get().dailyGoal, ...goal };
    set({ dailyGoal });
    StorageService.setDailyGoal(dailyGoal);
  },

  setIsSyncing: (v) => set({ isSyncing: v }),
  setIsBleScanning: (v) => set({ isBleScanning: v }),

  loadFromStorage: () => {
    const user = StorageService.getUser();
    const devices = StorageService.getDevices();
    const activeDeviceId = StorageService.getActiveDeviceId();
    const activityHistory = StorageService.getActivityHistory();
    const dailyGoal = StorageService.getDailyGoal();
    const today = new Date().toISOString().split('T')[0];
    const todayActivity = activityHistory.find((a) => a.date === today) ?? null;
    const activeDevice = devices.find((d) => d.id === activeDeviceId) ?? null;
    set({ user, devices, activeDevice, activityHistory, todayActivity, dailyGoal });
  },
}));
