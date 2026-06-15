import { create } from "zustand";
import type { ReplayState, Session } from "../../shared/types";

interface ReplayStoreState {
  sessionId: string | null;
  session: Session | null;
  states: ReplayState[];
  currentIndex: number;
  isPlaying: boolean;
  playSpeed: number;
  loading: boolean;
  error: string | null;

  loadReplay: (sessionId: string) => Promise<void>;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (index: number) => void;
  play: () => void;
  pause: () => void;
  setPlaySpeed: (speed: number) => void;
  reset: () => void;
}

export const useReplayStore = create<ReplayStoreState>((set, get) => ({
  sessionId: null,
  session: null,
  states: [],
  currentIndex: -1,
  isPlaying: false,
  playSpeed: 1,
  loading: false,
  error: null,

  loadReplay: async (sessionId: string) => {
    set({ loading: true, error: null, sessionId });
    try {
      const res = await fetch(`/api/replay/sessions/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        set({
          session: data.session,
          states: data.states,
          currentIndex: data.states.length > 0 ? 0 : -1,
          isPlaying: false,
        });
      } else {
        set({ error: data.error });
      }
    } catch (e) {
      set({ error: "加载回放数据失败" });
    } finally {
      set({ loading: false });
    }
  },

  stepForward: () => {
    const { currentIndex, states } = get();
    if (currentIndex < states.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  stepBackward: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goToStep: (index: number) => {
    const { states } = get();
    if (index >= 0 && index < states.length) {
      set({ currentIndex: index });
    }
  },

  play: () => {
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  setPlaySpeed: (speed: number) => {
    set({ playSpeed: speed });
  },

  reset: () => {
    set({
      sessionId: null,
      session: null,
      states: [],
      currentIndex: -1,
      isPlaying: false,
      playSpeed: 1,
      error: null,
    });
  },
}));
