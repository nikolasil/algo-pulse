'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { VisualizerBar } from '@/components/VisualizerBar';
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
  const [isBenchmarking, setIsBenchmarking] = useState(false);
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
    runSimulation,
    shuffleData,
  } = useAlgorithm([]);

  useEffect(() => {
    setIsClient(true);
    if (!hasInitialized.current) {
      setArray(
        Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 5),
      );
      hasInitialized.current = true;
    }
  }, [setArray]);

  const getAlgoData = useCallback(
    (type: AlgorithmType, currentArray: number[]) => {
      switch (type) {
        case 'quick':
          return { gen: quickSort([...currentArray]), code: quickSortCode };
        case 'merge':
          return { gen: mergeSort([...currentArray]), code: mergeSortCode };
        default:
          return { gen: bubbleSort([...currentArray]), code: bubbleSortCode };
      }
    },
    [],
  );

  const handleStart = async () => {
    const startTime = performance.now();
    const { gen } = getAlgoData(algorithm, array);
    await runSimulation(gen, (val) => playTone(val));
    const duration = Math.round(performance.now() - startTime);
    setHistory((prev) =>
      [
        { id: Date.now(), algorithm, size: array.length, time: duration },
        ...prev,
      ].slice(0, 5),
    );
  };

  const runBenchmark = async () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    const algos: AlgorithmType[] = ['bubble', 'quick', 'merge'];
    const results: HistoryItem[] = [];
    const benchmarkData = [...array];

    for (const algo of algos) {
      setAlgorithm(algo);
      setArray([...benchmarkData]);
      await new Promise((r) => setTimeout(r, 100));
      const startTime = performance.now();
      const { gen } = getAlgoData(algo, benchmarkData);
      await runSimulation(gen, (val) => playTone(val));
      results.push({
        id: Date.now() + Math.random(),
        algorithm: algo,
        size: arraySize,
        time: Math.round(performance.now() - startTime),
      });
      await new Promise((r) => setTimeout(r, 500));
    }
    setHistory((prev) => [...results, ...prev].slice(0, 10));
    setIsBenchmarking(false);
  };

  if (!isClient) return null;

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-full lg:w-[420px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen custom-scrollbar">
        <header>
          <h1 className="text-2xl font-black bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            ALGO PULSE
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
            Diagnostic Engine
          </p>
        </header>

        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Execution Trace
            </h2>
            <div className="flex gap-1">
              {(['bubble', 'quick', 'merge'] as AlgorithmType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAlgorithm(type)}
                  disabled={!isPaused || isBenchmarking}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${algorithm === type ? 'bg-cyan-600 shadow-md shadow-cyan-900/40' : 'bg-slate-800 text-slate-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <CodeViewer
            code={getAlgoData(algorithm, array).code}
            activeLine={activeLine}
          />
        </section>

        <ComplexityLegend currentAlgo={algorithm} />

        <section className="flex-1">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Telemetry Log
          </h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-cyan-500 uppercase">
                    {item.algorithm}
                  </span>
                  <span className="ml-2 text-slate-500 font-mono text-[10px]">
                    N={item.size}
                  </span>
                </div>
                <div className="font-mono text-slate-200">{item.time}ms</div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <section className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 flex flex-col md:flex-row gap-4 items-center">
          <ControlPanel
            size={arraySize}
            speed={speed}
            isPaused={isPaused && !isBenchmarking}
            onSizeChange={(n) => {
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
          <div className="flex gap-2 w-full md:w-auto flex-1">
            <button
              onClick={shuffleData}
              disabled={!isPaused || isBenchmarking}
              className="px-4 h-12 rounded-xl border border-slate-700 uppercase text-[9px] font-bold hover:bg-slate-800 transition-colors"
            >
              Shuffle
            </button>
            <button
              onClick={runBenchmark}
              disabled={!isPaused || isBenchmarking}
              className="px-4 h-12 rounded-xl border border-cyan-800 text-cyan-400 uppercase text-[9px] font-bold hover:bg-cyan-950 transition-colors"
            >
              Benchmark
            </button>
            <button
              onClick={handleStart}
              disabled={!isPaused || isBenchmarking}
              className="flex-1 px-8 h-12 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase text-[10px] shadow-lg shadow-cyan-900/20 active:scale-95 transition-all"
            >
              {isPaused ? 'Execute' : 'Running...'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Phase"
            value={isBenchmarking ? 'BENCHMARK' : isPaused ? 'IDLE' : 'ACTIVE'}
            highlight={!isPaused}
          />
          <StatCard
            label="Efficiency"
            value={algorithm === 'bubble' ? 'Low' : 'High'}
          />
          <StatCard label="Data Points" value={array.length} />
          <StatCard label="Cycle Speed" value={`${speed}ms`} />
        </div>

        <div className="relative flex-1 min-h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-800/50 flex items-end justify-center px-4 pb-2 gap-[2px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e293b,transparent)] opacity-30" />
          {array.map((val, idx) => (
            <VisualizerBar
              key={`${idx}-${val}`} // Key helps Framer Motion track identity for layout animations
              val={val}
              status={comparing.includes(idx) ? 'swapping' : 'idle'}
              maxVal={100}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ComplexityLegend({ currentAlgo }: { currentAlgo: AlgorithmType }) {
  const details = {
    bubble: {
      complexity: 'O(n²)',
      desc: 'Quadratic. Simple but slow. Nested loops check every pair.',
      color: 'text-rose-400',
    },
    quick: {
      complexity: 'O(n log n)',
      desc: 'Efficient. Divide and conquer using a pivot element.',
      color: 'text-emerald-400',
    },
    merge: {
      complexity: 'O(n log n)',
      desc: 'Stable. Recursively splits and merges sorted halves.',
      color: 'text-emerald-400',
    },
  };
  const active = details[currentAlgo];
  return (
    <section className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
      <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
        Complexity Legend
      </h2>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase">
            {currentAlgo} Sort
          </span>
          <span className={`text-xs font-mono font-bold ${active.color}`}>
            {active.complexity}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed italic">
          {active.desc}
        </p>
      </div>
    </section>
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
        className={`text-sm font-bold mt-1 ${highlight ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}
      >
        {value}
      </div>
    </div>
  );
}
