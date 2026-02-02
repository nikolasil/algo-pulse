'use client';
import { useState, useRef, useEffect } from 'react';

interface ControlPanelProps {
  size: number;
  sizeShower: boolean;
  speed: number;
  isPaused: boolean;
  isBenchmarking: boolean;
  hasGenerator: boolean;
  currentArray?: number[];
  isSearch?: boolean;
  targetValue?: number;
  onTargetChange?: (val: number) => void;
  onSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onShuffle: () => void;
  onGenerate: () => void;
  onGeneratePattern: (pattern: 'nearly' | 'reversed' | 'few-unique') => void;
  onManualUpdate: (input: string) => void;
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
  currentArray = [],
  isSearch = false,
  targetValue,
  onTargetChange,
  onSpeedChange,
  onSizeChange,
  sizeShower,
  onStepBack,
  onStepForward,
  onShuffle,
  onGenerate,
  onGeneratePattern,
  onManualUpdate,
  onQuickBenchmark,
  onVisualRun,
  onExecute,
  onStop,
  onTogglePause,
  onStartStepByStep,
}: ControlPanelProps) => {
  const [showBenchmarkMenu, setShowBenchmarkMenu] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [manualInput, setManualInput] = useState(
    `[${currentArray?.join(',') || ''}]`,
  );

  const menuRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const isLocked = hasGenerator || isBenchmarking;

  useEffect(() => {
    setManualInput(`[${currentArray?.join(',') || ''}]`);
  }, [currentArray]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setShowBenchmarkMenu(false);
      if (dataRef.current && !dataRef.current.contains(event.target as Node))
        setShowDataMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAll = () => {
    setShowBenchmarkMenu(false);
    setShowDataMenu(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800 w-full relative z-10">
      {(showBenchmarkMenu || showDataMenu) && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[95] sm:hidden animate-in fade-in duration-200"
          onClick={closeAll}
        />
      )}

      <div className="flex flex-wrap gap-4 items-center">
        {isSearch && (
          <div className="flex flex-col px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 min-w-[100px]">
            <label className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
              Target
            </label>
            <input
              type="number"
              value={targetValue}
              disabled={isLocked && !isPaused}
              onChange={(e) => onTargetChange?.(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-cyan-400 focus:outline-none w-16"
            />
          </div>
        )}

        <div className="flex gap-1">
          <button
            onClick={onStepBack}
            disabled={!hasGenerator || !isPaused || isBenchmarking}
            className="w-10 h-10 rounded-lg border border-slate-700 hover:bg-slate-800 text-[8px] font-bold uppercase disabled:opacity-20 transition-colors"
          >
            Prev
          </button>
          <button
            onClick={onStepForward}
            disabled={!hasGenerator || !isPaused || isBenchmarking}
            className="w-10 h-10 rounded-lg border border-slate-700 hover:bg-slate-800 text-[8px] font-bold uppercase disabled:opacity-20 transition-colors"
          >
            Next
          </button>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/40 rounded-xl border border-slate-700/50 min-w-[160px] flex-1 lg:flex-none">
          <label className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
            Speed
          </label>
          <input
            type="range"
            min="1"
            max="1000"
            step="1"
            value={speed}
            disabled={isLocked && !isPaused}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="flex-1 accent-amber-500 h-1.5 cursor-pointer disabled:opacity-30"
          />
          <span className="text-[10px] font-mono text-amber-400 w-8 text-right">
            {speed}
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative" ref={dataRef}>
            <button
              onClick={() => {
                closeAll();
                setShowDataMenu(!showDataMenu);
              }}
              disabled={isLocked}
              className={`px-4 h-10 rounded-lg border uppercase text-[9px] font-bold transition-all flex items-center gap-2 ${showDataMenu ? 'bg-cyan-900/40 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'}`}
            >
              📊 Data
            </button>
            {showDataMenu && (
              <div className="fixed sm:absolute top-1/3 sm:top-full left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 mt-0 sm:mt-2 w-[90vw] max-w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-[100] p-5 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl bg-slate-900/98">
                <div className="flex justify-between items-center mb-4 sm:hidden">
                  <span className="text-[10px] font-bold uppercase text-cyan-400">
                    Data Labs
                  </span>
                  <button
                    onClick={() => setShowDataMenu(false)}
                    className="text-slate-500 p-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-5">
                  {sizeShower && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          Size
                        </label>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {size}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={size}
                        step={1}
                        disabled={isLocked}
                        onChange={(e) => onSizeChange(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 cursor-pointer disabled:opacity-30"
                      />
                    </div>
                  )}
                  <div className="h-[1px] bg-slate-800 w-full" />
                  <div>
                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Manual Array
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-[10px] font-mono text-cyan-400 focus:outline-none"
                      />
                      <button
                        onClick={() => onManualUpdate(manualInput)}
                        className="bg-cyan-600 text-slate-950 px-3 py-1 rounded-lg text-[8px] font-bold uppercase"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={onShuffle}
                      className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-[8px] font-bold uppercase"
                    >
                      Shuffle
                    </button>
                    <button
                      onClick={onGenerate}
                      className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-[8px] font-bold uppercase"
                    >
                      Random
                    </button>

                    {/* Sorting Specific Patterns */}
                    {!isSearch && (
                      <>
                        <button
                          onClick={() => onGeneratePattern('nearly')}
                          className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-[8px] font-bold uppercase"
                        >
                          Nearly
                        </button>
                        <button
                          onClick={() => onGeneratePattern('reversed')}
                          className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-[8px] font-bold uppercase"
                        >
                          Reversed
                        </button>
                        <button
                          onClick={() => onGeneratePattern('few-unique')}
                          className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-[8px] font-bold uppercase col-span-2 text-amber-400"
                        >
                          Few Unique
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                closeAll();
                setShowBenchmarkMenu(!showBenchmarkMenu);
              }}
              disabled={isLocked}
              className={`px-3 h-10 rounded-lg border uppercase text-[9px] font-bold transition-all ${showBenchmarkMenu ? 'bg-indigo-900/40 border-indigo-400 text-indigo-400' : 'border-indigo-500 text-indigo-400 hover:bg-indigo-950'}`}
            >
              Compare
            </button>
            {showBenchmarkMenu && (
              <div className="fixed sm:absolute top-1/3 sm:top-full left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 mt-0 sm:mt-2 w-[80vw] max-w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl bg-slate-900/98">
                <button
                  onClick={() => {
                    onQuickBenchmark();
                    setShowBenchmarkMenu(false);
                  }}
                  className="w-full text-left px-4 py-4 sm:py-3 text-[9px] font-bold uppercase text-slate-300 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                >
                  ⚡ Quick Comparison
                </button>
                <button
                  onClick={() => {
                    onVisualRun();
                    setShowBenchmarkMenu(false);
                  }}
                  className="w-full text-left px-4 py-4 sm:py-3 text-[9px] font-bold uppercase text-slate-300 hover:bg-cyan-600 hover:text-white rounded-lg transition-colors"
                >
                  👁️ Visual Comparison
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-1 min-w-[180px]">
          {!hasGenerator && !isBenchmarking ? (
            <>
              <button
                onClick={onStartStepByStep}
                className="px-4 h-10 rounded-lg border border-emerald-800 text-emerald-400 uppercase text-[9px] font-bold hover:bg-emerald-950"
              >
                Step
              </button>
              <button
                onClick={onExecute}
                className="flex-1 px-4 h-10 rounded-lg bg-cyan-500 text-slate-950 font-bold uppercase text-[10px] shadow-lg shadow-cyan-900/20 active:scale-95 transition-all"
              >
                Start
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onTogglePause}
                className={`flex-1 px-4 h-10 rounded-lg font-bold uppercase text-[10px] transition-all ${isPaused ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/20' : 'bg-slate-700 text-white'}`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={onStop}
                className="px-4 h-10 rounded-lg bg-rose-600 text-white font-bold uppercase text-[10px] shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
              >
                Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
