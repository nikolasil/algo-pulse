'use client';
import { useState, useEffect, useRef } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { useSortingLogic, AlgorithmType } from '@/hooks/useSortingLogic';

// Standard Components
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
  const hasInitialized = useRef(false);

  const { playTone } = useAudio();
  const {
    algorithm,
    setAlgorithm,
    isBenchmarking,
    setIsBenchmarking,
    showQuickReport,
    setShowQuickReport,
    quickResults,
    setQuickResults,
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
    shuffleData,
    togglePause,
    stopSimulation,
    stepForward,
    stepBackward,
    generatorRef,
  } = useAlgorithm([]);

  useEffect(() => {
    if (!hasInitialized.current) {
      setArray(
        Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 5),
      );
      hasInitialized.current = true;
    }
  }, [setArray]);

  const handleStart = async () => {
    const startTime = performance.now();
    const { gen } = getAlgoData(algorithm);
    await runSimulation(gen([...array]), (val) => playTone(val));
    const duration = Math.round(performance.now() - startTime);
    setHistory((prev) =>
      [
        { id: Date.now(), algorithm, size: array.length, time: duration },
        ...prev,
      ].slice(0, 10),
    );
  };

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
      const { gen } = getAlgoData(algo);
      await runSimulation(gen([...benchmarkData]), (val) => playTone(val));
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

  const runQuickBenchmark = async () => {
    const algos: AlgorithmType[] = ['bubble', 'quick', 'merge'];
    const results: any[] = [];
    for (const algo of algos) {
      const benchmarkData = [...array];
      const startTime = performance.now();
      const { gen, complexity } = getAlgoData(algo);
      const generator = gen([...benchmarkData]);
      let res = await generator.next();
      while (!res.done) {
        res = await generator.next();
      }
      const duration = (performance.now() - startTime).toFixed(2);
      results.push({ name: algo.toUpperCase(), time: duration, complexity });
    }
    setQuickResults(results);
    setShowQuickReport(true);
  };

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
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
                  disabled={!isPaused || isBenchmarking}
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

          <div className="flex gap-2 w-full md:w-auto flex-1 flex-wrap items-center">
            <div className="flex gap-1 mr-2">
              <button
                onClick={stepBackward}
                disabled={isBenchmarking}
                className="w-10 h-12 rounded-xl border border-slate-700 hover:bg-slate-800 flex items-center justify-center transition-colors text-[9px] font-bold uppercase"
              >
                Prev
              </button>
              <button
                onClick={stepForward}
                disabled={isBenchmarking}
                className="w-10 h-12 rounded-xl border border-slate-700 hover:bg-slate-800 flex items-center justify-center transition-colors text-[9px] font-bold uppercase"
              >
                Next
              </button>
            </div>

            <button
              onClick={shuffleData}
              disabled={!isPaused || isBenchmarking}
              className="px-4 h-12 rounded-xl border border-slate-700 uppercase text-[9px] font-bold hover:bg-slate-800 transition-colors"
            >
              Shuffle
            </button>
            <button
              onClick={runQuickBenchmark}
              disabled={!isPaused || isBenchmarking}
              className="px-4 h-12 rounded-xl border border-indigo-500 text-indigo-400 uppercase text-[9px] font-bold hover:bg-indigo-950 transition-colors"
            >
              Quick
            </button>
            <button
              onClick={runVisualBenchmark}
              disabled={!isPaused || isBenchmarking}
              className="px-4 h-12 rounded-xl border border-cyan-800 text-cyan-400 uppercase text-[9px] font-bold hover:bg-cyan-950 transition-colors"
            >
              Visual Run
            </button>

            <div className="flex gap-2 flex-1 min-w-[120px]">
              {isPaused ? (
                <button
                  onClick={handleStart}
                  disabled={isBenchmarking}
                  className="flex-1 px-4 h-12 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase text-[10px] shadow-lg shadow-cyan-900/20 active:scale-95 transition-all"
                >
                  Execute
                </button>
              ) : (
                <button
                  onClick={stopSimulation}
                  className="flex-1 px-4 h-12 rounded-xl bg-rose-600 text-white font-bold uppercase text-[10px] shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
                >
                  Stop
                </button>
              )}

              {/* Pause/Resume Logic */}
              {generatorRef.current && (
                <button
                  onClick={togglePause}
                  className={`px-4 h-12 rounded-xl border font-bold uppercase text-[9px] transition-all ${isPaused ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-950' : 'border-amber-500 text-amber-500 hover:bg-amber-950'}`}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Phase"
            value={isBenchmarking ? 'BENCHMARK' : isPaused ? 'IDLE' : 'ACTIVE'}
            highlight={!isPaused}
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

      {showQuickReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white italic mb-6 uppercase">
              Warp Speed Results (N={arraySize})
            </h2>
            <div className="space-y-3">
              {quickResults.map((res: any) => (
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
