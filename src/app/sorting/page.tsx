'use client';
import { useState, useEffect, useRef } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { useSortingLogic, AlgorithmType } from '@/hooks/useSortingLogic';

import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { VisualizerBar } from '@/components/VisualizerBar';
import { NavHeader } from '@/components/NavHeader';
import { StatCard } from '@/components/Diagnostic/StatCard';
import { TelemetryLog } from '@/components/Diagnostic/TelemetryLog';
import { ExpandableSidebar } from '@/components/Diagnostic/ExpandableSidebar';
import { BenchmarkModal } from '@/components/Diagnostic/BenchmarkModal'; // Imported new component

interface EnhancedBenchmarkResult {
  name: string;
  time: number;
  complexity: string;
  isFastest: boolean;
  delta: string;
}

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
  const [history, setHistory] = useState<any[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<
    EnhancedBenchmarkResult[] | null
  >(null);

  const [executionTime, setExecutionTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const hasInitialized = useRef(false);
  const abortBenchmarkRef = useRef(false);

  const { playTone } = useAudio();
  const {
    algorithm,
    setAlgorithm,
    isBenchmarking,
    setIsBenchmarking,
    getAlgoData,
  } = useSortingLogic();

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
    generatorRef,
  } = useAlgorithm([]);

  const startTimer = () => {
    stopTimer();
    setExecutionTime(0);
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setExecutionTime(Date.now() - startTime);
    }, 10);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      handleGenerate();
      hasInitialized.current = true;
    }
  }, [setArray]);

  const handleGenerate = () => {
    handleStopAll();
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 90) + 5,
    );
    setArray(newArray);
  };

  const handleGeneratePattern = (
    pattern: 'nearly' | 'reversed' | 'few-unique',
  ) => {
    handleStopAll();
    let newArr = Array.from(
      { length: arraySize },
      (_, i) => Math.floor((i / arraySize) * 90) + 5,
    );

    if (pattern === 'nearly') {
      for (let i = 0; i < newArr.length; i++) {
        if (Math.random() > 0.8) {
          const j = Math.floor(Math.random() * newArr.length);
          [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
      }
    } else if (pattern === 'reversed') {
      newArr.reverse();
    } else if (pattern === 'few-unique') {
      const values = [20, 40, 60, 80];
      newArr = Array.from(
        { length: arraySize },
        () => values[Math.floor(Math.random() * values.length)],
      );
    }
    setArray(newArr);
  };

  const handleUpdateManual = (input: string) => {
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

  const logResult = (name: string, duration: number) => {
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          algorithm: name,
          size: array.length,
          time: Math.round(duration),
        },
        ...prev,
      ].slice(0, 10),
    );
  };

  const handleStopAll = () => {
    abortBenchmarkRef.current = true;
    stopTimer();
    stopSimulation();
    setIsBenchmarking(false);
  };

  const handleExecute = async () => {
    const { gen } = getAlgoData(algorithm);
    stopSimulation();
    const startTime = performance.now();
    startTimer();
    await runSimulation(gen([...array]), (val) => playTone(val));
    stopTimer();
    const finalDuration = performance.now() - startTime;
    setExecutionTime(finalDuration);
    logResult(algorithm, finalDuration);
  };

  const runFullBenchmark = async (isVisual: boolean) => {
    setIsBenchmarking(true);
    abortBenchmarkRef.current = false;
    stopSimulation();
    setExecutionTime(0);

    const algorithms: AlgorithmType[] = ['Bubble', 'Quick', 'Merge'];
    const rawResults: { name: string; time: number; complexity: string }[] = [];
    const originalArray = [...array];
    const originalSpeed = speed;

    for (const algo of algorithms) {
      if (abortBenchmarkRef.current) break;
      setAlgorithm(algo);
      const startTime = performance.now();
      startTimer();
      const { gen, complexity } = getAlgoData(algo);

      if (isVisual) {
        setSpeed(1);
        await runSimulation(gen([...originalArray]), (val) => playTone(val));
      } else {
        const it = gen([...originalArray]);
        let res = await it.next();
        while (!res.done && !abortBenchmarkRef.current) {
          res = await it.next();
        }
      }

      stopTimer();
      const finalDuration = performance.now() - startTime;
      if (!abortBenchmarkRef.current) {
        rawResults.push({
          name: algo,
          time: Math.round(finalDuration),
          complexity,
        });
        logResult(algo, finalDuration);
        setArray(originalArray);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!abortBenchmarkRef.current) {
      const times = rawResults.map((r) => r.time);
      const fastestTime = Math.min(...times);
      const enhanced = rawResults.map((r) => ({
        ...r,
        isFastest: r.time === fastestTime,
        delta:
          r.time === fastestTime
            ? 'FASTEST'
            : `+${(((r.time - fastestTime) / fastestTime) * 100).toFixed(0)}%`,
      }));
      setBenchmarkResults(enhanced);
    }
    setSpeed(originalSpeed);
    setIsBenchmarking(false);
    stopSimulation();
  };

  const handleStartStepByStep = () => {
    stopSimulation();
    setExecutionTime(0);
    const { gen } = getAlgoData(algorithm);
    generatorRef.current = gen([...array]);
    stepForward();
  };

  const handleTogglePause = () => {
    if (generatorRef.current) {
      togglePause();
      if (isPaused) {
        runSimulation(generatorRef.current, (val) => playTone(val));
      }
    }
  };

  const formatTime = (ms: number) => (ms / 1000).toFixed(2) + 's';

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100 relative">
      <ExpandableSidebar>
        <NavHeader title="Sort Pulse" subtitle="Diagnostic Engine" />
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-bold text-slate-400 tracking-widest">
              Select Algorithm
            </h2>
            <div className="flex gap-1">
              {(['Bubble', 'Quick', 'Merge'] as AlgorithmType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAlgorithm(type)}
                  disabled={!!generatorRef.current || isBenchmarking}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${algorithm === type ? 'bg-cyan-600 shadow-md shadow-cyan-900/40' : 'bg-slate-800 text-slate-500'}`}
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
          hasGenerator={!!generatorRef.current}
          currentArray={array}
          onSpeedChange={setSpeed}
          onSizeChange={(n) => {
            setArraySize(n);
            const newArr = Array.from(
              { length: n },
              () => Math.floor(Math.random() * 90) + 5,
            );
            setArray(newArr);
          }}
          onStepBack={stepBackward}
          onStepForward={stepForward}
          onShuffle={() => {
            handleStopAll();
            setArray([...array].sort(() => Math.random() - 0.5));
          }}
          onGenerate={handleGenerate}
          onGeneratePattern={handleGeneratePattern}
          onManualUpdate={handleUpdateManual}
          onQuickBenchmark={() => runFullBenchmark(false)}
          onVisualRun={() => runFullBenchmark(true)}
          onExecute={handleExecute}
          onStop={handleStopAll}
          onTogglePause={handleTogglePause}
          onStartStepByStep={handleStartStepByStep}
        />

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard label="Algorithm" value={algorithm} highlight={true} />
          <StatCard
            label="Phase"
            value={
              isBenchmarking
                ? 'BENCHMARKING'
                : !!generatorRef.current
                  ? isPaused
                    ? 'PAUSED'
                    : 'RUNNING'
                  : 'IDLE'
            }
            highlight={!!generatorRef.current && !isPaused}
          />
          <StatCard
            label="Exec Time"
            value={formatTime(executionTime)}
            highlight={!!timerIntervalRef.current}
          />
          <StatCard
            label="Complexity"
            value={getAlgoData(algorithm).complexity}
          />
          <StatCard label="Data Points" value={array.length} />
          <StatCard label="Cycle Speed" value={`${speed}ms`} />
        </div>

        <div className="relative flex-1 min-h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-800/50 flex items-end justify-center px-4 pb-2 gap-[1px] sm:gap-[2px] overflow-hidden">
          {array.map((val, idx) => (
            <VisualizerBar
              key={idx}
              val={val}
              status={comparing.includes(idx) ? 'swapping' : 'idle'}
              maxVal={100}
            />
          ))}
        </div>
      </section>

      {/* RENDER NEW COMPONENT */}
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
