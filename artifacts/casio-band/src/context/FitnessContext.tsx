import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { storage, type DailyGoal, type ActivityLog, type LocationLog } from '@/lib/storage';

interface FitnessContextValue {
  todaySteps: number;
  todayCalories: number;
  todayDistanceKm: number;
  todayHeartRate: number | null;
  dailyGoal: DailyGoal;
  activityLogs: ActivityLog[];
  locationLogs: LocationLog[];
  lastSync: Date | null;
  watchPhoto: string | null;
  watchName: string;
  watchDeviceId: string | null;
  streak: number;
  isLoading: boolean;
  customServiceUUID: string | null;
  customStepCharUUID: string | null;
  customCalCharUUID: string | null;
  customDistCharUUID: string | null;
  setTodayData: (data: { steps: number; calories: number; distanceKm: number; heartRate?: number }) => Promise<void>;
  setDailyGoal: (goal: DailyGoal) => Promise<void>;
  refreshLogs: () => Promise<void>;
  setLastSync: (date: Date) => Promise<void>;
  setWatchPhoto: (uri: string | null) => Promise<void>;
  setWatchName: (name: string) => Promise<void>;
  setWatchDeviceId: (id: string | null) => Promise<void>;
  addLocationLog: (log: Omit<LocationLog, 'id'>) => Promise<void>;
  setCustomServiceUUID: (uuid: string | null) => Promise<void>;
  setCustomStepCharUUID: (uuid: string | null) => Promise<void>;
  setCustomCalCharUUID: (uuid: string | null) => Promise<void>;
  setCustomDistCharUUID: (uuid: string | null) => Promise<void>;
}

const FitnessContext = createContext<FitnessContextValue | null>(null);

export function FitnessProvider({ children }: { children: ReactNode }) {
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayDistanceKm, setTodayDistanceKm] = useState(0);
  const [todayHeartRate, setTodayHeartRate] = useState<number | null>(null);
  const [dailyGoal, setDailyGoalState] = useState<DailyGoal>({ steps: 8000, calories: 500, distanceKm: 5 });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [locationLogs, setLocationLogs] = useState<LocationLog[]>([]);
  const [lastSync, setLastSyncState] = useState<Date | null>(null);
  const [watchPhoto, setWatchPhotoState] = useState<string | null>(null);
  const [watchName, setWatchNameState] = useState('Casio ABL-100WE');
  const [watchDeviceId, setWatchDeviceIdState] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [customServiceUUID, setCustomServiceUUIDState] = useState<string | null>(null);
  const [customStepCharUUID, setCustomStepCharUUIDState] = useState<string | null>(null);
  const [customCalCharUUID, setCustomCalCharUUIDState] = useState<string | null>(null);
  const [customDistCharUUID, setCustomDistCharUUIDState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [goal, logs, today, ls, photo, name, deviceId, locs, uuids] = await Promise.all([
          storage.getDailyGoal(),
          storage.getActivityLogs(),
          storage.getTodayData(),
          storage.getLastSync(),
          storage.getWatchPhoto(),
          storage.getWatchName(),
          storage.getWatchDeviceId(),
          storage.getLocationLogs(),
          storage.getBleUuids(),
        ]);
        setDailyGoalState(goal);
        setActivityLogs(logs);
        setTodaySteps(today.steps);
        setTodayCalories(today.calories);
        setTodayDistanceKm(today.distanceKm);
        setLastSyncState(ls);
        setWatchPhotoState(photo);
        setWatchNameState(name);
        setWatchDeviceIdState(deviceId);
        setLocationLogs(locs);
        if (uuids.serviceUuid) setCustomServiceUUIDState(uuids.serviceUuid);
        if (uuids.stepsCharUuid) setCustomStepCharUUIDState(uuids.stepsCharUuid);
        if (uuids.caloriesCharUuid) setCustomCalCharUUIDState(uuids.caloriesCharUuid);
        if (uuids.distanceCharUuid) setCustomDistCharUUIDState(uuids.distanceCharUuid);
        const s = computeStreak(logs);
        setStreak(s);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  function computeStreak(logs: ActivityLog[]): number {
    if (!logs.length) return 0;
    let count = 0;
    const today = new Date().toISOString().split('T')[0];
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      if (i === 0 && key === today && !logs.find(l => l.date === today && l.steps > 500)) { d.setDate(d.getDate() - 1); continue; }
      if (!logs.find(l => l.date === key && l.steps > 500)) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }

  const setTodayData = useCallback(async (data: { steps: number; calories: number; distanceKm: number; heartRate?: number }) => {
    setTodaySteps(data.steps);
    setTodayCalories(data.calories);
    setTodayDistanceKm(data.distanceKm);
    if (data.heartRate != null) setTodayHeartRate(data.heartRate);
    const today = new Date().toISOString().split('T')[0];
    const log: ActivityLog = { date: today, steps: data.steps, calories: data.calories, distanceKm: data.distanceKm, heartRate: data.heartRate };
    await storage.addActivityLog(log);
    const updated = await storage.getActivityLogs();
    setActivityLogs(updated);
    setStreak(computeStreak(updated));
  }, []);

  const setDailyGoal = useCallback(async (goal: DailyGoal) => {
    setDailyGoalState(goal);
    await storage.setDailyGoal(goal);
  }, []);

  const refreshLogs = useCallback(async () => {
    const [logs, locs] = await Promise.all([storage.getActivityLogs(), storage.getLocationLogs()]);
    setActivityLogs(logs);
    setLocationLogs(locs);
  }, []);

  const setLastSync = useCallback(async (date: Date) => {
    setLastSyncState(date);
    await storage.setLastSync(date);
  }, []);

  const setWatchPhoto = useCallback(async (uri: string | null) => {
    setWatchPhotoState(uri);
    await storage.setWatchPhoto(uri);
  }, []);

  const setWatchName = useCallback(async (name: string) => {
    setWatchNameState(name);
    await storage.setWatchName(name);
  }, []);

  const setWatchDeviceId = useCallback(async (id: string | null) => {
    setWatchDeviceIdState(id);
    await storage.setWatchDeviceId(id);
  }, []);

  const addLocationLog = useCallback(async (log: Omit<LocationLog, 'id'>) => {
    const entry: LocationLog = { ...log, id: Date.now().toString() };
    await storage.addLocationLog(entry);
    const updated = await storage.getLocationLogs();
    setLocationLogs(updated);
  }, []);

  const setCustomServiceUUID = useCallback(async (uuid: string | null) => {
    setCustomServiceUUIDState(uuid);
    await storage.setBleUuids({ serviceUuid: uuid ?? '' });
  }, []);

  const setCustomStepCharUUID = useCallback(async (uuid: string | null) => {
    setCustomStepCharUUIDState(uuid);
    await storage.setBleUuids({ stepsCharUuid: uuid ?? '' });
  }, []);

  const setCustomCalCharUUID = useCallback(async (uuid: string | null) => {
    setCustomCalCharUUIDState(uuid);
    await storage.setBleUuids({ caloriesCharUuid: uuid ?? '' });
  }, []);

  const setCustomDistCharUUID = useCallback(async (uuid: string | null) => {
    setCustomDistCharUUIDState(uuid);
    await storage.setBleUuids({ distanceCharUuid: uuid ?? '' });
  }, []);

  const value = useMemo(() => ({
    todaySteps, todayCalories, todayDistanceKm, todayHeartRate,
    dailyGoal, activityLogs, locationLogs, lastSync,
    watchPhoto, watchName, watchDeviceId, streak, isLoading,
    customServiceUUID, customStepCharUUID, customCalCharUUID, customDistCharUUID,
    setTodayData, setDailyGoal, refreshLogs, setLastSync,
    setWatchPhoto, setWatchName, setWatchDeviceId, addLocationLog,
    setCustomServiceUUID, setCustomStepCharUUID, setCustomCalCharUUID, setCustomDistCharUUID,
  }), [
    todaySteps, todayCalories, todayDistanceKm, todayHeartRate,
    dailyGoal, activityLogs, locationLogs, lastSync,
    watchPhoto, watchName, watchDeviceId, streak, isLoading,
    customServiceUUID, customStepCharUUID, customCalCharUUID, customDistCharUUID,
    setTodayData, setDailyGoal, refreshLogs, setLastSync,
    setWatchPhoto, setWatchName, setWatchDeviceId, addLocationLog,
    setCustomServiceUUID, setCustomStepCharUUID, setCustomCalCharUUID, setCustomDistCharUUID,
  ]);

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
}

export function useFitness(): FitnessContextValue {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error('useFitness must be used within FitnessProvider');
  return ctx;
}
