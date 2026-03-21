import type { Gender } from "@/redux/slices/userSlice";

/**
 * Calculates stride length in meters based on height and gender.
 */
export const calculateStrideLength = (heightCm?: number | null, gender?: Gender): number => {
  if (!heightCm) return 0.76; // Default 76cm
  // Estimation: Men = Height * 0.415, Women = Height * 0.413
  const multiplier = gender === "female" ? 0.413 : 0.415;
  return (heightCm * multiplier) / 100; // Return in meters
};

/**
 * Calculates distance in Kilometers from step count.
 */
export const calculateDistanceKm = (
  steps: number,
  heightCm?: number | null,
  gender?: Gender,
): number => {
  const strideMeters = calculateStrideLength(heightCm, gender);
  const distanceMeters = steps * strideMeters;
  return Number.parseFloat((distanceMeters / 1000).toFixed(2));
};

/**
 * Calculates calories burned using the MET formula.
 * ACSM formula for calories per minute = (METs * 3.5 * weightKg) / 200
 */
export const calculateCalories = (
  steps: number,
  weightKg?: number | null,
  durationMinutes?: number,
): number => {
  const weight = weightKg || 70; // default 70kg
  const time = durationMinutes || steps / 100; // Estimate 100 steps/min if time not provided

  const met = 3.5; // Average walking MET
  const caloriesPerMinute = (met * 3.5 * weight) / 200;
  const totalCalories = caloriesPerMinute * time;

  return Math.round(totalCalories);
};

/**
 * Calculates active minutes based on step count (assuming ~100 steps/min for active walking).
 */
export const calculateActiveMinutes = (steps: number): number => {
  return Math.round(steps / 100);
};
