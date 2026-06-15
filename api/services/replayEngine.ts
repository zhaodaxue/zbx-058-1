import { StepLogService } from "./stepLog.js";
import type { ReplayState, Session } from "../../shared/types.js";

export class ReplayEngineService {
  private stepLogService: StepLogService;

  constructor(stepLogService: StepLogService) {
    this.stepLogService = stepLogService;
  }

  async getReplayData(sessionId: string): Promise<{ states: ReplayState[]; session: Session | null }> {
    const session = await this.stepLogService.getSession(sessionId);
    if (!session) return { states: [], session: null };

    const steps = await this.stepLogService.getSteps(sessionId);
    const states: ReplayState[] = [];

    for (const step of steps) {
      const decisionDescription = this.buildDecisionDescription(step.yields, step.cannotPass);

      states.push({
        stepIndex: step.stepIndex,
        totalSteps: session.stepCount,
        sections: step.sectionsSnapshot,
        yields: step.yields,
        cannotPass: step.cannotPass,
        decisionDescription,
      });
    }

    return { states, session };
  }

  private buildDecisionDescription(
    yields: Array<{ trainId: string; reason: string }>,
    cannotPass: string[]
  ): string {
    const parts: string[] = [];

    if (yields.length === 0 && cannotPass.length === 0) {
      return "无让行决策";
    }

    for (const y of yields) {
      parts.push(y.reason);
    }

    if (cannotPass.length > 0) {
      parts.push(`列车 ${cannotPass.join("、")} 无法会让`);
    }

    return parts.join("；");
  }
}
