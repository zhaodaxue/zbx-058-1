import { useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useReplayStore } from "@/stores/replayStore";
import StationDiagram from "@/components/StationDiagram";
import type { TrackSection } from "../../shared/types";

const INITIAL_SECTIONS: TrackSection[] = [
  { id: "main", name: "正线", occupiedBy: null },
  { id: "siding-1", name: "侧线1", occupiedBy: null },
  { id: "siding-2", name: "侧线2", occupiedBy: null },
];

export default function Replay() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    sessionId,
    states,
    currentIndex,
    isPlaying,
    playSpeed,
    loading,
    error,
    loadReplay,
    stepForward,
    stepBackward,
    goToStep,
    play,
    pause,
    setPlaySpeed,
  } = useReplayStore();

  useEffect(() => {
    const sid = searchParams.get("sessionId");
    if (sid) {
      loadReplay(sid);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const { currentIndex, states } = useReplayStore.getState();
        if (currentIndex < states.length - 1) {
          stepForward();
        } else {
          pause();
        }
      }, 1500 / playSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playSpeed, stepForward, pause]);

  const currentState = currentIndex >= 0 && currentIndex < states.length ? states[currentIndex] : null;
  const currentSections = currentState?.sections || INITIAL_SECTIONS;
  const currentYields = currentState?.yields || [];
  const currentCannotPass = currentState?.cannotPass || [];
  const decisionText = currentState?.decisionDescription || "";

  const trains = [
    { id: "train-1", name: "列车 A", length: 3, priority: 5 },
    { id: "train-2", name: "列车 B", length: 2, priority: 3 },
    { id: "train-3", name: "列车 C", length: 4, priority: 1 },
    { id: "train-4", name: "列车 D", length: 2, priority: 4 },
    { id: "train-5", name: "列车 E", length: 3, priority: 2 },
  ];

  const handleGoBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col bg-rail-dark font-body text-rail-light">
      <div className="bg-rail-gray border-b border-rail-steel/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-xl text-rail-light tracking-wide">
            <span className="text-rail-blue">推演回放</span>
            <span className="text-rail-steel mx-1">|</span>
            {sessionId ? sessionId.slice(0, 8) : "---"}
          </h1>
        </div>
        <button
          onClick={handleGoBack}
          className="px-3 py-1.5 bg-rail-steel/30 border border-rail-steel/40 rounded-lg
            text-rail-light text-sm font-display font-medium
            hover:bg-rail-steel/50 transition-all duration-200"
        >
          ← 返回沙盘
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <StationDiagram
            sections={currentSections}
            trains={trains}
            cannotPass={currentCannotPass}
            onDrop={() => {}}
            onRemove={() => {}}
          />
        </div>

        {decisionText && decisionText !== "无让行决策" && (
          <div className="px-6 py-2 bg-rail-steel/20 border-t border-rail-steel/30 text-center">
            <span className="text-xs text-rail-steel mr-2">决策：</span>
            <span className="text-sm text-rail-light/90 font-body">{decisionText}</span>
          </div>
        )}

        <div className="bg-rail-gray border-t border-rail-steel/40 px-6 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto mb-3">
            <div className="font-display font-bold text-sm text-rail-light">
              步骤 {currentIndex >= 0 ? currentIndex + 1 : 0} / {states.length}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-rail-steel font-body">速度</span>
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaySpeed(speed)}
                  className={`px-2 py-0.5 rounded text-xs font-display font-medium transition-all ${
                    playSpeed === speed
                      ? "bg-rail-orange text-white"
                      : "bg-rail-steel/30 text-rail-light/60 hover:bg-rail-steel/50"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => goToStep(0)}
              disabled={currentIndex <= 0}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-rail-steel/30
                text-rail-light hover:bg-rail-steel/50 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all text-sm"
            >
              ⏮
            </button>
            <button
              onClick={stepBackward}
              disabled={currentIndex <= 0}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-rail-steel/30
                text-rail-light hover:bg-rail-steel/50 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all text-sm"
            >
              ⏪
            </button>
            <button
              onClick={isPlaying ? pause : play}
              className="w-12 h-12 flex items-center justify-center rounded-full
                bg-rail-orange text-white font-bold text-lg
                hover:bg-rail-orange/80 transition-all shadow-lg shadow-rail-orange/30"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              onClick={stepForward}
              disabled={currentIndex >= states.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-rail-steel/30
                text-rail-light hover:bg-rail-steel/50 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all text-sm"
            >
              ⏩
            </button>
            <button
              onClick={() => goToStep(states.length - 1)}
              disabled={currentIndex >= states.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-rail-steel/30
                text-rail-light hover:bg-rail-steel/50 disabled:opacity-30 disabled:cursor-not-allowed
                transition-all text-sm"
            >
              ⏭
            </button>
          </div>

          <div className="relative h-2 bg-rail-steel/30 rounded-full overflow-hidden max-w-3xl mx-auto">
            {states.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`
                  absolute top-0 h-full w-1 min-w-[4px] transition-all duration-200
                  ${i <= currentIndex ? "bg-rail-orange" : "bg-rail-steel/50"}
                  hover:bg-rail-orange/80
                `}
                style={{
                  left: `${(i / states.length) * 100}%`,
                  width: `${Math.max(100 / states.length, 1)}%`,
                }}
                title={`步骤 ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-rail-dark/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-rail-steel/80 rounded-xl px-6 py-3 font-display text-rail-light">
            加载回放数据...
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-rail-dark/80 flex items-center justify-center z-50">
          <div className="bg-rail-gray rounded-xl p-6 text-center max-w-md">
            <div className="text-rail-red text-lg font-display font-bold mb-2">加载失败</div>
            <div className="text-rail-light/60 text-sm font-body mb-4">{error}</div>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-rail-orange/20 border border-rail-orange/40 rounded-lg
                text-rail-orange text-sm font-display font-medium hover:bg-rail-orange/30"
            >
              返回沙盘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
