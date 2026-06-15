import { create } from "zustand";
import type { Train, TrackSection, YieldDecision, Session } from "../../shared/types";

interface SandboxState {
  session: Session | null;
  trains: Train[];
  sections: TrackSection[];
  yields: YieldDecision[];
  cannotPass: string[];
  stepCount: number;
  loading: boolean;
  error: string | null;

  initSession: () => Promise<void>;
  fetchTrains: () => Promise<void>;
  placeTrain: (trainId: string, sectionId: string) => Promise<void>;
  removeTrain: (trainId: string, sectionId: string) => Promise<void>;
  reset: () => void;
}

const INITIAL_SECTIONS: TrackSection[] = [
  { id: "main", name: "正线", occupiedBy: null },
  { id: "siding-1", name: "侧线1", occupiedBy: null },
  { id: "siding-2", name: "侧线2", occupiedBy: null },
];

export const useSandboxStore = create<SandboxState>((set, get) => ({
  session: null,
  trains: [],
  sections: INITIAL_SECTIONS,
  yields: [],
  cannotPass: [],
  stepCount: 0,
  loading: false,
  error: null,

  initSession: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        set({ session: data.session, stepCount: 0, sections: INITIAL_SECTIONS, yields: [], cannotPass: [] });
      }
    } catch (e) {
      set({ error: "创建会话失败" });
    } finally {
      set({ loading: false });
    }
  },

  fetchTrains: async () => {
    try {
      const res = await fetch("/api/sessions/trains");
      const data = await res.json();
      if (data.success) {
        set({ trains: data.trains });
      }
    } catch (e) {
      set({ error: "获取列车数据失败" });
    }
  },

  placeTrain: async (trainId: string, sectionId: string) => {
    const { session } = get();
    if (!session) return;

    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/steps/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          trainId,
          targetSection: sectionId,
          action: "place",
        }),
      });
      const data = await res.json();
      if (data.success) {
        set({
          sections: data.sections,
          yields: data.yields,
          cannotPass: data.cannotPass,
          stepCount: data.stepIndex + 1,
        });
      } else {
        set({ error: data.message });
      }
    } catch (e) {
      set({ error: "提交步骤失败" });
    } finally {
      set({ loading: false });
    }
  },

  removeTrain: async (trainId: string, sectionId: string) => {
    const { session } = get();
    if (!session) return;

    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/steps/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          trainId,
          targetSection: sectionId,
          action: "remove",
        }),
      });
      const data = await res.json();
      if (data.success) {
        set({
          sections: data.sections,
          yields: data.yields,
          cannotPass: data.cannotPass,
          stepCount: data.stepIndex + 1,
        });
      } else {
        set({ error: data.message });
      }
    } catch (e) {
      set({ error: "提交步骤失败" });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    set({
      session: null,
      sections: INITIAL_SECTIONS,
      yields: [],
      cannotPass: [],
      stepCount: 0,
      error: null,
    });
  },
}));
