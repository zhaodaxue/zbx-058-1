import { Router, type Request, type Response } from "express";
import { getDb, queryAll, queryOne, runStatement } from "../db/database.js";
import { StepLogService } from "../services/stepLog.js";
import type { Train } from "../../shared/types.js";

const router = Router();
const stepLogService = new StepLogService();

router.get("/trains", async (_req: Request, res: Response) => {
  const db = await getDb();
  const rows = queryAll(db, "SELECT * FROM trains") as unknown as Train[];
  res.json({ success: true, trains: rows });
});

router.post("/", async (_req: Request, res: Response) => {
  const session = await stepLogService.createSession();
  res.json({ success: true, session });
});

router.get("/:id", async (req: Request, res: Response) => {
  const session = await stepLogService.getSession(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, error: "会话不存在" });
    return;
  }
  res.json({ success: true, session });
});

router.get("/", async (_req: Request, res: Response) => {
  const db = await getDb();
  const sessions = queryAll(db, "SELECT * FROM sessions ORDER BY createdAt DESC");
  res.json({ success: true, sessions });
});

router.get("/:id/steps", async (req: Request, res: Response) => {
  const steps = await stepLogService.getSteps(req.params.id);
  res.json({ success: true, steps });
});

router.get("/:id/steps/:index", async (req: Request, res: Response) => {
  const step = await stepLogService.getStep(req.params.id, parseInt(req.params.index));
  if (!step) {
    res.status(404).json({ success: false, error: "步骤不存在" });
    return;
  }
  res.json({ success: true, step });
});

export default router;
