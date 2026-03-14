import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type DeviceType = 'casio_abl100we' | 'generic_band' | 'generic_watch' | 'custom';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  serviceUUID: string;
  characteristicUUID: string;
  macAddress?: string;
  watchImageUri?: string;
  addedAt: number;
}

export interface DailyStats {
  date: string;
  steps: number;
  calories: number;
  km: number;
  goal: number;
}

export interface AppState {
  devices: Device[];
  activeDeviceId: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'scanning';
  dailyStats: DailyStats[];
  todayStats: DailyStats;
  dailyGoal: number;
  lastSynced: number | null;
  user: { name: string; weight: number; height: number } | null;
}

interface AppContextType extends AppState {
  addDevice: (device: Omit<Device, 'id' | 'addedAt'>) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  setActiveDevice: (id: string | null) => Promise<void>;
  setConnectionStatus: (status: AppState['connectionStatus']) => void;
  syncData: (steps: number, calories: number, km: number) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  setUser: (user: AppState['user']) => Promise<void>;
  updateWatchImage: (deviceId: string, uri: string) => Promise<void>;
  addManualSteps: (steps: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  DEVICES: '@bandbridge_devices',
  ACTIVE_DEVICE: '@bandbridge_active_device',
  DAILY_STATS: '@bandbridge_daily_stats',
  DAILY_GOAL: '@bandbridge_daily_goal',
  USER: '@bandbridge_user',
  LAST_SYNCED: '@bandbridge_last_synced',
};

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function makeTodayStats(goal: number): DailyStats {
  return { date: getTodayKey(), steps: 0, calories: 0, km: 0, goal };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDeviceId, setActiveDeviceIdState] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<AppState['connectionStatus']>('disconnected');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats>(makeTodayStats(8000));
  const [dailyGoal, setDailyGoalState] = useState(8000);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const [user, setUserState] = useState<AppState['user']>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devicesRaw, activeId, statsRaw, goal, userRaw, syncedRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEVICES),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_DEVICE),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_STATS),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNCED),
      ]);

      const parsedGoal = goal ? parseInt(goal) : 8000;
      setDailyGoalState(parsedGoal);

      if (devicesRaw) setDevices(JSON.parse(devicesRaw));
      if (activeId) setActiveDeviceIdState(activeId);
      if (userRaw) setUserState(JSON.parse(userRaw));
      if (syncedRaw) setLastSynced(parseInt(syncedRaw));

      const today = getTodayKey();
      if (statsRaw) {
        const parsed: DailyStats[] = JSON.parse(statsRaw);
        setDailyStats(parsed);
        const todayData = parsed.find(s => s.date === today);
        setTodayStats(todayData ?? makeTodayStats(parsedGoal));
      } else {
        setTodayStats(makeTodayStats(parsedGoal));
      }
    } catch (e) {
      console.error('Load data error:', e);
    }
  };

  const saveStats = async (updated: DailyStats[], today: DailyStats) => {
    const today_key = getTodayKey();
    const filtered = updated.filter(s => s.date !== today_key);
    const newStats = [...filtered, today].slice(-30);
    setDailyStats(newStats);
    setTodayStats(today);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(newStats));
  };

  const addDevice = useCallback(async (device: Omit<Device, 'id' | 'addedAt'>) => {
    const newDevice: Device = {
      ...device,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
    };
    setDevices(prev => {
      const updated = [...prev, newDevice];
      AsyncStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeDevice = useCallback(async (id: string) => {
    setDevices(prev => {
      const updated = prev.filter(d => d.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
      return updated;
    });
    if (activeDeviceId === id) {
      setActiveDeviceIdState(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_DEVICE);
    }
  }, [activeDeviceId]);

  const setActiveDevice = useCallback(async (id: string | null) => {
    setActiveDeviceIdState(id);
    if (id) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_DEVICE, id);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_DEVICE);
    }
  }, []);

  const syncData = useCallback(async (steps: number, calories: number, km: number) => {
    const now = Date.now();
    setLastSynced(now);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNCED, now.toString());

    const updatedToday: DailyStats = { ...todayStats, steps, calories, km };
    await saveStats(dailyStats, updatedToday);
  }, [todayStats, dailyStats]);

  const addManualSteps = useCallback(async (steps: number) => {
    const km = steps * 0.000762;
    const calories = steps * 0.04;
    const updatedToday: DailyStats = {
      ...todayStats,
      steps: todayStats.steps + steps,
      calories: todayStats.calories + calories,
      km: todayStats.km + km,
    };
    await saveStats(dailyStats, updatedToday);
  }, [todayStats, dailyStats]);

  const setDailyGoal = useCallback(async (goal: number) => {
    setDailyGoalState(goal);
    setTodayStats(prev => ({ ...prev, goal }));
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL, goal.toString());
  }, []);

  const setUser = useCallback(async (u: AppState['user']) => {
    setUserState(u);
    if (u) await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
  }, []);

  const updateWatchImage = useCallback(async (deviceId: string, uri: string) => {
    setDevices(prev => {
      const updated = prev.map(d => d.id === deviceId ? { ...d, watchImageUri: uri } : d);
      AsyncStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      devices, activeDeviceId, connectionStatus, dailyStats, todayStats,
      dailyGoal, lastSynced, user,
      addDevice, removeDevice, setActiveDevice, setConnectionStatus,
      syncData, setDailyGoal, setUser, updateWatchImage, addManualSteps,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
