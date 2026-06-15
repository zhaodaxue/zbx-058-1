import type { Session } from "../../shared/types";

interface StatusBarProps {
  session: Session | null;
  stepCount: number;
  sections: { id: string; name: string; occupiedBy: string | null }[];
  onNewSession: () => void;
  onGoReplay: () => void;
}

export default function StatusBar({
  session,
  stepCount,
  sections,
  onNewSession,
  onGoReplay,
}: StatusBarProps) {
  const occupiedCount = sections.filter((s) => s.occupiedBy).length;

  return (
    <div className="bg-rail-gray border-b border-rail-steel/40 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h1 className="font-display font-bold text-xl text-rail-light tracking-wide">
          <span className="text-rail-orange">侧线占用</span>
          <span className="text-rail-steel mx-1">|</span>
          推演沙盘
        </h1>

        {session && (
          <div className="flex items-center gap-4 text-sm font-body">
            <span className="text-rail-steel">
              会话 <span className="text-rail-light/80 font-display">{session.id.slice(0, 8)}</span>
            </span>
            <span className="text-rail-steel">|</span>
            <span className="text-rail-steel">
              步骤 <span className="text-rail-orange font-display font-semibold">{stepCount}</span>
            </span>
            <span className="text-rail-steel">|</span>
            <span className="text-rail-steel">
              占用 <span className="text-rail-green font-display font-semibold">{occupiedCount}</span>/3
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onGoReplay}
          className="px-3 py-1.5 bg-rail-blue/20 border border-rail-blue/40 rounded-lg
            text-rail-blue text-sm font-display font-medium
            hover:bg-rail-blue/30 transition-all duration-200"
        >
          📋 回放
        </button>
        <button
          onClick={onNewSession}
          className="px-3 py-1.5 bg-rail-orange/20 border border-rail-orange/40 rounded-lg
            text-rail-orange text-sm font-display font-medium
            hover:bg-rail-orange/30 transition-all duration-200"
        >
          + 新推演
        </button>
      </div>
    </div>
  );
}
