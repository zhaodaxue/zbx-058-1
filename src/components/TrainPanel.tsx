import type { Train } from "../../shared/types";

interface TrainPanelProps {
  trains: Train[];
  placedTrainIds: string[];
}

export default function TrainPanel({ trains, placedTrainIds }: TrainPanelProps) {
  const handleDragStart = (e: React.DragEvent, trainId: string) => {
    e.dataTransfer.setData("trainId", trainId);
    e.dataTransfer.effectAllowed = "move";
  };

  const availableTrains = trains.filter((t) => !placedTrainIds.includes(t.id));

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-rail-dark/50 border border-rail-steel/30 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="font-display font-bold text-rail-light text-lg mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-rail-orange rounded-full" />
          列车编组
        </h3>

        <div className="flex flex-col gap-2">
          {availableTrains.map((train) => (
            <div
              key={train.id}
              draggable
              onDragStart={(e) => handleDragStart(e, train.id)}
              className="
                bg-rail-steel/30 border border-rail-steel/50 rounded-lg p-3
                cursor-grab active:cursor-grabbing
                hover:bg-rail-steel/50 hover:border-rail-orange/50
                transition-all duration-200
                select-none
              "
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-semibold text-rail-light text-sm">
                  {train.name}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < train.priority ? "bg-rail-orange" : "bg-rail-steel/40"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-rail-light/60 font-body">长度</span>
                <div className="flex-1 h-1.5 bg-rail-steel/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rail-blue/70 rounded-full"
                    style={{ width: `${(train.length / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-rail-light/80 font-display">{train.length}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-rail-light/60 font-body">优先级</span>
                <span className="text-xs text-rail-orange font-display font-semibold">
                  {train.priority}
                </span>
              </div>
            </div>
          ))}

          {availableTrains.length === 0 && (
            <div className="text-rail-steel/60 text-sm text-center py-4 font-body">
              所有列车已在站场中
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-rail-steel/30">
          <p className="text-xs text-rail-steel/60 font-body">
            拖拽列车块至站场图区段放置
          </p>
          <p className="text-xs text-rail-steel/60 font-body mt-1">
            点击站场中列车可移出
          </p>
        </div>
      </div>
    </div>
  );
}
