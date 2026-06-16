import { StepLogService } from "./stepLog.js";
import { getDb, queryAll } from "../db/database.js";
import type { ReplayState, Session, Train } from "../../shared/types.js";

export class ReplayEngineService {
  private stepLogService: StepLogService;
  private trainsCache: Train[] | null = null;

  constructor(stepLogService: StepLogService) {
    this.stepLogService = stepLogService;
  }

  private async getTrains(): Promise<Train[]> {
    if (this.trainsCache) return this.trainsCache;
    const db = await getDb();
    this.trainsCache = queryAll(db, "SELECT * FROM trains") as unknown as Train[];
    return this.trainsCache;
  }

  private getTrainName(trains: Train[], id: string): string {
    const t = trains.find((tr) => tr.id === id);
    return t ? t.name : id;
  }

  async getReplayData(sessionId: string): Promise<{ states: ReplayState[]; session: Session | null }> {
    const session = await this.stepLogService.getSession(sessionId);
    if (!session) return { states: [], session: null };

    const steps = await this.stepLogService.getSteps(sessionId);
    const trains = await this.getTrains();
    const states: ReplayState[] = [];

    for (const step of steps) {
      const decisionDescription = this.buildDecisionDescription(step.yields, step.cannotPass, trains);

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
    cannotPass: string[],
    trains: Train[]
  ): string {
    const parts: string[] = [];

    if (yields.length === 0 && cannotPass.length === 0) {
      return "无让行决策";
    }

    for (const y of yields) {
      parts.push(y.reason);
    }

    if (cannotPass.length > 0) {
      const names = cannotPass.map((id) => this.getTrainName(trains, id));
      parts.push(`${names.join("、")} 无法会让`);
    }

    return parts.join("；");
  }
}
