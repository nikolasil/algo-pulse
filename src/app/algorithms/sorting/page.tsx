'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sortingAlgorithms } from '@/hooks/algorithms/sortingAlgorithms';
import { RawBenchmarkData, BenchmarkModal } from '@/components/BenchmarkModal';
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { NavHeader } from '@/components/NavHeader';
import { SelectionAlgorithm } from '@/components/SelectionAlgorithm';
import { StatCard, StatDashboard } from '@/components/StatCard';
import { TelemetryLog } from '@/components/TelemetryLog';
import { BarVisualizerContainer } from '@/components/vizualizer/BarVizualizer';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { useSortingLogic } from '@/hooks/useSortingLogic';
import { Menu, X, BarChart2, Code, Activity, Zap } from 'lucide-react';

type MobileTab = 'controls' | 'code' | 'stats' | 'history';

export default function SortingPage() {
  const [arraySize, setArraySize] = useState(30);
  const [executionTime, setExecutionTime] = useState(0);
  const [activeTab, setActiveTab] = useState<MobileTab>('controls');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    variables,
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
        await runSimulation(gen({ array: [...originalArray] }), (val) => playTone(val));
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <NavHeader title="Sort Pulse" subtitle="Diagnostic Engine" />
      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        <SelectionAlgorithm
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          algorithmOptions={sortingAlgorithms}
          hasGenerator={hasGenerator}
          isBenchmarking={isBenchmarking}
        />
        <div className="hidden lg:block">
          <CodeViewer
            data={getAlgoData(algorithm)}
            activeLine={activeLine}
            variables={variables}
          />
        </div>
        <div className="hidden lg:block">
          <TelemetryLog history={history} />
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center gap-1 p-2 bg-surface-900 border-b border-surface-800 overflow-x-auto">
        {[
          { id: 'controls', icon: Zap, label: 'Controls' },
          { id: 'code', icon: Code, label: 'Code' },
          { id: 'stats', icon: Activity, label: 'Stats' },
          { id: 'history', icon: BarChart2, label: 'History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MobileTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden xs:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Tab Content */}
      <div className="flex-1 overflow-y-auto lg:overflow-visible">
        <AnimatePresence mode="wait">
          {activeTab === 'controls' && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4 lg:p-0 lg:space-y-0"
            >
              <ControlPanel
                size={arraySize}
                maxSize={100}
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
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 lg:hidden"
            >
              <CodeViewer
                data={getAlgoData(algorithm)}
                activeLine={activeLine}
                variables={variables}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
              <StatDashboard className="mb-4">
                <StatCard label="Algorithm" value={algorithm} highlight={true} />
                <StatCard
                  label="Phase"
                  value={
                    isBenchmarking
                      ? 'BENCHMARK'
                      : hasGenerator
                        ? isPaused
                          ? 'PAUSED'
                          : 'RUNNING'
                        : 'IDLE'
                  }
                  highlight={hasGenerator && !isPaused}
                />
                <StatCard label="Time" value={(executionTime / 1000).toFixed(2) + 's'} />
                <StatCard label="Elements" value={array.length} />
              </StatDashboard>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 lg:hidden"
            >
              <TelemetryLog history={history} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visualization - Always visible on desktop, scrollable on mobile */}
        <div className="flex-1 p-4 lg:p-6 lg:mt-auto">
          <BarVisualizerContainer
            data={array}
            comparing={comparing}
            className="min-h-[200px] lg:min-h-[300px]"
          />
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden lg:block p-4 border-t border-surface-800">
        <StatDashboard>
          <StatCard label="Algorithm" value={algorithm} highlight={true} />
          <StatCard
            label="Phase"
            value={
              isBenchmarking
                ? 'BENCHMARK'
                : hasGenerator
                  ? isPaused
                    ? 'PAUSED'
                    : 'RUNNING'
                  : 'IDLE'
            }
            highlight={hasGenerator && !isPaused}
          />
          <StatCard label="Time" value={(executionTime / 1000).toFixed(2) + 's'} />
          <StatCard
            label="Complexity"
            value={getAlgoData(algorithm).complexity.average}
          />
          <StatCard label="Elements" value={array.length} />
          <StatCard label="Speed" value={`${speed}ms`} />
        </StatDashboard>
      </div>
    </div>
  );

  return (
    <LayoutWrapper
      title="Sort Pulse"
      subtitle="Diagnostic Engine"
      sidebar={sidebarContent}
      main={mainContent}
    >
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
    </LayoutWrapper>
  );
}
