import type { DailyRecord } from "@/types";
import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface HealthState {
  todaySteps: number;
  todayCalories: number;
  todayDistanceKm: number;
  history: DailyRecord[];
}

const initialState: HealthState = {
  todaySteps: 0,
  todayCalories: 0,
  todayDistanceKm: 0,
  history: [],
};

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {
    setTodaySteps(state, action: PayloadAction<number>) {
      state.todaySteps = action.payload;
      // Rough calorie estimate: ~0.04 cal per step
      state.todayCalories = Math.round(action.payload * 0.04);
      // Rough distance: ~0.0007 km per step (avg stride ~70cm)
      state.todayDistanceKm = Number.parseFloat((action.payload * 0.0007).toFixed(2));
    },
    setTodayStats(
      state,
      action: PayloadAction<{ steps: number; calories: number; distanceKm: number }>,
    ) {
      state.todaySteps = action.payload.steps;
      state.todayCalories = action.payload.calories;
      state.todayDistanceKm = action.payload.distanceKm;
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
    clearHealth(state) {
      state.todaySteps = 0;
      state.todayCalories = 0;
      state.todayDistanceKm = 0;
      state.history = [];
    },
  },
});

export const {
  setTodaySteps,
  setTodayStats,
  addDailyRecord,
  addMultipleDailyRecords,
  clearHealth,
} = healthSlice.actions;
export default healthSlice.reducer;
