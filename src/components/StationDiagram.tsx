import type { TrackSection, Train } from "../../shared/types";

interface StationDiagramProps {
  sections: TrackSection[];
  trains: Train[];
  cannotPass: string[];
  onDrop: (trainId: string, sectionId: string) => void;
  onRemove: (trainId: string, sectionId: string) => void;
  isDragOver?: string | null;
  onDragOverChange?: (sectionId: string | null) => void;
}

export default function StationDiagram({
  sections,
  trains,
  cannotPass,
  onDrop,
  onRemove,
  isDragOver,
  onDragOverChange,
}: StationDiagramProps) {
  const mainSection = sections.find((s) => s.id === "main")!;
  const siding1 = sections.find((s) => s.id === "siding-1")!;
  const siding2 = sections.find((s) => s.id === "siding-2")!;

  const getTrain = (id: string | null) => {
    if (!id) return null;
    return trains.find((t) => t.id === id) || null;
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOverChange?.(sectionId);
  };

  const handleDragLeave = () => {
    onDragOverChange?.(null);
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const trainId = e.dataTransfer.getData("trainId");
    if (trainId) {
      onDrop(trainId, sectionId);
    }
    onDragOverChange?.(null);
  };

  const renderTrackSection = (
    section: TrackSection,
    trackType: "main" | "siding",
    position: "top" | "middle" | "bottom"
  ) => {
    const train = getTrain(section.occupiedBy);
    const isOccupied = !!section.occupiedBy;
    const isCannotPass = section.occupiedBy ? cannotPass.includes(section.occupiedBy) : false;
    const isOver = isDragOver === section.id;

    return (
      <div
        key={section.id}
        className={`
          relative flex items-center transition-all duration-300
          ${trackType === "main" ? "h-24" : "h-20"}
          ${isOver && !isOccupied ? "ring-2 ring-rail-green ring-opacity-70 bg-rail-green/10" : ""}
          ${isOver && isOccupied ? "ring-2 ring-rail-red ring-opacity-70 bg-rail-red/10" : ""}
        `}
        onDragOver={(e) => handleDragOver(e, section.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, section.id)}
      >
        <div
          className={`
            w-full h-1.5 rounded-full relative
            ${trackType === "main" ? "bg-rail-brown" : "bg-rail-steel"}
            ${isOccupied ? "shadow-lg" : ""}
          `}
        >
          {trackType === "main" && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rail-light/10 to-transparent" />
          )}

          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-rail-brown/60 rounded-sm"
              style={{ left: `${i * 5 + 2}%` }}
            />
          ))}
        </div>

        {section.name && (
          <div
            className={`
              absolute -left-2 -translate-x-full font-display font-semibold text-sm
              ${trackType === "main" ? "text-rail-orange" : "text-rail-blue"}
              whitespace-nowrap
            `}
          >
            {section.name}
          </div>
        )}

        {train && (
          <div
            className={`
              absolute z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md
              font-display font-semibold text-sm cursor-pointer
              transition-all duration-300 animate-slide-in
              ${isCannotPass ? "bg-rail-red text-white animate-shake animate-pulse-red" : ""}
              ${!isCannotPass && trackType === "main" ? "bg-rail-green text-white" : ""}
              ${!isCannotPass && trackType !== "main" ? "bg-rail-blue text-white" : ""}
            `}
            style={{
              left: "15%",
              width: `${train.length * 15}%`,
              minWidth: "80px",
            }}
            onClick={() => onRemove(train.id, section.id)}
            title={`点击移出 ${train.name}`}
          >
            <span className="truncate">{train.name}</span>
            <span className="text-xs opacity-80">P{train.priority}</span>
            <span className="text-xs opacity-60">L{train.length}</span>
            {isCannotPass && (
              <span className="ml-1 text-xs font-bold">⚠ 无法会让</span>
            )}
          </div>
        )}

        {!isOccupied && !isOver && (
          <div className="absolute left-1/2 -translate-x-1/2 text-rail-steel/50 text-xs font-body">
            空闲
          </div>
        )}

        {isOver && !isOccupied && (
          <div className="absolute left-1/2 -translate-x-1/2 text-rail-green text-xs font-body font-medium animate-pulse">
            放置列车
          </div>
        )}

        {isOver && isOccupied && (
          <div className="absolute left-1/2 -translate-x-1/2 text-rail-red text-xs font-body font-medium">
            区段已占用
          </div>
        )}

        {position === "top" && siding1.occupiedBy && (
          <div className="absolute -bottom-3 left-[20%] w-0.5 h-3 bg-rail-blue/40" />
        )}
        {position === "top" && siding1.occupiedBy && (
          <div className="absolute -bottom-3 left-[20%] w-[30%] h-0.5 bg-rail-blue/40" />
        )}

        {position === "bottom" && siding2.occupiedBy && (
          <div className="absolute -top-3 left-[60%] w-0.5 h-3 bg-rail-blue/40" />
        )}
        {position === "bottom" && siding2.occupiedBy && (
          <div className="absolute -top-3 left-[30%] w-[30%] h-0.5 bg-rail-blue/40" />
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto py-8">
      <div className="bg-rail-dark/50 border border-rail-steel/30 rounded-xl p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 ml-16">
          {renderTrackSection(siding1, "siding", "top")}
          {renderTrackSection(mainSection, "main", "middle")}
          {renderTrackSection(siding2, "siding", "bottom")}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 text-rail-steel/60">
          <div className="w-2 h-2 rounded-full bg-rail-green" />
          <span className="text-xs font-body">正线</span>
          <div className="w-2 h-2 rounded-full bg-rail-blue" />
          <span className="text-xs font-body">侧线</span>
          <div className="w-2 h-2 rounded-full bg-rail-red" />
          <span className="text-xs font-body">冲突</span>
        </div>
      </div>
    </div>
  );
}
