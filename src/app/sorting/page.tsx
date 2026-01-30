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
import { NavHeader } from '@/components/NavHeader';

type AlgorithmType = 'bubble' | 'quick' | 'merge';

interface HistoryItem {
  id: number;
  algorithm: string;
  size: number;
  time: number;
}

interface BenchmarkResult {
  name: string;
  time: string;
  complexity: string;
}

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bubble');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [quickResults, setQuickResults] = useState<BenchmarkResult[]>([]);
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
          return {
            gen: quickSort([...currentArray]),
            code: quickSortCode,
            complexity: 'O(n log n)',
          };
        case 'merge':
          return {
            gen: mergeSort([...currentArray]),
            code: mergeSortCode,
            complexity: 'O(n log n)',
          };
        default:
          return {
            gen: bubbleSort([...currentArray]),
            code: bubbleSortCode,
            complexity: 'O(n²)',
          };
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
      ].slice(0, 10),
    );
  };

  // --- MODE 1: VISUAL BENCHMARK (One by one) ---
  const runVisualBenchmark = async () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    const algos: AlgorithmType[] = ['bubble', 'quick', 'merge'];
    const benchmarkData = [...array];

    for (const algo of algos) {
      setAlgorithm(algo);
      setArray([...benchmarkData]);
      await new Promise((r) => setTimeout(r, 100));
      const startTime = performance.now();
      const { gen } = getAlgoData(algo, benchmarkData);
      await runSimulation(gen, (val) => playTone(val));

      setHistory((prev) =>
        [
          {
            id: Date.now() + Math.random(),
            algorithm: algo,
            size: arraySize,
            time: Math.round(performance.now() - startTime),
          },
          ...prev,
        ].slice(0, 10),
      );
      await new Promise((r) => setTimeout(r, 800));
    }
    setIsBenchmarking(false);
  };

  // --- MODE 2: QUICK WARP (Instant) ---
  const runQuickBenchmark = async () => {
    const algos: AlgorithmType[] = ['bubble', 'quick', 'merge'];
    const results: BenchmarkResult[] = [];

    for (const algo of algos) {
      const benchmarkData = [...array];
      const startTime = performance.now();
      const { gen, complexity } = getAlgoData(algo, benchmarkData);

      // Exhaust the generator instantly without delays
      let res = await gen.next();
      while (!res.done) {
        res = await gen.next();
      }

      const duration = (performance.now() - startTime).toFixed(2);
      results.push({ name: algo.toUpperCase(), time: duration, complexity });
    }
    setQuickResults(results);
    setShowQuickReport(true);
  };

  if (!isClient) return null;

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-full lg:w-[420px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen custom-scrollbar">
        <NavHeader title="Sort Pulse" subtitle="Diagnostic Engine" />

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
            {history.length === 0 && (
              <p className="text-[10px] text-slate-600 italic">
                Waiting for execution data...
              </p>
            )}
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

      <section className="flex-1 p-6 lg:p-10 flex flex-col gap-6 relative">
        {isBenchmarking && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 px-6 py-2 rounded-full font-bold animate-pulse shadow-2xl text-xs">
            AUTO-RUN: {algorithm.toUpperCase()} SORT
          </div>
        )}

        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 flex flex-col md:flex-row gap-4 items-center">
          <ControlPanel
            size={arraySize}
            sizeShower={true}
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
              className="px-4 h-12 rounded-xl border border-slate-700 uppercase text-[9px] font-bold hover:bg-slate-800"
            >
              Shuffle
            </button>
            <button
              onClick={runQuickBenchmark}
              disabled={!isPaused || isBenchmarking}
              className="px-4 h-12 rounded-xl border border-indigo-500 text-indigo-400 uppercase text-[9px] font-bold hover:bg-indigo-950"
            >
              Quick
            </button>
            <button
              onClick={runVisualBenchmark}
              disabled={!isPaused || isBenchmarking}
              className="px-4 h-12 rounded-xl border border-cyan-800 text-cyan-400 uppercase text-[9px] font-bold hover:bg-cyan-950"
            >
              Visual Run
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
          {array.map((val, idx) => (
            <VisualizerBar
              key={`${idx}-${val}`}
              val={val}
              status={comparing.includes(idx) ? 'swapping' : 'idle'}
              maxVal={100}
            />
          ))}
        </div>
      </section>

      {/* Quick Report Modal */}
      {showQuickReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-white italic mb-6">
              WARP SPEED RESULTS (N={arraySize})
            </h2>
            <div className="space-y-3">
              {quickResults.map((res) => (
                <div
                  key={res.name}
                  className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800"
                >
                  <div>
                    <div className="text-cyan-400 font-bold text-sm">
                      {res.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">
                      {res.complexity}
                    </div>
                  </div>
                  <div className="text-xl font-mono text-white">
                    {res.time}ms
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowQuickReport(false)}
              className="w-full mt-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold uppercase text-xs transition-colors"
            >
              Dismiss Report
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ... Keep ComplexityLegend and StatCard functions as they were

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
