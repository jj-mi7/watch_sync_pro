import type { Gender } from "@/redux/slices/userSlice";

export interface ActivityStats {
  distanceKm: number;
  caloriesBurned: number;
  weightLostKg: number;
}

/**
 * Calculates stride length in meters based on height and gender.
 */
export const calculateStrideLength = (heightCm?: number | null, gender?: Gender): number => {
  if (!heightCm) return 0.76; // Default 76cm
  const multiplier = gender === "female" ? 0.413 : 0.415;
  return (heightCm * multiplier) / 100; // Return in meters
};

/**
 * Calculates distance, calories, and weight loss from step count.
 * @param steps - Total steps counted
 * @param heightCm - User's height in centimeters
 * @param weightKg - User's weight in kilograms
 * @param isMale - Boolean for gender-based step length
 * @returns ActivityStats object
 */
export const calculateStepStats = (
  steps: number,
  heightCm: number,
  weightKg: number,
  isMale = true,
): ActivityStats => {
  // 1. Calculate Step Length in meters
  const heightM = heightCm / 100;
  const stepMultiplier = isMale ? 0.415 : 0.413;
  const stepLengthM = heightM * stepMultiplier;

  // 2. Calculate Distance in km
  const distanceKm = (steps * stepLengthM) / 1000;

  // 3. Calculate Calories (0.75 kcal per kg per km for walking)
  const caloriesBurned = distanceKm * weightKg * 0.75;

  // 4. Calculate Weight Loss (7700 kcal = 1 kg of fat)
  const weightLostKg = caloriesBurned / 7700;

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    caloriesBurned: Number(caloriesBurned.toFixed(0)),
    weightLostKg: Number(weightLostKg.toFixed(4)),
  };
};

// ── Convenience wrappers (backward-compatible) ──────────────────────────────

/**
 * Calculates distance in Kilometers from step count.
 */
export const calculateDistanceKm = (
  steps: number,
  heightCm?: number | null,
  gender?: Gender,
): number => {
  const h = heightCm || 170;
  const stats = calculateStepStats(steps, h, 70, gender !== "female");
  return stats.distanceKm;
};

/**
 * Calculates calories burned from step count using the walking formula.
 * Cal = Distance(km) × Weight(kg) × 0.75
 */
export const calculateCalories = (
  steps: number,
  weightKg?: number | null,
  heightCm?: number | null,
  gender?: Gender,
): number => {
  const w = weightKg || 70;
  const h = heightCm || 170;
  const stats = calculateStepStats(steps, h, w, gender !== "female");
  return stats.caloriesBurned;
};

/**
 * Calculates active minutes based on step count (assuming ~100 steps/min for active walking).
 */
export const calculateActiveMinutes = (steps: number): number => {
  return Math.round(steps / 100);
};
