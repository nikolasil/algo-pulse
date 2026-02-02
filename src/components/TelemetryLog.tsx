'use client';

interface LogItem {
  id: number;
  algorithm: string;
  size: number;
  pathLength?: number; // Present only in Pathfinding (Grid)
  time: number;
  success?: boolean; // Present in Pathfinding and Searching
}

export function TelemetryLog({ history }: { history: LogItem[] }) {
  const displayHistory = history.slice(0, 10);

  return (
    <section className="flex-1">
      <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
        Telemetry Log
      </h2>
      <div className="space-y-2">
        {displayHistory.length === 0 && (
          <p className="text-[10px] text-slate-600 italic">
            Waiting for execution data...
          </p>
        )}
        {displayHistory.map((item) => {
          const isGrid = item.pathLength !== undefined;
          const isSearch = !isGrid && typeof item.success === 'boolean';
          const isSorting = !isGrid && typeof item.success !== 'boolean';

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs"
            >
              <div className="flex items-center gap-3">
                {typeof item.success === 'boolean' && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.success
                        ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]'
                        : 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]'
                    }`}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-500">
                      {item.algorithm}
                    </span>
                    <span className="text-slate-200 font-mono text-[10px]">
                      {item.time}ms
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase">
                    {isGrid
                      ? `Visited: ${item.size} | Path: ${item.pathLength}`
                      : `Elements: ${item.size}`}
                  </div>
                </div>
              </div>

              {/* Tag Logic */}
              <div
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  (isGrid || isSearch) && !item.success
                    ? 'border-rose-500/20 text-rose-500 bg-rose-500/5'
                    : 'border-slate-700 text-slate-400 bg-slate-800/30'
                }`}
              >
                {isGrid || isSearch
                  ? item.success
                    ? 'FOUND'
                    : 'MISS'
                  : 'SORTED'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
