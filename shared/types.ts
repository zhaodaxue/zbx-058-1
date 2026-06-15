export interface TrackSection {
  id: string;
  name: string;
  occupiedBy: string | null;
}

export interface Train {
  id: string;
  name: string;
  length: number;
  priority: number;
}

export interface YieldDecision {
  trainId: string;
  fromSection: string;
  toSection: string | null;
  reason: string;
}

export interface Session {
  id: string;
  createdAt: string;
  stepCount: number;
}

export interface StepSubmitRequest {
  sessionId: string;
  trainId: string;
  targetSection: string;
  action: "place" | "remove";
}

export interface StepSubmitResponse {
  stepIndex: number;
  sections: TrackSection[];
  yields: YieldDecision[];
  cannotPass: string[];
  success: boolean;
  message: string;
}

export interface StepLog {
  stepIndex: number;
  sessionId: string;
  action: string;
  trainId: string;
  targetSection: string;
  timestamp: string;
  sectionsSnapshot: TrackSection[];
  yields: YieldDecision[];
  cannotPass: string[];
}

export interface ReplayState {
  stepIndex: number;
  totalSteps: number;
  sections: TrackSection[];
  yields: YieldDecision[];
  cannotPass: string[];
  decisionDescription: string;
}

export const SECTION_IDS = ["main", "siding-1", "siding-2"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_NAMES: Record<SectionId, string> = {
  main: "正线",
  "siding-1": "侧线1",
  "siding-2": "侧线2",
};

export const DEFAULT_TRAINS: Train[] = [
  { id: "train-1", name: "列车 A", length: 3, priority: 5 },
  { id: "train-2", name: "列车 B", length: 2, priority: 3 },
  { id: "train-3", name: "列车 C", length: 4, priority: 1 },
  { id: "train-4", name: "列车 D", length: 2, priority: 4 },
  { id: "train-5", name: "列车 E", length: 3, priority: 2 },
];
