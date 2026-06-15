import type { TrackSection, YieldDecision } from "../../shared/types";

interface StepLogPanelProps {
  yields: YieldDecision[];
  cannotPass: string[];
  stepCount: number;
  sections: TrackSection[];
}

export default function StepLogPanel({
  yields,
  cannotPass,
  stepCount,
  sections,
}: StepLogPanelProps) {
  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-rail-dark/50 border border-rail-steel/30 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="font-display font-bold text-rail-light text-lg mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-rail-green rounded-full" />
          推演日志
        </h3>

        <div className="mb-4 p-3 bg-rail-steel/20 rounded-lg">
          <div className="text-xs text-rail-light/60 font-body mb-1">当前步骤</div>
          <div className="font-display font-bold text-2xl text-rail-orange">
            #{stepCount}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-rail-light/60 font-body mb-2">区段状态</div>
          <div className="flex flex-col gap-1.5">
            {sections.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span
                  className={`font-display font-medium ${
                    s.id === "main" ? "text-rail-orange" : "text-rail-blue"
                  }`}
                >
                  {s.name}
                </span>
                <span
                  className={`text-xs font-body ${
                    s.occupiedBy ? "text-rail-green" : "text-rail-steel/50"
                  }`}
                >
                  {s.occupiedBy || "空闲"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {yields.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-rail-light/60 font-body mb-2">让行决策</div>
            <div className="flex flex-col gap-2">
              {yields.map((y, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg text-xs font-body ${
                    y.toSection
                      ? "bg-rail-blue/20 border border-rail-blue/30 text-rail-light/90"
                      : "bg-rail-red/20 border border-rail-red/30 text-rail-light/90"
                  }`}
                >
                  <div className="font-semibold mb-0.5">
                    {y.toSection ? "🔄 让行" : "⚠ 无法会让"}
                  </div>
                  <div className="text-rail-light/70">{y.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cannotPass.length > 0 && (
          <div className="p-2 bg-rail-red/10 border border-rail-red/30 rounded-lg">
            <div className="text-xs font-body text-rail-red font-semibold mb-1">
              无法会让
            </div>
            <div className="text-xs font-body text-rail-red/80">
              列车 {cannotPass.join("、")} 无法找到空闲侧线
            </div>
          </div>
        )}

        {yields.length === 0 && cannotPass.length === 0 && stepCount > 0 && (
          <div className="text-xs text-rail-steel/60 font-body text-center py-2">
            本步无让行决策
          </div>
        )}
      </div>
    </div>
  );
}
