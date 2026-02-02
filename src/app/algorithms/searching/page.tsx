'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { VisualizerBar } from '@/components/VisualizerBar';
import { NavHeader } from '@/components/NavHeader';
import { StatCard } from '@/components/StatCard';
import { TelemetryLog } from '@/components/TelemetryLog';
import { ExpandableSidebar } from '@/components/ExpandableSidebar';
import { BenchmarkModal } from '@/components/BenchmarkModal';
import { AlgorithmType, useSearchingLogic } from '@/hooks/useSearchingLogic';

export default function SearchingPage() {
  const [arraySize, setArraySize] = useState(30);
  const [target, setTarget] = useState<number>(0);
  const [history, setHistory] = useState<
    {
      id: number;
      algorithm: string;
      size: number;
      time: number;
      success: boolean;
    }[]
  >([]);
  const [benchmarkData, setBenchmarkData] = useState<
    | { name: string; time: number; complexity: string; success: boolean }[]
    | null
  >([]);

  const abortBenchmarkRef = useRef(false);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [searchRange, setSearchRange] = useState<[number, number] | null>(null);

  const hasInitialized = useRef(false);
  const hasInitializedTarget = useRef(false);
  const abortRef = useRef(false);

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
    stopSimulation,
    togglePause,
    stepForward,
    stepBackward,
    startStepByStep,
    hasGenerator,
    generateRandom,
    generatePattern,
    shuffleArray,
    generatorRef,
  } = useAlgorithm([]);

  useEffect(() => {
    if (!hasInitialized.current) {
      generateRandom(arraySize);
      hasInitialized.current = true;
    }
  }, [generateRandom, arraySize]);

  useEffect(() => {
    if (array.length > 0 && !hasGenerator && !hasInitializedTarget.current) {
      setTarget(array[Math.floor(Math.random() * array.length)]);
      hasInitializedTarget.current = true;
    }
  }, [array, hasGenerator]);

  const {
    algorithm,
    setAlgorithm,
    isBenchmarking,
    setIsBenchmarking,
    getAlgoData,
  } = useSearchingLogic();

  const handleStopAll = () => {
    abortBenchmarkRef.current = true;
    stopSimulation();
    setIsBenchmarking(false);
  };

  const handleManualUpdate = (input: string) => {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
        handleStopAll();
        setArray(parsed);
        setArraySize(parsed.length);
      }
    } catch (e) {
      console.error('Invalid array format');
    }
  };

  const createWrappedGenerator = useCallback(
    (onFound: (idx: number) => void) => {
      const { gen } = getAlgoData(algorithm);
      return async function* () {
        let isFound = false;
        for await (const step of gen(array, target)) {
          if (step.found !== undefined && step.found !== -1) {
            setFoundIndex(step.found);
            onFound(step.found);
            isFound = true;
          }
          if (step.range) setSearchRange(step.range);
          yield step;
        }
        // If generator ends without finding, explicit check can go here if needed
      };
    },
    [algorithm, array, target, getAlgoData],
  );

  const handleExecute = async () => {
    setFoundIndex(null);
    setSearchRange(null);
    let wasSuccessful = false;
    const startTime = performance.now();

    // The callback only fires if the index is found
    const wrapped = createWrappedGenerator(() => {
      wasSuccessful = true;
    });

    await runSimulation(wrapped(), (val) => playTone(val));
    const duration = Math.round(performance.now() - startTime);

    setHistory((prev) => [
      {
        id: Date.now(),
        algorithm: algorithm,
        size: array.length,
        time: duration,
        success: wasSuccessful,
      },
      ...prev,
    ]);
  };

  const runFullBenchmark = async (isVisual: boolean) => {
    setIsBenchmarking(true);
    abortRef.current = false;
    stopSimulation();
    const algos: AlgorithmType[] = ['Linear', 'Binary', 'Jump'];
    const results: {
      name: string;
      time: number;
      complexity: string;
      success: boolean;
      size: number;
    }[] = [];
    const originalSpeed = speed;

    for (const algo of algos) {
      if (abortRef.current) break;
      setAlgorithm(algo);
      setFoundIndex(null);
      setSearchRange(null);

      let wasSuccessful = false;
      const { gen, complexity } = getAlgoData(algo);
      const startTime = performance.now();

      if (isVisual) {
        setSpeed(0);
        const wrapped = async function* () {
          for await (const step of gen(array, target)) {
            if (step.found !== undefined && step.found !== -1)
              wasSuccessful = true;
            if (step.range) setSearchRange(step.range);
            yield step;
          }
        };
        await runSimulation(wrapped(), (val) => playTone(val));
      } else {
        const it = gen(array, target);
        let res = await it.next();
        while (!res.done && !abortRef.current) {
          if (res.value?.found !== undefined && res.value.found !== -1)
            wasSuccessful = true;
          res = await it.next();
        }
      }

      if (!abortRef.current) {
        const duration = Math.round(performance.now() - startTime);
        results.push({
          name: algo,
          time: duration,
          complexity,
          success: wasSuccessful,
          size: array.length,
        });
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!abortRef.current) {
      setBenchmarkData(results);
      setHistory((prev) => [
        ...results.map((r) => ({
          id: Date.now() + Math.random(),
          algorithm: r.name,
          size: array.length,
          time: r.time,
          success: r.success,
        })),
        ...prev,
      ]);
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
              {(['Linear', 'Binary', 'Jump'] as AlgorithmType[]).map((type) => (
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
          isSearch={true}
          targetValue={target}
          onTargetChange={(val) => {
            setTarget(val);
            hasInitializedTarget.current = true;
          }}
          size={arraySize}
          sizeShower={true}
          speed={speed}
          isPaused={isPaused}
          isBenchmarking={isBenchmarking}
          hasGenerator={hasGenerator}
          currentArray={array}
          onSpeedChange={setSpeed}
          onSizeChange={(n) => {
            setArraySize(n);
            hasInitializedTarget.current = false;
            generateRandom(n);
          }}
          onStepBack={stepBackward}
          onStepForward={stepForward}
          onShuffle={shuffleArray}
          onGenerate={() => {
            hasInitializedTarget.current = false;
            generateRandom(arraySize);
          }}
          onGeneratePattern={(p) => {
            hasInitializedTarget.current = false;
            generatePattern(arraySize, p);
          }}
          onManualUpdate={handleManualUpdate}
          onQuickBenchmark={() => runFullBenchmark(false)}
          onVisualRun={() => runFullBenchmark(true)}
          onExecute={handleExecute}
          onStop={handleStopAll}
          onTogglePause={() => {
            togglePause();
            if (isPaused && generatorRef.current)
              runSimulation(generatorRef.current, (val) => playTone(val));
          }}
          onStartStepByStep={() => {
            const { gen } = getAlgoData(algorithm);
            startStepByStep(gen([...array], target));
            stepForward();
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
            value={
              foundIndex !== null
                ? `FOUND AT INDEX ${foundIndex}`
                : hasGenerator && !isPaused
                  ? 'SEARCHING...'
                  : 'NOT FOUND'
            }
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
                status={status}
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

      {benchmarkData && benchmarkData.length > 0 && (
        <BenchmarkModal
          data={benchmarkData}
          onClose={() => setBenchmarkData(null)}
          onReRun={() => {
            setBenchmarkData(null);
            runFullBenchmark(false);
          }}
        />
      )}
    </main>
  );
}
