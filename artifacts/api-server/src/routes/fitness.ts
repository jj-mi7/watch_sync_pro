import { Router, type IRouter, type Request, type Response } from "express";
import { db, fitnessLogsTable, dailyGoalsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router: IRouter = Router();

router.post("/fitness/sync", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { steps, calories, distanceKm, heartRate, date, locationLat, locationLon } = req.body;

  if (!steps || !calories || !distanceKm || !date) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(fitnessLogsTable)
      .where(and(eq(fitnessLogsTable.userId, (req as any).user.id), eq(fitnessLogsTable.date, date)))
      .limit(1);

    let id: string;
    if (existing.length > 0) {
      const [updated] = await db
        .update(fitnessLogsTable)
        .set({ steps, calories, distanceKm, heartRate: heartRate ?? null, locationLat: locationLat ?? null, locationLon: locationLon ?? null })
        .where(eq(fitnessLogsTable.id, existing[0].id))
        .returning();
      id = updated.id;
    } else {
      const [created] = await db
        .insert(fitnessLogsTable)
        .values({ userId: (req as any).user.id, date, steps, calories, distanceKm, heartRate: heartRate ?? null, locationLat: locationLat ?? null, locationLon: locationLon ?? null })
        .returning();
      id = created.id;
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error("Fitness sync error:", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

router.get("/fitness/logs", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const limit = parseInt(String(req.query.limit ?? "30"), 10);

  try {
    const logs = await db
      .select()
      .from(fitnessLogsTable)
      .where(eq(fitnessLogsTable.userId, (req as any).user.id))
      .orderBy(desc(fitnessLogsTable.date))
      .limit(limit);

    res.json({
      logs: logs.map(l => ({
        ...l,
        heartRate: l.heartRate ?? null,
        locationLat: l.locationLat ?? null,
        locationLon: l.locationLon ?? null,
        createdAt: l.createdAt.toISOString(),
      }))
    });
  } catch (err) {
    console.error("Get logs error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

router.get("/fitness/goal", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [goal] = await db
      .select()
      .from(dailyGoalsTable)
      .where(eq(dailyGoalsTable.userId, (req as any).user.id))
      .limit(1);

    if (!goal) {
      res.json({ steps: 8000, calories: 500, distanceKm: 5 });
      return;
    }

    res.json({ steps: goal.steps, calories: goal.calories, distanceKm: goal.distanceKm });
  } catch (err) {
    console.error("Get goal error:", err);
    res.status(500).json({ error: "Failed to fetch goal" });
  }
});

router.post("/fitness/goal", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { steps, calories, distanceKm } = req.body;

  if (!steps || !calories || !distanceKm) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(dailyGoalsTable)
      .where(eq(dailyGoalsTable.userId, (req as any).user.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(dailyGoalsTable)
        .set({ steps, calories, distanceKm })
        .where(eq(dailyGoalsTable.userId, (req as any).user.id));
    } else {
      await db
        .insert(dailyGoalsTable)
        .values({ userId: (req as any).user.id, steps, calories, distanceKm });
    }

    res.json({ steps, calories, distanceKm });
  } catch (err) {
    console.error("Set goal error:", err);
    res.status(500).json({ error: "Failed to set goal" });
  }
});

export default router;
