import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSandboxStore } from "@/stores/sandboxStore";
import StatusBar from "@/components/StatusBar";
import TrainPanel from "@/components/TrainPanel";
import StationDiagram from "@/components/StationDiagram";
import StepLogPanel from "@/components/StepLogPanel";

export default function Sandbox() {
  const navigate = useNavigate();
  const {
    session,
    trains,
    sections,
    yields,
    cannotPass,
    stepCount,
    loading,
    error,
    initSession,
    fetchTrains,
    placeTrain,
    removeTrain,
    reset,
  } = useSandboxStore();

  const [dragOverSection, setDragOverSection] = useState<string | null>(null);

  useEffect(() => {
    fetchTrains();
    initSession();
  }, []);

  const placedTrainIds = sections
    .filter((s) => s.occupiedBy)
    .map((s) => s.occupiedBy!);

  const handleDrop = async (trainId: string, sectionId: string) => {
    await placeTrain(trainId, sectionId);
  };

  const handleRemove = async (trainId: string, sectionId: string) => {
    await removeTrain(trainId, sectionId);
  };

  const handleNewSession = () => {
    reset();
    initSession();
  };

  const handleGoReplay = () => {
    if (session) {
      navigate(`/replay?sessionId=${session.id}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-rail-dark font-body text-rail-light">
      <StatusBar
        session={session}
        stepCount={stepCount}
        sections={sections}
        onNewSession={handleNewSession}
        onGoReplay={handleGoReplay}
      />

      {error && (
        <div className="bg-rail-red/20 border-b border-rail-red/40 px-6 py-2 flex items-center justify-between">
          <span className="text-rail-red text-sm font-body">{error}</span>
          <button
            onClick={() => useSandboxStore.setState({ error: null })}
            className="text-rail-red/60 hover:text-rail-red text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="p-4 overflow-y-auto">
          <TrainPanel trains={trains} placedTrainIds={placedTrainIds} />
        </div>

        <div className="flex-1 flex items-center justify-center overflow-auto">
          <StationDiagram
            sections={sections}
            trains={trains}
            cannotPass={cannotPass}
            onDrop={handleDrop}
            onRemove={handleRemove}
            isDragOver={dragOverSection}
            onDragOverChange={setDragOverSection}
          />
        </div>

        <div className="p-4 overflow-y-auto">
          <StepLogPanel
            yields={yields}
            cannotPass={cannotPass}
            stepCount={stepCount}
            sections={sections}
          />
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-rail-dark/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-rail-steel/80 rounded-xl px-6 py-3 font-display text-rail-light">
            处理中...
          </div>
        </div>
      )}
    </div>
  );
}
