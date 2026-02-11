'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, Trophy, TrendingUp } from 'lucide-react';

export interface RawBenchmarkData {
  name: string;
  time: number;
  complexity: string;
  success?: boolean;
  size?: number;
  pathLength?: number;
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

  const modeTitle = isGrid ? 'Pathfinding' : isSearch ? 'Searching' : 'Sorting';

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-surface-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-surface-900 border border-surface-700 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-800 flex items-center justify-between bg-surface-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Trophy size={20} className="text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-100">
                {modeTitle} Diagnostic
              </h3>
              <p className="text-xs text-surface-500">
                Performance comparison results
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-800 transition-colors touch-target"
            aria-label="Close modal"
          >
            <X size={18} className="text-surface-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Efficiency Chart */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary-400" />
              <h4 className="text-sm font-bold text-surface-200 uppercase tracking-wide">
                Efficiency Chart
              </h4>
            </div>
            <div className="space-y-3">
              {results.map((res) => (
                <div key={res.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        res.isFastest ? 'text-primary-400' : 'text-surface-300'
                      }`}
                    >
                      {res.name}
                    </span>
                    <span className="text-xs font-mono text-surface-500">
                      {res.time}ms
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(5, (res.time / maxTime) * 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full transition-all ${
                        res.isFastest
                          ? 'bg-primary-500 shadow-lg shadow-primary-500/30'
                          : 'bg-surface-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results Table */}
          <div>
            <h4 className="text-sm font-bold text-surface-200 uppercase tracking-wide mb-3">
              Engine Data
            </h4>
            <div className="space-y-2">
              {results.map((res) => (
                <div
                  key={res.name}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    res.isFastest
                      ? 'bg-primary-500/5 border-primary-500/30'
                      : 'bg-surface-800/30 border-surface-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        res.isFastest
                          ? 'bg-primary-500 text-surface-950'
                          : 'bg-surface-700 text-surface-400'
                      }`}
                    >
                      {res.name[0]}
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-surface-200">
                        {res.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            res.isFastest
                              ? 'bg-primary-500/20 text-primary-400'
                              : 'bg-surface-700 text-surface-500'
                          }`}
                        >
                          {res.delta}
                        </span>
                        <span className="text-[10px] text-surface-500 font-mono uppercase">
                          {isGrid
                            ? `Visited: ${res.size ?? 0}`
                            : `Size: ${res.size ?? 0}`}
                        </span>
                        {(isGrid || isSearch) && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              res.success
                                ? 'bg-success-500/10 text-success-400'
                                : 'bg-error-500/10 text-error-400'
                            }`}
                          >
                            {res.success ? 'FOUND' : 'MISS'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-base font-mono font-bold ${
                        res.isFastest ? 'text-primary-400' : 'text-surface-300'
                      }`}
                    >
                      {res.time}ms
                    </div>
                    <div className="text-[10px] text-surface-500 font-mono uppercase">
                      {res.complexity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-800 flex gap-3 bg-surface-950/50">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors touch-target"
          >
            <X size={16} />
            <span className="text-sm font-medium uppercase">Dismiss</span>
          </button>
          <button
            onClick={onReRun}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-surface-950 transition-colors touch-target"
          >
            <RotateCcw size={16} />
            <span className="text-sm font-bold uppercase">Re-Run</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
