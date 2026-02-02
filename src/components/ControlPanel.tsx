'use client';
import { useState, useRef, useEffect } from 'react';

interface ControlPanelProps {
  size: number;
  sizeShower: boolean;
  speed: number;
  isPaused: boolean;
  isBenchmarking: boolean;
  hasGenerator: boolean;
  onSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onShuffle: () => void;
  onGenerate: () => void;
  onQuickBenchmark: () => void;
  onVisualRun: () => void;
  onExecute: () => void;
  onStop: () => void;
  onTogglePause: () => void;
  onStartStepByStep: () => void;
}

export const ControlPanel = ({
  size,
  speed,
  isPaused,
  isBenchmarking,
  hasGenerator,
  onSpeedChange,
  onSizeChange,
  sizeShower,
  onStepBack,
  onStepForward,
  onShuffle,
  onGenerate,
  onQuickBenchmark,
  onVisualRun,
  onExecute,
  onStop,
  onTogglePause,
  onStartStepByStep,
}: ControlPanelProps) => {
  const [showBenchmarkMenu, setShowBenchmarkMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isLocked = hasGenerator || isBenchmarking;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowBenchmarkMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 w-full">
      <div className="flex flex-wrap gap-8 items-center border-b border-slate-800/50 pb-6">
        {sizeShower && (
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Size
              </label>
              <span className="text-[10px] font-mono text-cyan-400">
                {size}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={size}
              disabled={isLocked}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer disabled:opacity-30"
            />
          </div>
        )}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Speed
            </label>
            <span className="text-[10px] font-mono text-amber-400">
              {speed}ms
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="400"
            step="5"
            value={speed}
            disabled={isLocked}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer disabled:opacity-30"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          <button
            onClick={onStepBack}
            disabled={!hasGenerator || !isPaused || isBenchmarking}
            className="w-10 h-10 rounded-lg border border-slate-700 hover:bg-slate-800 text-[8px] font-bold uppercase disabled:opacity-20"
          >
            Prev
          </button>
          <button
            onClick={onStepForward}
            disabled={!hasGenerator || !isPaused || isBenchmarking}
            className="w-10 h-10 rounded-lg border border-slate-700 hover:bg-slate-800 text-[8px] font-bold uppercase disabled:opacity-20"
          >
            Next
          </button>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        <button
          onClick={onShuffle}
          disabled={isLocked}
          className="px-3 h-10 rounded-lg border border-slate-700 uppercase text-[9px] font-bold hover:bg-slate-800 disabled:opacity-30"
        >
          Shuffle
        </button>

        <button
          onClick={onGenerate}
          disabled={isLocked}
          className="px-3 h-10 rounded-lg border border-cyan-800 text-cyan-500 uppercase text-[9px] font-bold hover:bg-cyan-950/30 transition-all disabled:opacity-30"
        >
          ✨ Generate New
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowBenchmarkMenu(!showBenchmarkMenu)}
            disabled={isLocked}
            className="px-3 h-10 rounded-lg border border-indigo-500 text-indigo-400 uppercase text-[9px] font-bold hover:bg-indigo-950 disabled:opacity-30"
          >
            Compare All Algorithms
          </button>
          {showBenchmarkMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col p-1 animate-in slide-in-from-bottom-2">
              <button
                onClick={() => {
                  onQuickBenchmark();
                  setShowBenchmarkMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-[9px] font-bold uppercase text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
              >
                ⚡ Quick Comparison
              </button>
              <button
                onClick={() => {
                  onVisualRun();
                  setShowBenchmarkMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-[9px] font-bold uppercase text-slate-300 hover:bg-cyan-600 hover:text-white rounded-lg transition-colors"
              >
                👁️ Visual Comparison
              </button>
            </div>
          )}
        </div>

        {!hasGenerator && (
          <button
            onClick={onStartStepByStep}
            disabled={isBenchmarking}
            className="px-3 h-10 rounded-lg border border-emerald-800 text-emerald-400 uppercase text-[9px] font-bold hover:bg-emerald-950"
          >
            Start Manual
          </button>
        )}

        <div className="flex gap-2 flex-1 min-w-[160px]">
          {!hasGenerator && !isBenchmarking ? (
            <button
              onClick={onExecute}
              className="flex-1 px-4 h-10 rounded-lg bg-cyan-500 text-slate-950 font-bold uppercase text-[10px] shadow-lg shadow-cyan-900/20 transition-all"
            >
              Start
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex-1 px-4 h-10 rounded-lg bg-rose-600 text-white font-bold uppercase text-[10px] shadow-lg shadow-rose-900/20 transition-all"
            >
              Stop
            </button>
          )}
          {hasGenerator && (
            <button
              onClick={onTogglePause}
              className={`px-3 h-10 rounded-lg border font-bold uppercase text-[9px] transition-all ${isPaused ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-950' : 'border-amber-500 text-amber-500 hover:bg-amber-950'}`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
