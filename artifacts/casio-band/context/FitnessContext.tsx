import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { storage, type ActivityLog, type DailyGoal, type LocationLog } from "@/lib/storage";

interface FitnessContextValue {
  todaySteps: number;
  todayCalories: number;
  todayDistanceKm: number;
  todayHeartRate?: number;
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
  setTodayData: (steps: number, calories: number, distanceKm: number, heartRate?: number) => Promise<void>;
  setDailyGoal: (goal: DailyGoal) => Promise<void>;
  refreshLogs: () => Promise<void>;
  setLastSync: (date: Date) => Promise<void>;
  setWatchPhoto: (uri: string) => Promise<void>;
  setWatchName: (name: string) => Promise<void>;
  setWatchDeviceId: (id: string | null) => Promise<void>;
  addLocationLog: (log: LocationLog) => Promise<void>;
  setCustomServiceUUID: (uuid: string | null) => Promise<void>;
  setCustomStepCharUUID: (uuid: string | null) => Promise<void>;
  setCustomCalCharUUID: (uuid: string | null) => Promise<void>;
  setCustomDistCharUUID: (uuid: string | null) => Promise<void>;
}

function computeStreak(logs: ActivityLog[], goalSteps: number): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  let expected = today;
  for (const log of sorted) {
    if (log.date !== expected) break;
    if (log.steps < goalSteps) break;
    streak++;
    const d = new Date(expected);
    d.setDate(d.getDate() - 1);
    expected = d.toISOString().split("T")[0];
  }
  return streak;
}

const FitnessContext = createContext<FitnessContextValue | null>(null);

export function FitnessProvider({ children }: { children: ReactNode }) {
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayDistanceKm, setTodayDistanceKm] = useState(0);
  const [todayHeartRate, setTodayHeartRate] = useState<number | undefined>(undefined);
  const [dailyGoal, setDailyGoalState] = useState<DailyGoal>({ steps: 8000, calories: 500, distanceKm: 5 });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [locationLogs, setLocationLogs] = useState<LocationLog[]>([]);
  const [lastSync, setLastSyncState] = useState<Date | null>(null);
  const [watchPhoto, setWatchPhotoState] = useState<string | null>(null);
  const [watchName, setWatchNameState] = useState("Casio ABL-100WE");
  const [watchDeviceId, setWatchDeviceIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customServiceUUID, setCustomServiceUUIDState] = useState<string | null>(null);
  const [customStepCharUUID, setCustomStepCharUUIDState] = useState<string | null>(null);
  const [customCalCharUUID, setCustomCalCharUUIDState] = useState<string | null>(null);
  const [customDistCharUUID, setCustomDistCharUUIDState] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [today, goal, logs, locLogs, sync, photo, name, deviceId, uuids] = await Promise.all([
        storage.getTodayData(),
        storage.getDailyGoal(),
        storage.getActivityLogs(),
        storage.getLocationLogs(),
        storage.getLastSync(),
        storage.getWatchPhoto(),
        storage.getWatchName(),
        storage.getWatchDeviceId(),
        storage.getBleUuids(),
      ]);
      setTodaySteps(today.steps);
      setTodayCalories(today.calories);
      setTodayDistanceKm(today.distanceKm);
      setDailyGoalState(goal);
      setActivityLogs(logs);
      setLocationLogs(locLogs);
      setLastSyncState(sync);
      setWatchPhotoState(photo);
      if (name) setWatchNameState(name);
      setWatchDeviceIdState(deviceId);
      setCustomServiceUUIDState(uuids.serviceUuid ?? null);
      setCustomStepCharUUIDState(uuids.stepsCharUuid ?? null);
      setCustomCalCharUUIDState(uuids.caloriesCharUuid ?? null);
      setCustomDistCharUUIDState(uuids.distanceCharUuid ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const streak = useMemo(() => computeStreak(activityLogs, dailyGoal.steps), [activityLogs, dailyGoal.steps]);

  const setTodayData = useCallback(async (steps: number, calories: number, distanceKm: number, heartRate?: number) => {
    setTodaySteps(steps);
    setTodayCalories(calories);
    setTodayDistanceKm(distanceKm);
    setTodayHeartRate(heartRate);
    const today = new Date().toISOString().split("T")[0];
    const log: ActivityLog = { id: today, date: today, steps, calories, distanceKm, heartRate };
    await storage.addActivityLog(log);
    const logs = await storage.getActivityLogs();
    setActivityLogs(logs);
  }, []);

  const setDailyGoal = useCallback(async (goal: DailyGoal) => {
    await storage.setDailyGoal(goal);
    setDailyGoalState(goal);
  }, []);

  const refreshLogs = useCallback(async () => {
    const [logs, locLogs, today] = await Promise.all([
      storage.getActivityLogs(),
      storage.getLocationLogs(),
      storage.getTodayData(),
    ]);
    setActivityLogs(logs);
    setLocationLogs(locLogs);
    setTodaySteps(today.steps);
    setTodayCalories(today.calories);
    setTodayDistanceKm(today.distanceKm);
  }, []);

  const setLastSync = useCallback(async (date: Date) => {
    await storage.setLastSync(date);
    setLastSyncState(date);
  }, []);

  const setWatchPhoto = useCallback(async (uri: string) => {
    await storage.setWatchPhoto(uri);
    setWatchPhotoState(uri);
  }, []);

  const setWatchName = useCallback(async (name: string) => {
    await storage.setWatchName(name);
    setWatchNameState(name);
  }, []);

  const setWatchDeviceId = useCallback(async (id: string | null) => {
    if (id) await storage.setWatchDeviceId(id);
    setWatchDeviceIdState(id);
  }, []);

  const addLocationLog = useCallback(async (log: LocationLog) => {
    await storage.addLocationLog(log);
    const logs = await storage.getLocationLogs();
    setLocationLogs(logs);
  }, []);

  const setCustomServiceUUID = useCallback(async (uuid: string | null) => {
    await storage.setBleUuids({ serviceUuid: uuid ?? "" });
    setCustomServiceUUIDState(uuid);
  }, []);

  const setCustomStepCharUUID = useCallback(async (uuid: string | null) => {
    await storage.setBleUuids({ stepsCharUuid: uuid ?? "" });
    setCustomStepCharUUIDState(uuid);
  }, []);

  const setCustomCalCharUUID = useCallback(async (uuid: string | null) => {
    await storage.setBleUuids({ caloriesCharUuid: uuid ?? "" });
    setCustomCalCharUUIDState(uuid);
  }, []);

  const setCustomDistCharUUID = useCallback(async (uuid: string | null) => {
    await storage.setBleUuids({ distanceCharUuid: uuid ?? "" });
    setCustomDistCharUUIDState(uuid);
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
  if (!ctx) throw new Error("useFitness must be used within FitnessProvider");
  return ctx;
}
