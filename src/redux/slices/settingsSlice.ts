import { calculateStepStats } from "@/utils/healthMath";
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
    /**
     * Set step goal and auto-compute calorie, distance, and active goals
     * using user's biometrics.
     */
    setAllGoalsFromSteps(
      state,
      action: PayloadAction<{
        steps: number;
        heightCm: number;
        weightKg: number;
        isMale: boolean;
      }>,
    ) {
      const { steps, heightCm, weightKg, isMale } = action.payload;
      const stats = calculateStepStats(steps, heightCm, weightKg, isMale);
      state.dailyStepGoal = steps;
      state.dailyCalorieGoal = stats.caloriesBurned;
      state.dailyDistanceGoalKm = stats.distanceKm;
      state.dailyActiveGoal = Math.round(steps / 100);
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
  setAllGoalsFromSteps,
  resetGoals,
} = settingsSlice.actions;
export default settingsSlice.reducer;
