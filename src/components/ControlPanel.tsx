'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Settings,
  BarChart3,
  Zap,
  Eye,
  RefreshCw,
  Shuffle,
  Grid3X3,
  Wand2,
} from 'lucide-react';

interface ControlPanelProps {
  size: number;
  maxSize?: number;
  sizeShower: boolean;
  speed: number;
  isPaused: boolean;
  isBenchmarking: boolean;
  hasGenerator: boolean;
  currentArray?: number[];
  isSearch?: boolean;
  targetValue?: number;
  viewMode?: 'Grid' | 'Tree';
  brush?: 'Wall' | 'Mud';
  treeMode?: 'BST' | 'Balanced' | 'Complete';
  onBrushChange?: (brush: 'Wall' | 'Mud') => void;
  onGenerateMaze?: () => void;
  onTreeModeChange?: (mode: 'BST' | 'Balanced' | 'Complete') => void;
  onTargetChange?: (val: number) => void;
  onSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onShuffle: () => void;
  onGenerate: () => void;
  onGeneratePattern: (
    pattern: 'nearly' | 'reversed' | 'sorted' | 'few-unique',
  ) => void;
  onManualUpdate: (input: string) => void;
  onQuickBenchmark: () => void;
  onVisualRun: () => void;
  onExecute: () => void;
  onStop: () => void;
  onTogglePause: () => void;
  onStartStepByStep: () => void;
}

type SectionKey = 'playback' | 'data' | 'advanced';

interface SectionHeaderProps {
  id: SectionKey;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  badge?: string;
  isExpanded: boolean;
  onToggle: (id: SectionKey) => void;
}

function SectionHeader({
  id,
  icon: Icon,
  title,
  badge,
  isExpanded,
  onToggle,
}: SectionHeaderProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      className="flex items-center gap-2 w-full p-2 hover:bg-surface-800 transition-colors touch-target first:rounded-t-xl"
    >
      <Icon size={16} className="text-primary-400" />
      <span className="flex-1 text-left text-sm font-medium text-surface-200">
        {title}
      </span>
      {badge && (
        <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full">
          {badge}
        </span>
      )}
      {isExpanded ? (
        <ChevronUp size={16} className="text-surface-500" />
      ) : (
        <ChevronDown size={16} className="text-surface-500" />
      )}
    </button>
  );
}

export const ControlPanel = ({
  size,
  maxSize = 100,
  speed,
  isPaused,
  isBenchmarking,
  hasGenerator,
  currentArray = [],
  isSearch = false,
  targetValue,
  viewMode,
  brush,
  onBrushChange,
  onGenerateMaze,
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
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
    new Set(['playback']),
  );
  const [showBenchmarkMenu, setShowBenchmarkMenu] = useState(false);
  const [manualInput, setManualInput] = useState(
    `[${currentArray?.join(',') || ''}]`,
  );

  const menuRef = useRef<HTMLDivElement>(null);
  const isLocked = hasGenerator || isBenchmarking;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setShowBenchmarkMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (section: SectionKey) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const closeAll = () => {
    setShowBenchmarkMenu(false);
  };

  return (
    // REMOVED overflow-hidden from main container
    <div className="bg-surface-900/50 border border-surface-800 rounded-xl relative">
      {/* Playback Controls Section */}
      <div className="border-b border-surface-800">
        <SectionHeader
          id="playback"
          icon={Play}
          title="Playback"
          badge={hasGenerator ? (isPaused ? 'Paused' : 'Running') : undefined}
          isExpanded={expandedSections.has('playback')}
          onToggle={toggleSection}
        />
        <AnimatePresence>
          {expandedSections.has('playback') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Step Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onStepBack}
                    disabled={!hasGenerator || !isPaused || isBenchmarking}
                    className="p-2 rounded-lg border border-surface-700 hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed touch-target transition-colors"
                    title="Previous Step"
                  >
                    <SkipBack size={18} className="text-surface-300" />
                  </button>
                  <button
                    onClick={onStepForward}
                    disabled={!hasGenerator || !isPaused || isBenchmarking}
                    className="p-2 rounded-lg border border-surface-700 hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed touch-target transition-colors"
                    title="Next Step"
                  >
                    <SkipForward size={18} className="text-surface-300" />
                  </button>
                </div>

                {/* Target Input */}
                {(isSearch || viewMode === 'Tree') && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-800 rounded-lg border border-surface-700">
                    <label className="text-xs text-surface-500">Target:</label>
                    <input
                      type="number"
                      value={targetValue ?? ''}
                      disabled={isLocked && !isPaused}
                      onChange={(e) => onTargetChange?.(Number(e.target.value))}
                      className="w-16 bg-transparent text-sm font-bold text-primary-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Speed Control */}
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-surface-800/50 rounded-lg border border-surface-700/50">
                  <span className="text-xs text-surface-500 uppercase tracking-wide">
                    Speed
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    step="10"
                    value={speed}
                    disabled={isLocked && !isPaused}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    className="flex-1 accent-primary-500 h-1.5 cursor-pointer disabled:opacity-30"
                  />
                  <span className="text-xs font-mono text-amber-400 w-12 text-right">
                    {speed}ms
                  </span>
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center gap-2">
                  {!hasGenerator && !isBenchmarking ? (
                    <>
                      <button
                        onClick={onStartStepByStep}
                        className="px-4 py-2 rounded-lg border border-emerald-700 text-emerald-400 hover:bg-emerald-900/20 transition-colors touch-target"
                      >
                        <span className="text-xs font-bold uppercase">
                          Step
                        </span>
                      </button>
                      <button
                        onClick={onExecute}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 transition-colors touch-target"
                      >
                        <Play size={16} className="text-surface-950" />
                        <span className="text-sm font-bold text-surface-950 uppercase">
                          Start
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={onTogglePause}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all touch-target ${
                          isPaused
                            ? 'bg-amber-500 text-surface-950'
                            : 'bg-surface-700 text-surface-200'
                        }`}
                      >
                        {isPaused ? (
                          <>
                            <Play size={16} />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause size={16} />
                            Pause
                          </>
                        )}
                      </button>
                      <button
                        onClick={onStop}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error-500 hover:bg-error-400 transition-colors touch-target"
                      >
                        <Square size={16} className="text-surface-950" />
                        <span className="text-sm font-bold text-surface-950 uppercase">
                          Stop
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Data Controls Section */}
      <div className="border-b border-surface-800">
        <SectionHeader
          id="data"
          icon={Grid3X3}
          title="Data"
          badge={sizeShower ? `${size} items` : undefined}
          isExpanded={expandedSections.has('data')}
          onToggle={toggleSection}
        />
        <AnimatePresence>
          {expandedSections.has('data') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Size Slider */}
                {sizeShower && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-surface-400 uppercase tracking-wide">
                        Data Size
                      </label>
                      <span className="text-sm font-mono text-primary-400">
                        {size}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max={maxSize}
                      value={size}
                      step={1}
                      disabled={isLocked}
                      onChange={(e) => onSizeChange(Number(e.target.value))}
                      className="w-full accent-primary-500 h-2 cursor-pointer disabled:opacity-30"
                    />
                  </div>
                )}

                {/* Brush Selection for Grid */}
                {viewMode === 'Grid' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-surface-400 uppercase tracking-wide">
                      Brush Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onBrushChange?.('Wall')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          brush === 'Wall'
                            ? 'bg-surface-700 text-surface-100'
                            : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                        }`}
                      >
                        <div className="w-3 h-3 bg-surface-500 rounded-sm" />
                        Wall
                      </button>
                      <button
                        onClick={() => onBrushChange?.('Mud')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                          brush === 'Mud'
                            ? 'bg-amber-700/50 text-amber-300'
                            : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                        }`}
                      >
                        <div className="w-3 h-3 bg-amber-700 rounded-sm" />
                        Mud
                      </button>
                    </div>
                  </div>
                )}

                {/* Data Generation Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={onShuffle}
                    disabled={isLocked}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 disabled:opacity-30 transition-colors touch-target"
                  >
                    <Shuffle size={14} className="text-primary-400" />
                    <span className="text-xs font-medium">Shuffle</span>
                  </button>
                  <button
                    onClick={onGenerate}
                    disabled={isLocked}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 disabled:opacity-30 transition-colors touch-target"
                  >
                    <RefreshCw size={14} className="text-primary-400" />
                    <span className="text-xs font-medium">Random</span>
                  </button>
                  {viewMode === 'Grid' && (
                    <button
                      onClick={() => {
                        onGenerateMaze?.();
                        closeAll();
                      }}
                      disabled={isLocked}
                      className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 transition-colors touch-target"
                    >
                      <Wand2 size={14} className="text-white" />
                      <span className="text-xs font-medium text-white">
                        Maze
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Section */}
      <div className="relative">
        <SectionHeader
          id="advanced"
          icon={Settings}
          title="Advanced"
          isExpanded={expandedSections.has('advanced')}
          onToggle={toggleSection}
        />
        <AnimatePresence>
          {expandedSections.has('advanced') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              // REMOVED overflow-hidden from this specific motion div to allow the absolute menu to escape
              className="z-10"
            >
              <div className="p-4 space-y-4">
                {/* Benchmark Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => {
                      closeAll();
                      setShowBenchmarkMenu(!showBenchmarkMenu);
                    }}
                    disabled={isLocked}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/20 disabled:opacity-30 transition-colors touch-target"
                  >
                    <BarChart3 size={16} />
                    <span className="text-sm font-bold uppercase">
                      Compare Algorithms
                    </span>
                  </button>
                  <AnimatePresence>
                    {showBenchmarkMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        // Added z-[110] and shifted it upwards/sideways if needed
                        className="absolute bottom-full left-0 right-0 mb-2 bg-surface-800 border border-surface-700 rounded-xl shadow-2xl overflow-hidden z-[110] min-w-[240px]"
                      >
                        <button
                          onClick={() => {
                            onQuickBenchmark();
                            setShowBenchmarkMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-700 transition-colors"
                        >
                          <Zap size={16} className="text-amber-400" />
                          <div className="text-left">
                            <span className="text-sm font-bold text-surface-200 block">
                              Quick Comparison
                            </span>
                            <span className="text-xs text-surface-500">
                              Run without visualization
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            onVisualRun();
                            setShowBenchmarkMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-700 transition-colors"
                        >
                          <Eye size={16} className="text-primary-400" />
                          <div className="text-left">
                            <span className="text-sm font-bold text-surface-200 block">
                              Visual Comparison
                            </span>
                            <span className="text-xs text-surface-500">
                              Watch algorithms compete
                            </span>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Manual Input for Arrays */}
                {viewMode !== 'Grid' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-surface-400 uppercase tracking-wide">
                      Manual Input
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        className="flex-1 min-w-0 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm font-mono text-primary-400 focus:outline-none focus:border-primary-500"
                        placeholder="[1, 2, 3, ...]"
                      />
                      <button
                        onClick={() => onManualUpdate(manualInput)}
                        disabled={isLocked}
                        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-30 transition-colors touch-target"
                      >
                        <span className="text-sm font-bold text-white uppercase">
                          Set
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Pattern Generation */}
                {viewMode !== 'Grid' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-surface-400 uppercase tracking-wide">
                      Generate Pattern
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'sorted', label: 'Sorted' },
                        { key: 'reversed', label: 'Reversed' },
                        { key: 'nearly', label: 'Nearly Sorted' },
                        { key: 'few-unique', label: 'Few Unique' },
                      ].map((pattern) => (
                        <button
                          key={pattern.key}
                          onClick={() =>
                            onGeneratePattern(
                              pattern.key as
                                | 'nearly'
                                | 'reversed'
                                | 'sorted'
                                | 'few-unique',
                            )
                          }
                          disabled={isLocked}
                          className="py-2 rounded-lg bg-surface-800 hover:bg-surface-700 disabled:opacity-30 transition-colors touch-target"
                        >
                          <span className="text-xs font-medium text-surface-300">
                            {pattern.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
