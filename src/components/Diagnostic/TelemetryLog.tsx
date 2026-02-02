'use client';

interface LogItem {
  id: number;
  algorithm: string;
  size: number;
  time: number;
  success?: boolean;
}

export function TelemetryLog({ history }: { history: LogItem[] }) {
  // Logic: Keep only last 10 entries for performance and UI clarity
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
          // Only show search status if success is explicitly defined (boolean)
          const isSearchEntry = typeof item.success === 'boolean';

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs"
            >
              <div className="flex items-center gap-3">
                {isSearchEntry && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.success
                        ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]'
                        : 'bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]'
                    }`}
                  />
                )}
                <div>
                  <span className="font-bold text-cyan-500">
                    {item.algorithm}
                  </span>
                  <span className="ml-2 text-slate-500 font-mono text-[10px]">
                    N={item.size}
                  </span>
                </div>
              </div>
              <div
                className={`font-mono ${
                  isSearchEntry && !item.success
                    ? 'text-rose-400/80'
                    : 'text-slate-200'
                }`}
              >
                {item.time}ms
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
