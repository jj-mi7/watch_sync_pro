import { format, parseISO, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';
import type { ActivityData } from '../types';

export const formatSteps = (steps: number): string => {
  if (steps >= 1000) return `${(steps / 1000).toFixed(1)}k`;
  return steps.toString();
};

export const formatDistance = (km: number): string => {
  return `${km.toFixed(2)} km`;
};

export const formatCalories = (cal: number): string => {
  return `${cal.toLocaleString()} kcal`;
};

export const getProgressPercent = (current: number, goal: number): number => {
  return Math.min(Math.round((current / goal) * 100), 100);
};

export const getWeeklyData = (
  history: ActivityData[],
): { label: string; steps: number; calories: number; km: number }[] => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const end = endOfWeek(now, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const entry = history.find((h) => h.date === dateStr);
    return {
      label: format(day, 'EEE'),
      steps: entry?.steps ?? 0,
      calories: entry?.calories ?? 0,
      km: entry?.distanceKm ?? 0,
    };
  });
};

export const getLast7DaysData = (
  history: ActivityData[],
): { label: string; steps: number; calories: number; km: number }[] => {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = history.find((h) => h.date === dateStr);
    result.push({
      label: format(d, 'EEE'),
      steps: entry?.steps ?? 0,
      calories: entry?.calories ?? 0,
      km: entry?.distanceKm ?? 0,
    });
  }
  return result;
};

export const generateDemoHistory = (): ActivityData[] => {
  const history: ActivityData[] = [];
  for (let i = 29; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const steps = Math.floor(Math.random() * 8000 + 3000);
    history.push({
      date: format(d, 'yyyy-MM-dd'),
      steps,
      calories: Math.floor(steps * 0.04),
      distanceKm: Number((steps * 0.00078).toFixed(2)),
      activeMinutes: Math.floor(steps / 100),
      heartRate: Math.floor(Math.random() * 20 + 65),
      timestamp: d.getTime(),
    });
  }
  return history;
};
