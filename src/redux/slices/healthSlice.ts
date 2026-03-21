import type { Badge, DailyRecord } from "@/types";
import { calculateActiveMinutes, calculateCalories, calculateDistanceKm } from "@/utils/healthMath";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { Gender } from "./userSlice";

export const ALL_BADGES: Badge[] = [
  { id: "steps_5k", name: "5K Starter", description: "Walk 5,000 steps in a day.", icon: "🥉" },
  { id: "steps_10k", name: "10K Club", description: "Walk 10,000 steps in a day.", icon: "🥈" },
  { id: "steps_20k", name: "Marathoner", description: "Walk 20,000 steps in a day.", icon: "🥇" },
  { id: "dist_5k", name: "5km Journey", description: "Walk 5 kilometers in a day.", icon: "🛣️" },
  { id: "active_30m", name: "Active 30", description: "Get 30 active minutes.", icon: "⚡" },
];

interface HealthState {
  todaySteps: number;
  todayCalories: number;
  todayDistanceKm: number;
  todayActiveMinutes: number;
  history: DailyRecord[];
  badges: Badge[];
}

const initialState: HealthState = {
  todaySteps: 0,
  todayCalories: 0,
  todayDistanceKm: 0,
  todayActiveMinutes: 0,
  history: [],
  badges: ALL_BADGES,
};

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {
    setTodaySteps(
      state,
      action: PayloadAction<{
        steps: number;
        heightCm?: number | null;
        weightKg?: number | null;
        gender?: Gender;
      }>,
    ) {
      const { steps, heightCm, weightKg, gender } = action.payload;
      state.todaySteps = steps;
      state.todayCalories = calculateCalories(steps, weightKg, heightCm, gender);
      state.todayDistanceKm = calculateDistanceKm(steps, heightCm, gender);
      state.todayActiveMinutes = calculateActiveMinutes(steps);
    },
    setTodayStats(
      state,
      action: PayloadAction<{
        steps: number;
        calories: number;
        distanceKm: number;
        activeMinutes: number;
      }>,
    ) {
      state.todaySteps = action.payload.steps;
      state.todayCalories = action.payload.calories;
      state.todayDistanceKm = action.payload.distanceKm;
      state.todayActiveMinutes = action.payload.activeMinutes;
    },
    addDailyRecord(state, action: PayloadAction<DailyRecord>) {
      const existingIdx = state.history.findIndex((r) => r.date === action.payload.date);
      if (existingIdx >= 0) {
        state.history[existingIdx] = action.payload;
      } else {
        state.history.push(action.payload);
      }
      // Keep last 90 days
      if (state.history.length > 90) {
        state.history = state.history.slice(-90);
      }
    },
    addMultipleDailyRecords(state, action: PayloadAction<DailyRecord[]>) {
      for (const record of action.payload) {
        const existingIdx = state.history.findIndex((r) => r.date === record.date);
        if (existingIdx >= 0) {
          state.history[existingIdx] = record;
        } else {
          state.history.push(record);
        }
      }
      if (state.history.length > 90) {
        state.history = state.history.slice(-90);
      }
    },
    unlockBadge(state, action: PayloadAction<string>) {
      const badge = state.badges.find((b) => b.id === action.payload);
      if (badge && !badge.unlockedAt) {
        badge.unlockedAt = new Date().toISOString();
      }
    },
    clearHealth(state) {
      state.todaySteps = 0;
      state.todayCalories = 0;
      state.todayDistanceKm = 0;
      state.todayActiveMinutes = 0;
      state.history = [];
    },
  },
});

export const {
  setTodaySteps,
  setTodayStats,
  addDailyRecord,
  addMultipleDailyRecords,
  unlockBadge,
  clearHealth,
} = healthSlice.actions;
export default healthSlice.reducer;
