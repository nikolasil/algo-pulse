'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Hash, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useState } from 'react';

export interface LogItem {
  id: number;
  algorithm: string;
  size: number;
  pathLength?: number;
  time: number;
  success?: boolean;
}

interface TelemetryLogProps {
  history: LogItem[];
  maxItems?: number;
}

export function TelemetryLog({ history, maxItems = 10 }: TelemetryLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayHistory = isExpanded
    ? history.slice().reverse()
    : history.slice(0, maxItems).reverse();

  const isGrid = (item: LogItem) => item.pathLength !== undefined;
  const isSearch = (item: LogItem) =>
    !isGrid(item) && typeof item.success === 'boolean';

  const getStatusIcon = (item: LogItem) => {
    if (typeof item.success === 'boolean') {
      return item.success ? (
        <CheckCircle size={12} className="text-success-400" />
      ) : (
        <XCircle size={12} className="text-error-400" />
      );
    }
    return <Activity size={12} className="text-primary-400" />;
  };

  const getStatusBadge = (item: LogItem) => {
    if (isGrid(item)) {
      return item.success ? (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-success-500/10 text-success-400 border border-success-500/20">
          FOUND
        </span>
      ) : (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-error-500/10 text-error-400 border border-error-500/20">
          MISS
        </span>
      );
    }
    if (isSearch(item)) {
      return item.success ? (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-success-500/10 text-success-400 border border-success-500/20">
          FOUND
        </span>
      ) : (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-error-500/10 text-error-400 border border-error-500/20">
          MISS
        </span>
      );
    }
    return (
      <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
        SORTED
      </span>
    );
  };

  return (
    <section className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
          <Activity size={12} />
          Telemetry Log
        </h2>
        {history.length > maxItems && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-primary-400 hover:text-primary-300 transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show All (${history.length})`}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {displayHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center p-4 text-xs text-surface-500 italic"
            >
              Waiting for execution data...
            </motion.div>
          )}
          {displayHistory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              layout
              className="p-3 rounded-lg bg-surface-800/30 border border-surface-700/50 hover:border-surface-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="flex-shrink-0 mt-0.5">{getStatusIcon(item)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-primary-400 truncate">
                        {item.algorithm}
                      </span>
                      {getStatusBadge(item)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-surface-500">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {item.time}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash size={10} />
                        {isGrid(item)
                          ? `${item.size} visited`
                          : `${item.size} elements`}
                      </span>
                      {isGrid(item) && item.pathLength !== undefined && (
                        <span className="text-warning-400">
                          Path: {item.pathLength}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
