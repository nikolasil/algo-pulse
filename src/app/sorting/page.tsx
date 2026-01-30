'use client';
import { useState, useEffect, useRef } from 'react';
import { useSorting } from '@/hooks/useSorting';
import { useAudio } from '@/hooks/useAudio';
import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import {
  bubbleSort,
  bubbleSortCode,
  quickSort,
  quickSortCode,
  mergeSort,
  mergeSortCode,
} from '@/algorithms/sortingAlgorithms';

type AlgorithmType = 'bubble' | 'quick' | 'merge';

interface HistoryItem {
  id: number;
  algorithm: string;
  size: number;
  time: number;
}

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bubble');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const hasInitialized = useRef(false);

  const { playTone } = useAudio();
  const {
    array,
    setArray,
    isPaused,
    setSpeed,
    speed,
    comparing,
    activeLine,
    startSorting,
    shuffleData,
  } = useSorting([]);

  useEffect(() => {
    setIsClient(true);
    if (!hasInitialized.current) {
      setArray(
        Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 5),
      );
      hasInitialized.current = true;
    }
  }, [setArray]);

  const getAlgoData = () => {
    switch (algorithm) {
      case 'quick':
        return { gen: quickSort([...array]), code: quickSortCode };
      case 'merge':
        return { gen: mergeSort([...array]), code: mergeSortCode };
      default:
        return { gen: bubbleSort(array), code: bubbleSortCode };
    }
  };

  const handleStart = async () => {
    const startTime = performance.now();
    const { gen } = getAlgoData();

    await startSorting(gen, (val) => playTone(val));

    const duration = Math.round(performance.now() - startTime);
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          algorithm,
          size: array.length,
          time: duration,
        },
        ...prev,
      ].slice(0, 5),
    );
  };

  if (!isClient) return null;

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      {/* LEFT SIDEBAR: Code & History */}
      <aside className="w-full lg:w-[400px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            ALGO PULSE
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
            v1.0.4 Terminal
          </p>
        </div>

        {/* Live Code Section */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Live Trace
            </h2>
            <div className="flex gap-2">
              {(['bubble', 'quick', 'merge'] as AlgorithmType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAlgorithm(type)}
                  disabled={!isPaused}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                    algorithm === type
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <CodeViewer code={getAlgoData().code} activeLine={activeLine} />
        </section>

        {/* History Section */}
        <section className="flex-1">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Run History
          </h2>
          <div className="space-y-2">
            {history.length === 0 && (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center">
                <p className="text-[10px] font-mono text-slate-600 italic uppercase">
                  No telemetry found
                </p>
              </div>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center group hover:border-cyan-900 transition-colors"
              >
                <div>
                  <div className="text-[10px] font-bold text-cyan-500 uppercase">
                    {item.algorithm}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Size: {item.size}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-slate-200">
                    {item.time}ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isPaused ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}
            />
            <span className="text-[9px] font-mono text-slate-500 uppercase">
              {isPaused ? 'Ready' : 'Executing'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-600">
            JS_V8_ENGINE
          </span>
        </div>
      </aside>

      {/* RIGHT STAGE: Visualizer */}
      <section className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 flex flex-col md:flex-row gap-6 items-center shadow-xl">
          <ControlPanel
            size={arraySize}
            speed={speed}
            isPaused={isPaused}
            onReset={(n) => {
              setArraySize(n);
              setArray(
                Array.from(
                  { length: n },
                  () => Math.floor(Math.random() * 100) + 5,
                ),
              );
            }}
            onSpeedChange={setSpeed}
          />
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={shuffleData}
              disabled={!isPaused}
              className="px-6 h-12 rounded-xl border border-slate-700 uppercase text-[10px] font-bold hover:bg-slate-800 transition-colors"
            >
              Shuffle
            </button>
            <button
              onClick={handleStart}
              disabled={!isPaused}
              className="flex-1 px-8 h-12 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase text-[10px] shadow-lg shadow-cyan-900/20 hover:bg-cyan-400 transition-all active:scale-95"
            >
              {isPaused ? 'Execute' : 'Running...'}
            </button>
          </div>
        </div>

        {/* Results Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Selected Algo" value={algorithm.toUpperCase()} />
          <StatCard
            label="Comparisons"
            value={comparing.length > 0 ? 'ACTIVE' : 'IDLE'}
            highlight={comparing.length > 0}
          />
          <StatCard label="Array Density" value={array.length} />
          <StatCard label="Current Speed" value={`${speed}ms`} />
        </div>

        <div className="relative flex-1 min-h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-800/50 flex items-end justify-center px-4 pb-2 gap-[1px] overflow-hidden shadow-2xl">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />

          {array.map((val, idx) => (
            <div
              key={idx}
              style={{
                height: `${(val / 105) * 100}%`,
                width: `${100 / array.length}%`,
              }}
              className={`relative z-10 transition-all duration-75 rounded-t-[1px] ${
                comparing.includes(idx)
                  ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]'
                  : 'bg-cyan-500/60 group-hover:bg-cyan-400'
              }`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl">
      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        {label}
      </div>
      <div
        className={`text-lg font-bold mt-1 tracking-tight ${highlight ? 'text-rose-500' : 'text-slate-200'}`}
      >
        {value}
      </div>
    </div>
  );
}
