import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

export type Gender = "male" | "female" | "other" | null;

interface UserState {
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  gender: Gender;
  onboardingComplete: boolean;
}

const initialState: UserState = {
  heightCm: null,
  weightKg: null,
  age: null,
  gender: null,
  onboardingComplete: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setBiometrics: (
      state,
      action: PayloadAction<{
        heightCm: number;
        weightKg: number;
        age: number;
        gender: Gender;
      }>,
    ) => {
      state.heightCm = action.payload.heightCm;
      state.weightKg = action.payload.weightKg;
      state.age = action.payload.age;
      state.gender = action.payload.gender;
    },
    completeOnboarding: (state) => {
      state.onboardingComplete = true;
    },
    resetUser: () => initialState,
  },
});

export const { setBiometrics, completeOnboarding, resetUser } = userSlice.actions;
export default userSlice.reducer;
