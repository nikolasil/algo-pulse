'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { VisualizerBar } from '@/components/VisualizerBar';
import { NavHeader } from '@/components/NavHeader';
import { StatCard } from '@/components/Diagnostic/StatCard';
import { TelemetryLog } from '@/components/Diagnostic/TelemetryLog';
import { ExpandableSidebar } from '@/components/Diagnostic/ExpandableSidebar';
import { BenchmarkModal } from '@/components/Diagnostic/BenchmarkModal';

import {
  linearSearch,
  linearSearchCode,
  binarySearch,
  binarySearchCode,
  jumpSearch,
  jumpSearchCode,
} from '@/algorithms/searchingAlgorithms';

type SearchAlgo = 'Linear' | 'Binary' | 'Jump';

interface EnhancedBenchmarkResult {
  name: string;
  time: number;
  complexity: string;
  isFastest: boolean;
  delta: string;
}

export default function SearchingPage() {
  const [arraySize, setArraySize] = useState(30);
  const [target, setTarget] = useState<number>(0);
  const [algorithm, setAlgorithm] = useState<SearchAlgo>('Linear');
  const [history, setHistory] = useState<any[]>([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<
    EnhancedBenchmarkResult[] | null
  >(null);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [searchRange, setSearchRange] = useState<[number, number] | null>(null);

  const hasInitialized = useRef(false);
  const abortRef = useRef(false);

  const { playTone } = useAudio();
  const algoTools = useAlgorithm([]);

  const {
    array,
    setArray,
    speed,
    setSpeed,
    comparing,
    activeLine,
    runSimulation,
    stopSimulation,
    isPaused,
    hasGenerator,
    togglePause,
    stepForward,
    stepBackward,
    startStepByStep,
  } = algoTools;

  useEffect(() => {
    if (!hasInitialized.current) {
      handleGenerate();
      hasInitialized.current = true;
    }
  }, []);

  const getAlgoData = useCallback((type: SearchAlgo) => {
    switch (type) {
      case 'Binary':
        return {
          gen: binarySearch,
          code: binarySearchCode,
          complexity: 'O(log n)',
        };
      case 'Jump':
        return { gen: jumpSearch, code: jumpSearchCode, complexity: 'O(√n)' };
      default:
        return {
          gen: linearSearch,
          code: linearSearchCode,
          complexity: 'O(n)',
        };
    }
  }, []);

  const handleGenerate = () => {
    stopSimulation();
    const newArr = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 90) + 10,
    ).sort((a, b) => a - b);
    setArray(newArr);
    setTarget(newArr[Math.floor(Math.random() * newArr.length)]);
    setFoundIndex(null);
    setSearchRange(null);
  };

  const handleShuffle = () => {
    stopSimulation();
    const shuffled = [...array]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .sort((a, b) => a - b);

    setArray(shuffled);
    setFoundIndex(null);
    setSearchRange(null);
  };

  const createWrappedGenerator = useCallback(() => {
    const { gen } = getAlgoData(algorithm);
    return async function* () {
      for await (const step of gen(array, target)) {
        if (step.found !== undefined) setFoundIndex(step.found);
        if (step.range) setSearchRange(step.range);
        yield step;
      }
    };
  }, [algorithm, array, target, getAlgoData]);

  const handleExecute = async () => {
    setFoundIndex(null);
    setSearchRange(null);
    const startTime = performance.now();
    const wrapped = createWrappedGenerator();

    await runSimulation(wrapped(), (val) => playTone(val));
    const duration = Math.round(performance.now() - startTime);

    setHistory((prev) =>
      [
        {
          id: Date.now(),
          algorithm: algorithm,
          size: array.length,
          time: duration,
          status: foundIndex !== null ? 'SUCCESS' : 'COMPLETE',
        },
        ...prev,
      ].slice(0, 10),
    );
  };

  const runFullBenchmark = async (isVisual: boolean) => {
    setIsBenchmarking(true);
    abortRef.current = false;
    stopSimulation();
    const algos: SearchAlgo[] = ['Linear', 'Binary', 'Jump'];
    const rawResults: any[] = [];
    const originalSpeed = speed;

    for (const algo of algos) {
      if (abortRef.current) break;
      setAlgorithm(algo);
      setFoundIndex(null);
      setSearchRange(null);
      const { gen, complexity } = getAlgoData(algo);
      const startTime = performance.now();

      if (isVisual) {
        setSpeed(1);
        const wrapped = createWrappedGenerator();
        await runSimulation(wrapped(), (val) => playTone(val));
      } else {
        const it = gen(array, target);
        let res = await it.next();
        while (!res.done && !abortRef.current) res = await it.next();
      }
      rawResults.push({
        name: algo,
        time: Math.round(performance.now() - startTime),
        complexity,
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!abortRef.current) {
      const fastest = Math.min(...rawResults.map((r) => r.time));
      setBenchmarkResults(
        rawResults.map((r) => ({
          ...r,
          isFastest: r.time === fastest,
          delta:
            r.time === fastest
              ? 'OPTIMAL'
              : `+${(((r.time - fastest) / (fastest || 1)) * 100).toFixed(0)}%`,
        })),
      );
    }
    setSpeed(originalSpeed);
    setIsBenchmarking(false);
  };

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100 relative">
      <ExpandableSidebar>
        <NavHeader title="Search Pulse" subtitle="Diagnostic Engine" />
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-bold text-slate-400 tracking-widest">
              Select Algorithm
            </h2>
            <div className="flex gap-1">
              {(['Linear', 'Binary', 'Jump'] as SearchAlgo[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setAlgorithm(type);
                    setFoundIndex(null);
                    setSearchRange(null);
                    stopSimulation();
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${algorithm === type ? 'bg-cyan-600 shadow-md' : 'bg-slate-800 text-slate-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <CodeViewer
            code={getAlgoData(algorithm).code}
            activeLine={activeLine}
          />
        </section>
        <TelemetryLog history={history} />
      </ExpandableSidebar>

      <section className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 relative min-w-0">
        <ControlPanel
          size={arraySize}
          sizeShower={true}
          speed={speed}
          isPaused={isPaused}
          isBenchmarking={isBenchmarking}
          currentArray={array}
          isSearch={true}
          targetValue={target}
          onTargetChange={setTarget}
          onSpeedChange={setSpeed}
          onSizeChange={(n) => {
            setArraySize(n);
            handleGenerate();
          }}
          onShuffle={handleShuffle}
          onGenerate={handleGenerate}
          onQuickBenchmark={() => runFullBenchmark(false)}
          onVisualRun={() => runFullBenchmark(true)}
          onExecute={handleExecute}
          onGeneratePattern={() => {}}
          onManualUpdate={(input) => {
            const parsed = input
              .replace(/[\[\]]/g, '')
              .split(',')
              .map(Number)
              .filter((n) => !isNaN(n));
            setArray(parsed.sort((a, b) => a - b));
          }}
          hasGenerator={hasGenerator}
          onStartStepByStep={() => {
            if (typeof startStepByStep === 'function') {
              setFoundIndex(null);
              setSearchRange(null);
              const wrapped = createWrappedGenerator();
              startStepByStep(wrapped());
            }
          }}
          onStepBack={stepBackward}
          onStepForward={stepForward}
          onTogglePause={togglePause}
          onStop={() => {
            abortRef.current = true;
            stopSimulation();
            setIsBenchmarking(false);
            setFoundIndex(null);
            setSearchRange(null);
          }}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Phase"
            value={
              isBenchmarking
                ? 'BENCHMARK'
                : !isPaused && hasGenerator
                  ? 'SCANNING'
                  : 'IDLE'
            }
            highlight={!isPaused && hasGenerator}
          />
          <StatCard
            label="Complexity"
            value={getAlgoData(algorithm).complexity}
          />
          <StatCard label="Data Points" value={array.length} />
          <StatCard
            label="Result"
            value={foundIndex !== null ? `FOUND AT ${foundIndex}` : 'NOT FOUND'}
            highlight={foundIndex !== null}
          />
        </div>

        <div className="relative flex-1 min-h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-800/50 flex items-end justify-center px-4 pb-2 gap-[2px] overflow-hidden">
          {array.map((val, idx) => {
            const isOutOfRange =
              searchRange && (idx < searchRange[0] || idx > searchRange[1]);
            let status: 'idle' | 'comparing' | 'found' = 'idle';
            if (foundIndex === idx) status = 'found';
            else if (comparing.includes(idx)) status = 'comparing';

            return (
              <VisualizerBar
                key={`${idx}-${val}`}
                val={val}
                status={
                  status === 'found'
                    ? 'swapping'
                    : status === 'comparing'
                      ? 'comparing'
                      : 'idle'
                }
                maxVal={100}
                className={
                  isOutOfRange
                    ? 'opacity-10 transition-opacity duration-500'
                    : 'opacity-100'
                }
              />
            );
          })}
        </div>
      </section>

      {benchmarkResults && (
        <BenchmarkModal
          results={benchmarkResults}
          arraySize={array.length}
          onClose={() => setBenchmarkResults(null)}
          onReRun={() => {
            setBenchmarkResults(null);
            runFullBenchmark(false);
          }}
        />
      )}
    </main>
  );
}
