'use client';
import { useMemo } from 'react';

interface RawBenchmarkData {
  name: string;
  time: number;
  complexity: string;
  success: boolean;
  size?: number; // Elements/Array Size
  pathLength?: number; // Only present for Pathfinding
}

interface BenchmarkModalProps {
  data: RawBenchmarkData[];
  onClose: () => void;
  onReRun: () => void;
}

export function BenchmarkModal({
  data,
  onClose,
  onReRun,
}: BenchmarkModalProps) {
  const results = useMemo(() => {
    if (!data || data.length === 0) return [];
    const times = data.map((r) => r.time);
    const fastestTime = Math.max(0.1, Math.min(...times));

    return data.map((r) => ({
      ...r,
      isFastest: r.time <= fastestTime,
      delta:
        r.time <= fastestTime
          ? 'FASTEST'
          : `+${(((r.time - fastestTime) / fastestTime) * 100).toFixed(0)}%`,
    }));
  }, [data]);

  if (!data || data.length === 0) return null;

  const maxTime = Math.max(...results.map((r) => r.time), 1);
  const isGrid = data.some((item) => item.pathLength !== undefined);
  const isSearch =
    !isGrid && data.some((item) => typeof item.success === 'boolean');

  // Determine Title
  const modeTitle = isGrid ? 'Pathfinding' : isSearch ? 'Searching' : 'Sorting';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
            <span className="text-cyan-500">⚡</span> {modeTitle} Diagnostic
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Efficiency Chart */}
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Efficiency Chart
                </h4>
                <span className="text-[9px] text-slate-600 font-mono">ms</span>
              </div>
              <div className="space-y-6 pt-2">
                {results.map((res) => (
                  <div key={res.name} className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                      <span
                        className={
                          res.isFastest ? 'text-cyan-400' : 'text-slate-400'
                        }
                      >
                        {res.name}
                      </span>
                      <span className="text-slate-500">{res.time}ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${res.isFastest ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-600'}`}
                        style={{
                          width: `${Math.max(5, (res.time / maxTime) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Engine Data */}
            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-slate-800 pb-2 mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Engine Data
                </h4>
              </div>
              {results.map((res) => (
                <div
                  key={res.name}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${res.isFastest ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${res.isFastest ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-500'}`}
                    >
                      {res.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        {res.name}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[8px] font-bold px-1 py-0.5 rounded ${res.isFastest ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-500'}`}
                        >
                          {res.delta}
                        </span>

                        {/* Data Size Display */}
                        <span className="text-[7px] text-slate-400 font-mono uppercase">
                          {isGrid
                            ? `Visited: ${res.size ?? 0} | Path: ${res.pathLength ?? 0}`
                            : `Size: ${res.size ?? 0}`}
                        </span>

                        {(isGrid || isSearch) && (
                          <span
                            className={`text-[7px] font-bold px-1 rounded ${res.success ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}
                          >
                            {res.success ? 'FOUND' : 'MISS'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-mono font-bold ${res.isFastest ? 'text-cyan-400' : 'text-slate-300'}`}
                    >
                      {res.time}ms
                    </div>
                    <div className="text-[8px] text-slate-500 font-mono uppercase">
                      {res.complexity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all uppercase text-[9px] tracking-widest"
          >
            Dismiss
          </button>
          <button
            onClick={onReRun}
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl transition-all uppercase text-[9px] tracking-widest shadow-lg shadow-cyan-900/20"
          >
            Re-Run Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
