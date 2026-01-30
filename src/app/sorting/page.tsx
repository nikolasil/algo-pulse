'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSorting } from '@/hooks/useSorting';
import { useAudio } from '@/hooks/useAudio';
import { ControlPanel } from '@/components/ControlPanel';
import { bubbleSort } from '@/algorithms/sorting/bubbleSort';
import { quickSort } from '@/algorithms/sorting/quickSort';
import { mergeSort } from '@/algorithms/sorting/mergeSort';

type AlgorithmType = 'bubble' | 'quick' | 'merge';

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bubble');
  const [history, setHistory] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [mute, setMute] = useState(false);
  const hasInitialized = useRef(false);

  const { playTone } = useAudio();
  const {
    array,
    setArray,
    isPaused,
    setSpeed,
    speed,
    comparing,
    startSorting,
    shuffleData,
  } = useSorting([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !hasInitialized.current) {
      const initial = Array.from(
        { length: arraySize },
        () => Math.floor(Math.random() * 100) + 5,
      );
      setArray(initial);
      hasInitialized.current = true;
    }
  }, [isClient, arraySize, setArray]);

  const handleStart = async () => {
    const startTime = performance.now();
    let generator;

    switch (algorithm) {
      case 'bubble':
        generator = bubbleSort(array);
        break;
      case 'quick':
        generator = quickSort([...array]);
        break;
      case 'merge':
        generator = mergeSort([...array]);
        break;
    }

    await startSorting(generator, (val) => {
      if (!mute) playTone(val);
    });

    const duration = Math.round(performance.now() - startTime);
    setHistory((prev) =>
      [
        { id: Date.now(), algorithm, size: arraySize, time: duration },
        ...prev,
      ].slice(0, 5),
    );
  };

  if (!isClient) return <div className="bg-slate-950 min-h-screen" />;

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            ALGO PULSE
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-1">
            Telemetry Active
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">
            History
          </h2>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
              >
                <div className="flex justify-between text-[10px] font-bold text-cyan-500 uppercase">
                  <span>{item.algorithm}</span>
                  <span className="text-slate-500">N:{item.size}</span>
                </div>
                <div className="text-sm font-mono mt-1">{item.time}ms</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setMute(!mute)}
          className="text-[10px] font-mono uppercase tracking-widest py-2 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
        >
          Audio: {mute ? 'OFF' : 'ON'}
        </button>
      </aside>

      {/* Main Container */}
      <section className="flex-1 p-6 lg:p-10 flex flex-col gap-6 items-center">
        <div className="w-full max-w-5xl flex flex-col gap-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
            <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
              {(['bubble', 'quick', 'merge'] as AlgorithmType[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  disabled={!isPaused}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    algorithm === algo
                      ? 'bg-cyan-600 text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>

            <ControlPanel
              size={arraySize}
              speed={speed}
              onReset={(n) => {
                setArraySize(n);
                const arr = Array.from(
                  { length: n },
                  () => Math.floor(Math.random() * 100) + 5,
                );
                setArray(arr);
              }}
              onSpeedChange={setSpeed}
              isPaused={isPaused}
            />

            <div className="flex gap-2">
              <button
                onClick={shuffleData}
                disabled={!isPaused}
                className="flex-1 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-700 hover:bg-slate-800 disabled:opacity-30 transition-all"
              >
                Shuffle
              </button>
              <button
                onClick={handleStart}
                disabled={!isPaused}
                className="flex-[2] h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 transition-all shadow-lg shadow-cyan-900/20"
              >
                {isPaused ? 'Execute' : 'Running...'}
              </button>
            </div>
          </div>

          <div className="relative h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-800/50 flex items-end justify-center px-4 pb-2 gap-[1px] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#083344,transparent)] opacity-20" />
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
                    : 'bg-cyan-500/60'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Elements" value={array.length} />
            <StatCard label="Delay" value={`${speed}ms`} />
            <StatCard
              label="Phase"
              value={isPaused ? 'IDLE' : 'ACTIVE'}
              highlight={!isPaused}
            />
            <StatCard
              label="Complexity"
              value={algorithm === 'bubble' ? 'O(n²)' : 'O(n log n)'}
            />
          </div>
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
    <div className="bg-slate-900/30 border border-slate-800/50 p-4 rounded-xl">
      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
        {label}
      </div>
      <div
        className={`text-lg font-bold mt-1 ${highlight ? 'text-cyan-400 animate-pulse' : 'text-slate-200'}`}
      >
        {value}
      </div>
    </div>
  );
}
