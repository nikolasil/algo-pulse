'use client';
import { sortingAlgorithms } from '@/hooks/algorithms/sortingAlgorithms';
import { RawBenchmarkData, BenchmarkModal } from '@/components/BenchmarkModal';
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { ExpandableSidebar } from '@/components/ExpandableSidebar';
import { NavHeader } from '@/components/NavHeader';
import { SelectionAlgorithm } from '@/components/SelectionAlgorithm';
import { StatCard } from '@/components/StatCard';
import { TelemetryLog } from '@/components/TelemetryLog';
import { VisualizerBar } from '@/components/vizualizer/BarVizualizer';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { useSortingLogic } from '@/hooks/useSortingLogic';
import { useState, useRef, useCallback, useEffect } from 'react';

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
  const [executionTime, setExecutionTime] = useState(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);
  const abortBenchmarkRef = useRef(false);

  // 1. State for bar width (Zoom)
  const [barWidth, setBarWidth] = useState(32);

  // 2. Handlers
  const zoomIn = () => setBarWidth((prev) => Math.min(prev + 8, 100)); // Max width 100px
  const zoomOut = () => setBarWidth((prev) => Math.max(prev - 8, 1)); // Min width 8px

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

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setExecutionTime(0);
    const startTime = Date.now();
    timerIntervalRef.current = setInterval(
      () => setExecutionTime(Date.now() - startTime),
      10,
    );
  }, [stopTimer]);

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
    await runSimulation(gen({ array: [...array] }), (val) => playTone(val));

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

    const results: RawBenchmarkData[] = [];
    const originalArray = [...array];
    const originalSpeed = speed;

    for (const algo of sortingAlgorithms) {
      if (abortBenchmarkRef.current) break;
      setAlgorithm(algo);
      const startTime = performance.now();
      startTimer();
      const { gen } = getAlgoData(algo);

      if (isVisual) {
        setSpeed(0);
        await runSimulation(gen({ array: [...originalArray] }), (val) =>
          playTone(val),
        );
      } else {
        const it = gen({ array: [...originalArray] });
        let res = await it.next();
        while (!res.done && !abortBenchmarkRef.current) res = await it.next();
      }

      stopTimer();
      const finalDuration = performance.now() - startTime;

      if (!abortBenchmarkRef.current) {
        results.push({
          name: algo,
          time: Math.round(finalDuration),
          complexity: getAlgoData(algo).complexity.average,
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
      console.error('Invalid array input', e);
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100 relative">
      <ExpandableSidebar>
        <NavHeader title="Sort Pulse" subtitle="Diagnostic Engine" />
        <section>
          <SelectionAlgorithm
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            algorithmOptions={sortingAlgorithms}
            hasGenerator={hasGenerator}
            isBenchmarking={isBenchmarking}
          />
          <CodeViewer data={getAlgoData(algorithm)} activeLine={activeLine} />
        </section>
        <TelemetryLog history={history} />
      </ExpandableSidebar>

      <section className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 relative min-w-0">
        <ControlPanel
          size={arraySize}
          maxSize={200}
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
            startStepByStep(gen({ array: [...array] }));
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
          />
          <StatCard
            label="Complexity"
            value={getAlgoData(algorithm).complexity.average}
          />
          <StatCard label="Data Points" value={array.length} />
          <StatCard label="Cycle Speed" value={`${speed}ms`} />
        </div>

        <div className="flex flex-col gap-4">
          {/* ZOOM CONTROLS */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={zoomOut}
              className="px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700"
            >
              - Zoom Out
            </button>
            <button
              onClick={zoomIn}
              className="px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700"
            >
              + Zoom In
            </button>
          </div>

          {/* SCROLLABLE CONTAINER */}
          <div className="w-full overflow-x-auto pb-10 custom-scrollbar">
            <div className="flex items-end h-100 min-w-full px-4 gap-1">
              {array.map((val, idx) => (
                <VisualizerBar
                  key={idx}
                  val={val}
                  width={barWidth} // <--- Pass the zoom level here
                  status={comparing?.includes(idx) ? 'swapping' : 'idle'}
                  maxVal={Math.max(...array)}
                  isFirst={idx === 0}
                  isLast={idx === array.length - 1}
                />
              ))}
            </div>
          </div>
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
