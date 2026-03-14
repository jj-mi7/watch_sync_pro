import { sql } from "drizzle-orm";
import { doublePrecision, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fitnessLogsTable = pgTable("fitness_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  steps: integer("steps").notNull().default(0),
  calories: doublePrecision("calories").notNull().default(0),
  distanceKm: doublePrecision("distance_km").notNull().default(0),
  heartRate: integer("heart_rate"),
  locationLat: doublePrecision("location_lat"),
  locationLon: doublePrecision("location_lon"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const dailyGoalsTable = pgTable("daily_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  steps: integer("steps").notNull().default(8000),
  calories: doublePrecision("calories").notNull().default(500),
  distanceKm: doublePrecision("distance_km").notNull().default(5),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFitnessLogSchema = createInsertSchema(fitnessLogsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFitnessLog = z.infer<typeof insertFitnessLogSchema>;
export type FitnessLog = typeof fitnessLogsTable.$inferSelect;

export const insertDailyGoalSchema = createInsertSchema(dailyGoalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;
export type DailyGoal = typeof dailyGoalsTable.$inferSelect;
