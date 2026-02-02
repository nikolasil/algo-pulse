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

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(50);
  const [history, setHistory] = useState<any[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<
    { name: string; time: number }[] | null
  >(null);
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

  useEffect(() => {
    if (!hasInitialized.current) {
      handleGenerate();
      hasInitialized.current = true;
    }
  }, [setArray]);

  const handleGenerate = () => {
    stopSimulation();
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 100) + 5,
    );
    setArray(newArray);
  };

  const logResult = (name: string, startTime: number) => {
    const duration = Math.round(performance.now() - startTime);
    setHistory((prev) =>
      [
        { id: Date.now(), algorithm: name, size: array.length, time: duration },
        ...prev,
      ].slice(0, 10),
    );
    return duration;
  };

  const handleStopAll = () => {
    abortBenchmarkRef.current = true;
    stopSimulation();
    setIsBenchmarking(false);
  };

  const handleExecute = async () => {
    const startTime = performance.now();
    const { gen } = getAlgoData(algorithm);
    stopSimulation();
    await runSimulation(gen([...array]), (val) => playTone(val));
    logResult(algorithm, startTime);
  };

  const runFullBenchmark = async (isVisual: boolean) => {
    setIsBenchmarking(true);
    abortBenchmarkRef.current = false;
    stopSimulation();

    const algorithms: AlgorithmType[] = ['bubble', 'quick', 'merge'];
    const results: { name: string; time: number }[] = [];
    const originalArray = [...array];
    const originalSpeed = speed;

    for (const algo of algorithms) {
      if (abortBenchmarkRef.current) break;

      setAlgorithm(algo);
      const startTime = performance.now();
      const { gen } = getAlgoData(algo);

      if (isVisual) {
        setSpeed(1);
        await runSimulation(gen([...originalArray]));
      } else {
        const it = gen([...originalArray]);
        let res = await it.next();
        while (!res.done && !abortBenchmarkRef.current) {
          res = await it.next();
        }
      }

      if (!abortBenchmarkRef.current) {
        const time = logResult(algo, startTime);
        results.push({ name: algo, time });
        setArray(originalArray);
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!abortBenchmarkRef.current) {
      setBenchmarkResults(results);
    }

    setSpeed(originalSpeed);
    setIsBenchmarking(false);
    stopSimulation();
  };

  const handleStartStepByStep = () => {
    stopSimulation();
    const { gen } = getAlgoData(algorithm);
    generatorRef.current = gen([...array]);
    stepForward();
  };

  const handleTogglePause = () => {
    if (generatorRef.current) {
      togglePause();
      if (isPaused) runSimulation(generatorRef.current, (val) => playTone(val));
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {benchmarkResults && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 uppercase tracking-tight">
              Benchmark Results
            </h3>
            <div className="space-y-3 mb-6">
              {benchmarkResults.map((res) => (
                <div
                  key={res.name}
                  className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <span className="text-xs font-mono uppercase text-slate-400">
                    {res.name}
                  </span>
                  <span className="text-sm font-bold text-amber-400">
                    {res.time}ms
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setBenchmarkResults(null)}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl transition-all uppercase text-xs tracking-widest"
            >
              Close Report
            </button>
          </div>
        </div>
      )}

      <ExpandableSidebar>
        <NavHeader title="Sort Pulse" subtitle="Diagnostic Engine" />
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Select Algorithm
            </h2>
            <div className="flex gap-1">
              {(['bubble', 'quick', 'merge'] as AlgorithmType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAlgorithm(type)}
                  disabled={!!generatorRef.current || isBenchmarking}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${algorithm === type ? 'bg-cyan-600 shadow-md shadow-cyan-900/40' : 'bg-slate-800 text-slate-500'}`}
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

      <section className="flex-1 p-6 lg:p-10 flex flex-col gap-6 relative min-w-0">
        <ControlPanel
          size={arraySize}
          sizeShower={true}
          speed={speed}
          isPaused={isPaused}
          isBenchmarking={isBenchmarking}
          hasGenerator={!!generatorRef.current}
          onSpeedChange={setSpeed}
          onSizeChange={(n) => {
            setArraySize(n);
            const newArr = Array.from(
              { length: n },
              () => Math.floor(Math.random() * 100) + 5,
            );
            setArray(newArr);
          }}
          onStepBack={stepBackward}
          onStepForward={stepForward}
          onShuffle={() => {
            stopSimulation();
            const shuffled = [...array].sort(() => Math.random() - 0.5);
            setArray(shuffled);
          }}
          onGenerate={handleGenerate}
          onQuickBenchmark={() => runFullBenchmark(false)}
          onVisualRun={() => runFullBenchmark(true)}
          onExecute={handleExecute}
          onStop={handleStopAll}
          onTogglePause={handleTogglePause}
          onStartStepByStep={handleStartStepByStep}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Phase"
            value={
              isBenchmarking
                ? 'BENCHMARKING...'
                : !!generatorRef.current
                  ? isPaused
                    ? 'PAUSED'
                    : 'RUNNING'
                  : 'IDLE'
            }
            highlight={!!generatorRef.current && !isPaused}
          />
          <StatCard
            label="Complexity"
            value={getAlgoData(algorithm).complexity}
          />
          <StatCard label="Data Points" value={array.length} />
          <StatCard label="Cycle Speed" value={`${speed}ms`} />
        </div>

        <div className="relative flex-1 min-h-[400px] w-full bg-slate-950 rounded-3xl border border-slate-800/50 flex items-end justify-center px-4 pb-2 gap-[2px] overflow-hidden">
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
    </main>
  );
}
