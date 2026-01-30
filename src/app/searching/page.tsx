'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { VisualizerBar } from '@/components/VisualizerBar';
import {
  linearSearch,
  linearSearchCode,
  binarySearch,
  binarySearchCode,
  jumpSearch,
  jumpSearchCode,
} from '@/algorithms/searchAlgorithms';

type SearchAlgo = 'linear' | 'binary' | 'jump';

interface HistoryItem {
  id: number;
  algorithm: string;
  size: number;
  time: number;
  found: boolean;
}

export default function SearchingPage() {
  const [arraySize, setArraySize] = useState(30);
  const [target, setTarget] = useState<number>(0);
  const [algorithm, setAlgorithm] = useState<SearchAlgo>('linear');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [searchRange, setSearchRange] = useState<[number, number] | null>(null);
  const hasInitialized = useRef(false);

  const { playTone } = useAudio();
  const {
    array,
    setArray,
    speed,
    setSpeed,
    comparing,
    activeLine,
    runSimulation,
    shuffleData,
    isPaused,
  } = useAlgorithm([]);

  useEffect(() => {
    setIsClient(true);
    if (!hasInitialized.current) {
      const initialArray = Array.from(
        { length: 30 },
        () => Math.floor(Math.random() * 90) + 10,
      ).sort((a, b) => a - b);
      setArray(initialArray);
      setTarget(initialArray[Math.floor(Math.random() * initialArray.length)]);
      hasInitialized.current = true;
    }
  }, [setArray]);

  const getAlgoData = useCallback(
    (type: SearchAlgo, currentArray: number[], currentTarget: number) => {
      switch (type) {
        case 'binary':
          return {
            gen: binarySearch(currentArray, currentTarget),
            code: binarySearchCode,
          };
        case 'jump':
          return {
            gen: jumpSearch(currentArray, currentTarget),
            code: jumpSearchCode,
          };
        default:
          return {
            gen: linearSearch(currentArray, currentTarget),
            code: linearSearchCode,
          };
      }
    },
    [],
  );

  const handleStart = async () => {
    setFoundIndex(null);
    setSearchRange(null);
    const startTime = performance.now();
    const { gen } = getAlgoData(algorithm, array, target);

    async function* wrappedGenerator() {
      for await (const step of gen) {
        if (step.found !== undefined) setFoundIndex(step.found);
        if (step.range) setSearchRange(step.range);
        yield step;
      }
    }

    await runSimulation(wrappedGenerator(), (val) => playTone(val));
    const duration = Math.round(performance.now() - startTime);
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          algorithm,
          size: array.length,
          time: duration,
          found: foundIndex !== null,
        },
        ...prev,
      ].slice(0, 5),
    );
  };

  const runBenchmark = async () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    const algos: SearchAlgo[] = ['linear', 'jump', 'binary'];
    const results: HistoryItem[] = [];

    for (const algo of algos) {
      setAlgorithm(algo);
      setFoundIndex(null);
      setSearchRange(null);
      await new Promise((r) => setTimeout(r, 100));
      const startTime = performance.now();
      const { gen } = getAlgoData(algo, array, target);
      await runSimulation(gen, (val) => playTone(val));
      results.push({
        id: Date.now() + Math.random(),
        algorithm: algo,
        size: arraySize,
        time: Math.round(performance.now() - startTime),
        found: true,
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
            SEARCH PULSE
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
              {(['linear', 'jump', 'binary' ] as SearchAlgo[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setAlgorithm(type);
                    setFoundIndex(null);
                    setSearchRange(null);
                  }}
                  disabled={!isPaused || isBenchmarking}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${algorithm === type ? 'bg-cyan-600' : 'bg-slate-800 text-slate-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <CodeViewer
            code={
              algorithm === 'binary'
                ? binarySearchCode
                : algorithm === 'jump'
                  ? jumpSearchCode
                  : linearSearchCode
            }
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
          <div className="flex flex-col w-full md:w-32 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <label className="text-[9px] font-mono text-slate-500 uppercase mb-1">
              Target
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="bg-transparent text-xl font-bold text-cyan-400 focus:outline-none"
            />
          </div>

          <ControlPanel
            size={arraySize}
            speed={speed}
            isPaused={isPaused && !isBenchmarking}
            onReset={(n) => {
              setArraySize(n);
              const newArr = Array.from(
                { length: n },
                () => Math.floor(Math.random() * 100) + 5,
              ).sort((a, b) => a - b);
              setArray(newArr);
              setTarget(newArr[Math.floor(Math.random() * n)]);
              setFoundIndex(null);
              setSearchRange(null);
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
              className="flex-1 px-8 h-12 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase text-[10px] shadow-lg shadow-cyan-900/20 transition-all"
            >
              {isPaused ? 'Search' : 'Scanning...'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Phase"
            value={
              isBenchmarking ? 'BENCHMARK' : isPaused ? 'IDLE' : 'SCANNING'
            }
            highlight={!isPaused}
          />
          <StatCard label="Data Points" value={array.length} />
          <StatCard label="Scan Speed" value={`${speed}ms`} />
          <StatCard
            label="Result"
            value={foundIndex !== null ? `INDEX: ${foundIndex}` : 'NOT FOUND'}
            highlight={foundIndex !== null}
          />
        </div>

        <div className="relative flex-1 min-h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-800/50 flex items-end justify-center px-4 pb-2 gap-[2px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e293b,transparent)] opacity-30" />
          {array.map((val, idx) => {
            const isOutOfRange =
              searchRange && (idx < searchRange[0] || idx > searchRange[1]);
            let status: 'idle' | 'comparing' | 'swapping' | 'found' = 'idle';
            if (foundIndex === idx) status = 'found';
            else if (comparing.includes(idx)) status = 'comparing';
            else if (isOutOfRange) status = 'idle'; // Component handles opacity via isOutOfRange if we wanted, but let's keep it simple

            return (
              <VisualizerBar
                key={`${idx}-${val}`}
                val={val}
                status={status}
                maxVal={100}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ComplexityLegend({ currentAlgo }: { currentAlgo: SearchAlgo }) {
  const details = {
    linear: {
      complexity: 'O(n)',
      desc: 'Checks every element. Simple but slow.',
      color: 'text-rose-400',
    },
    binary: {
      complexity: 'O(log n)',
      desc: 'Halves the search area. Requires sorted data.',
      color: 'text-emerald-400',
    },
    jump: {
      complexity: 'O(√n)',
      desc: 'Jumps ahead in blocks to find range.',
      color: 'text-cyan-400',
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
            {currentAlgo} Search
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
        className={`text-sm font-bold mt-1 ${highlight ? 'text-cyan-500 animate-pulse' : 'text-slate-200'}`}
      >
        {value}
      </div>
    </div>
  );
}
