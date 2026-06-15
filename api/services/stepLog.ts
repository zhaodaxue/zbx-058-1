import { getDb, queryAll, queryOne, runStatement } from "../db/database.js";
import type { Session, StepLog, TrackSection, YieldDecision } from "../../shared/types.js";
import { v4 as uuidv4 } from "uuid";

export class StepLogService {
  async createSession(): Promise<Session> {
    const db = await getDb();
    const session: Session = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      stepCount: 0,
    };

    runStatement(db, "INSERT INTO sessions (id, createdAt, stepCount) VALUES (?, ?, ?)", [
      session.id,
      session.createdAt,
      session.stepCount,
    ]);

    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const db = await getDb();
    const row = queryOne(db, "SELECT * FROM sessions WHERE id = ?", [sessionId]);
    if (!row) return null;
    return {
      id: row.id as string,
      createdAt: row.createdAt as string,
      stepCount: row.stepCount as number,
    };
  }

  async logStep(
    sessionId: string,
    action: string,
    trainId: string,
    targetSection: string,
    sectionsSnapshot: TrackSection[],
    yields: YieldDecision[],
    cannotPass: string[]
  ): Promise<StepLog> {
    const db = await getDb();
    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`会话 ${sessionId} 不存在`);

    const stepIndex = session.stepCount;
    const timestamp = new Date().toISOString();

    runStatement(
      db,
      `INSERT INTO step_logs (sessionId, stepIndex, action, trainId, targetSection, timestamp, sectionsSnapshot, yields, cannotPass)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        stepIndex,
        action,
        trainId,
        targetSection,
        timestamp,
        JSON.stringify(sectionsSnapshot),
        JSON.stringify(yields),
        JSON.stringify(cannotPass),
      ]
    );

    runStatement(db, "UPDATE sessions SET stepCount = stepCount + 1 WHERE id = ?", [sessionId]);

    return {
      stepIndex,
      sessionId,
      action,
      trainId,
      targetSection,
      timestamp,
      sectionsSnapshot,
      yields,
      cannotPass,
    };
  }

  async getSteps(sessionId: string): Promise<StepLog[]> {
    const db = await getDb();
    const rows = queryAll(db, "SELECT * FROM step_logs WHERE sessionId = ? ORDER BY stepIndex ASC", [sessionId]);

    return rows.map((row) => ({
      stepIndex: row.stepIndex as number,
      sessionId: row.sessionId as string,
      action: row.action as string,
      trainId: row.trainId as string,
      targetSection: row.targetSection as string,
      timestamp: row.timestamp as string,
      sectionsSnapshot: JSON.parse(row.sectionsSnapshot as string),
      yields: JSON.parse(row.yields as string),
      cannotPass: JSON.parse(row.cannotPass as string),
    }));
  }

  async getStep(sessionId: string, stepIndex: number): Promise<StepLog | null> {
    const db = await getDb();
    const row = queryOne(db, "SELECT * FROM step_logs WHERE sessionId = ? AND stepIndex = ?", [
      sessionId,
      stepIndex,
    ]);

    if (!row) return null;

    return {
      stepIndex: row.stepIndex as number,
      sessionId: row.sessionId as string,
      action: row.action as string,
      trainId: row.trainId as string,
      targetSection: row.targetSection as string,
      timestamp: row.timestamp as string,
      sectionsSnapshot: JSON.parse(row.sectionsSnapshot as string),
      yields: JSON.parse(row.yields as string),
      cannotPass: JSON.parse(row.cannotPass as string),
    };
  }
}
