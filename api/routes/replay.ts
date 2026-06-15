import { Router, type Request, type Response } from "express";
import { ReplayEngineService } from "../services/replayEngine.js";
import { StepLogService } from "../services/stepLog.js";

const router = Router();
const stepLogService = new StepLogService();
const replayEngine = new ReplayEngineService(stepLogService);

router.get("/sessions/:id", async (req: Request, res: Response) => {
  const result = await replayEngine.getReplayData(req.params.id);
  if (!result.session) {
    res.status(404).json({ success: false, error: "会话不存在" });
    return;
  }
  res.json({ success: true, ...result });
});

export default router;
