import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  dailyStepGoal: number;
  dailyCalorieGoal: number;
  dailyDistanceGoalKm: number;
  dailyActiveGoal: number;
  units: "metric" | "imperial";
}

const initialState: SettingsState = {
  dailyStepGoal: 10000,
  dailyCalorieGoal: 400,
  dailyDistanceGoalKm: 7,
  dailyActiveGoal: 30,
  units: "metric",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setDailyStepGoal(state, action: PayloadAction<number>) {
      state.dailyStepGoal = action.payload;
    },
    setDailyCalorieGoal(state, action: PayloadAction<number>) {
      state.dailyCalorieGoal = action.payload;
    },
    setDailyDistanceGoal(state, action: PayloadAction<number>) {
      state.dailyDistanceGoalKm = action.payload;
    },
    setDailyActiveGoal(state, action: PayloadAction<number>) {
      state.dailyActiveGoal = action.payload;
    },
    setUnits(state, action: PayloadAction<"metric" | "imperial">) {
      state.units = action.payload;
    },
    resetGoals(state) {
      state.dailyStepGoal = 10000;
      state.dailyCalorieGoal = 400;
      state.dailyDistanceGoalKm = 7;
      state.dailyActiveGoal = 30;
    },
  },
});

export const {
  setDailyStepGoal,
  setDailyCalorieGoal,
  setDailyDistanceGoal,
  setDailyActiveGoal,
  setUnits,
  resetGoals,
} = settingsSlice.actions;
export default settingsSlice.reducer;
