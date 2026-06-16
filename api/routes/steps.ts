import { Router, type Request, type Response } from "express";
import { SectionOccupationService } from "../services/sectionOccupation.js";
import { YieldDecisionService } from "../services/yieldDecision.js";
import { StepLogService } from "../services/stepLog.js";
import { getDb, queryAll } from "../db/database.js";
import type { Train, StepSubmitRequest, StepSubmitResponse } from "../../shared/types.js";

const router = Router();
const stepLogService = new StepLogService();

router.post("/submit", async (req: Request, res: Response) => {
  const { sessionId, trainId, targetSection, action } = req.body as StepSubmitRequest;

  const session = await stepLogService.getSession(sessionId);
  if (!session) {
    res.status(404).json({ success: false, error: "会话不存在" });
    return;
  }

  const db = await getDb();
  const rows = queryAll(db, "SELECT * FROM trains") as unknown as Train[];
  const sectionService = new SectionOccupationService(rows);

  const steps = await stepLogService.getSteps(sessionId);
  if (steps.length > 0) {
    const lastStep = steps[steps.length - 1];
    sectionService.loadFromSnapshot(lastStep.sectionsSnapshot);
  }

  const yieldService = new YieldDecisionService(sectionService);

  if (action === "place") {
    const yieldResult = yieldService.prepareYieldForPlace(trainId, targetSection);

    if (!yieldResult.canPlace) {
      const currentSections = sectionService.getSections();
      const hasDecision = yieldResult.cannotPass.length > 0 || yieldResult.yields.length > 0;

      let finalStepIndex = session.stepCount;
      if (hasDecision) {
        const stepLog = await stepLogService.logStep(
          sessionId,
          action,
          trainId,
          targetSection,
          currentSections,
          yieldResult.yields,
          yieldResult.cannotPass
        );
        finalStepIndex = stepLog.stepIndex;
      }

      res.json({
        stepIndex: finalStepIndex,
        sections: currentSections,
        yields: yieldResult.yields,
        cannotPass: yieldResult.cannotPass,
        success: false,
        message: yieldResult.blockReason || "无法放置列车",
      } as StepSubmitResponse);
      return;
    }

    const placeResult = sectionService.placeTrain(trainId, targetSection);
    if (!placeResult.success) {
      res.json({
        stepIndex: session.stepCount,
        sections: sectionService.getSections(),
        yields: yieldResult.yields,
        cannotPass: yieldResult.cannotPass,
        success: false,
        message: placeResult.message,
      } as StepSubmitResponse);
      return;
    }

    const currentSections = sectionService.getSections();
    const stepLog = await stepLogService.logStep(
      sessionId,
      action,
      trainId,
      targetSection,
      currentSections,
      yieldResult.yields,
      yieldResult.cannotPass
    );

    const train = sectionService.getTrain(trainId);
    const section = sectionService.getSection(targetSection);
    const successMsg = yieldResult.yields.length > 0
      ? `${train?.name || trainId} 已放入 ${section?.name || targetSection}，触发让行`
      : `${train?.name || trainId} 已放入 ${section?.name || targetSection}`;

    res.json({
      stepIndex: stepLog.stepIndex,
      sections: currentSections,
      yields: yieldResult.yields,
      cannotPass: yieldResult.cannotPass,
      success: true,
      message: successMsg,
    } as StepSubmitResponse);
  } else if (action === "remove") {
    const removeResult = sectionService.removeTrain(trainId);
    if (!removeResult.success) {
      res.json({
        stepIndex: session.stepCount,
        sections: sectionService.getSections(),
        yields: [],
        cannotPass: [],
        success: false,
        message: removeResult.message,
      } as StepSubmitResponse);
      return;
    }

    const yieldResult = yieldService.evaluateYieldOnRemove(trainId, targetSection);

    const currentSections = sectionService.getSections();
    const stepLog = await stepLogService.logStep(
      sessionId,
      action,
      trainId,
      targetSection,
      currentSections,
      yieldResult.yields,
      yieldResult.cannotPass
    );

    res.json({
      stepIndex: stepLog.stepIndex,
      sections: currentSections,
      yields: yieldResult.yields,
      cannotPass: yieldResult.cannotPass,
      success: true,
      message: removeResult.message,
    } as StepSubmitResponse);
  } else {
    res.status(400).json({ success: false, error: "无效的操作类型" });
  }
});

export default router;
