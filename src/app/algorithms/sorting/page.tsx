'use client';
import { useState, useEffect, useRef } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { useSortingLogic, AlgorithmType } from '@/hooks/useSortingLogic';

import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { VisualizerBar } from '@/components/VisualizerBar';
import { NavHeader } from '@/components/NavHeader';
import { StatCard } from '@/components/StatCard';
import { TelemetryLog } from '@/components/TelemetryLog';
import { ExpandableSidebar } from '@/components/ExpandableSidebar';
import { BenchmarkModal, RawBenchmarkData } from '@/components/BenchmarkModal';

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
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
    benchmarkData,
    setBenchmarkData,
    history,
    setHistory,
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
    startStepByStep,
    hasGenerator,
    generateRandom,
    generatePattern,
    shuffleArray,
    generatorRef,
  } = useAlgorithm([]);

  const startTimer = () => {
    stopTimer();
    setExecutionTime(0);
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(
      () => setExecutionTime(Date.now() - startTime),
      10,
    );
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      generateRandom(arraySize);
      hasInitialized.current = true;
    }
  }, [generateRandom, arraySize]);

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
    setHistory((prev) => [
      {
        id: Date.now(),
        algorithm,
        size: array.length,
        time: Math.round(finalDuration),
      },
      ...prev,
    ]);
  };

  const runFullBenchmark = async (isVisual: boolean) => {
    setIsBenchmarking(true);
    abortBenchmarkRef.current = false;
    stopSimulation();
    setExecutionTime(0);

    const algorithms: AlgorithmType[] = ['Bubble', 'Quick', 'Merge'];
    const results: RawBenchmarkData[] = [];
    const originalArray = [...array];
    const originalSpeed = speed;

    for (const algo of algorithms) {
      if (abortBenchmarkRef.current) break;
      setAlgorithm(algo);
      const startTime = performance.now();
      startTimer();
      const { gen, complexity } = getAlgoData(algo);

      if (isVisual) {
        setSpeed(0);
        await runSimulation(gen([...originalArray]), (val) => playTone(val));
      } else {
        const it = gen([...originalArray]);
        let res = await it.next();
        while (!res.done && !abortBenchmarkRef.current) res = await it.next();
      }

      stopTimer();
      const finalDuration = performance.now() - startTime;

      if (!abortBenchmarkRef.current) {
        results.push({
          name: algo,
          time: Math.round(finalDuration),
          complexity,
          size: originalArray.length,
        });
        setArray(originalArray);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!abortBenchmarkRef.current) {
      setBenchmarkData(results);
      // Sync history with benchmark results
      setHistory((prev) => [
        ...results.map((r) => ({
          id: Date.now() + Math.random(),
          algorithm: r.name,
          size: originalArray.length,
          time: r.time,
        })),
        ...prev,
      ]);
    }

    setSpeed(originalSpeed);
    setIsBenchmarking(false);
    stopSimulation();
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
                  disabled={hasGenerator || isBenchmarking}
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
          hasGenerator={hasGenerator}
          currentArray={array}
          onSpeedChange={setSpeed}
          onSizeChange={(n) => {
            setArraySize(n);
            generateRandom(n);
          }}
          onStepBack={stepBackward}
          onStepForward={stepForward}
          onShuffle={shuffleArray}
          onGenerate={() => generateRandom(arraySize)}
          onGeneratePattern={(p) => generatePattern(arraySize, p)}
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
            startStepByStep(gen([...array]));
            stepForward();
          }}
        />

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard label="Algorithm" value={algorithm} highlight={true} />
          <StatCard
            label="Phase"
            value={
              isBenchmarking
                ? 'BENCHMARKING'
                : hasGenerator
                  ? isPaused
                    ? 'PAUSED'
                    : 'RUNNING'
                  : 'IDLE'
            }
            highlight={hasGenerator && !isPaused}
          />
          <StatCard
            label="Exec Time"
            value={(executionTime / 1000).toFixed(2) + 's'}
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

      {benchmarkData && (
        <BenchmarkModal
          data={benchmarkData}
          onClose={() => setBenchmarkData([])}
          onReRun={() => {
            setBenchmarkData([]);
            runFullBenchmark(false);
          }}
        />
      )}
    </main>
  );
}
