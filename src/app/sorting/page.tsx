'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSorting } from '@/hooks/useSorting';
import { ControlPanel } from '@/components/ControlPanel';
import { bubbleSort } from '@/algorithms/sorting/bubbleSort';
import { quickSort } from '@/algorithms/sorting/quickSort';

type AlgorithmType = 'bubble' | 'quick';

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bubble');
  const [isClient, setIsClient] = useState(false);
  const hasInitialized = useRef(false);

  const generateRandomArray = useCallback((size: number) => {
    return Array.from(
      { length: size },
      () => Math.floor(Math.random() * 100) + 5,
    );
  }, []);

  const {
    array,
    setArray,
    isPaused,
    setSpeed,
    speed,
    comparing,
    startSorting,
  } = useSorting([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !hasInitialized.current) {
      setArray(generateRandomArray(arraySize));
      hasInitialized.current = true;
    }
  }, [isClient, arraySize, generateRandomArray, setArray]);

  const handleReset = (newSize: number) => {
    setArraySize(newSize);
    setArray(generateRandomArray(newSize));
  };

  const handleStart = () => {
    const generator =
      algorithm === 'bubble' ? bubbleSort(array) : quickSort([...array]); // Pass a copy for recursive safety

    startSorting(generator);
  };

  if (!isClient) return <div className="bg-slate-950 min-h-screen" />;

  return (
    <main className="flex flex-col items-center p-8 bg-slate-950 min-h-screen text-slate-100">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          ALGO PULSE
        </h1>
        <p className="text-slate-500 font-mono text-sm mt-2">
          Sorting Visualizer v1.0
        </p>
      </header>

      <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
        <div className="flex gap-4 mb-2">
          {(['bubble', 'quick'] as AlgorithmType[]).map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              disabled={!isPaused}
              className={`px-4 py-1 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                algorithm === algo
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {algo} sort
            </button>
          ))}
        </div>

        <ControlPanel
          size={arraySize}
          speed={speed}
          onReset={handleReset}
          onSpeedChange={setSpeed}
          isPaused={isPaused}
        />

        <button
          onClick={handleStart}
          disabled={!isPaused}
          className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-full transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
        >
          {isPaused ? `RUN ${algorithm.toUpperCase()} SORT` : 'SORTING...'}
        </button>
      </div>

      <div className="flex items-end justify-center gap-[1px] w-full max-w-6xl h-[400px] mt-12 border-b border-slate-800 bg-slate-900/10 px-4">
        {array.map((val, idx) => (
          <div
            key={idx}
            style={{
              height: `${(val / 105) * 100}%`,
              width: `${100 / array.length}%`,
            }}
            className={`transition-all duration-75 rounded-t-[1px] ${
              comparing.includes(idx)
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'bg-cyan-500'
            }`}
          />
        ))}
      </div>
    </main>
  );
}
