'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { useAudio } from '@/hooks/useAudio';
import { ControlPanel } from '@/components/ControlPanel';
import { CodeViewer } from '@/components/CodeViewer';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { NavHeader } from '@/components/NavHeader';
import { StatCard, StatDashboard } from '@/components/StatCard';
import { TelemetryLog } from '@/components/TelemetryLog';
import { BarVisualizerContainer } from '@/components/vizualizer/BarVizualizer';
import { BenchmarkModal, RawBenchmarkData } from '@/components/BenchmarkModal';
import { useSearchingLogic } from '@/hooks/useSearchingLogic';
import { searchAlgorithms } from '@/hooks/algorithms/searchingAlgorithms';
import { SelectionAlgorithm } from '@/components/SelectionAlgorithm';
import { Zap, Code, Activity, BarChart2 } from 'lucide-react';

type MobileTab = 'controls' | 'code' | 'stats' | 'history';

export default function SearchingPage() {
  const [arraySize, setArraySize] = useState(30);
  const [target, setTarget] = useState<number>(0);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [searchRange, setSearchRange] = useState<[number, number] | null>(null);
  const [activeTab, setActiveTab] = useState<MobileTab>('controls');
  const abortBenchmarkRef = useRef(false);
  const hasInitialized = useRef(false);
  const hasInitializedTarget = useRef(false);

  const { playTone } = useAudio();

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
    history,
    setHistory,
    benchmarkData,
    setBenchmarkData,
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
      console.error('Invalid array format', e);
    }
  };

  const createWrappedGenerator = useCallback(
    (onFound: (idx: number) => void) => {
      const { gen } = getAlgoData(algorithm);
      return async function* () {
        for await (const step of gen({ array: array, target: target })) {
          if (step.found !== undefined && step.found !== -1) {
            setFoundIndex(step.found);
            onFound(step.found);
          }
          if (step.range) setSearchRange(step.range);
          yield step;
        }
      };
    },
    [algorithm, array, target, getAlgoData],
  );

  const handleExecute = async () => {
    setFoundIndex(null);
    setSearchRange(null);
    let wasSuccessful = false;
    const startTime = performance.now();

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
    abortBenchmarkRef.current = false;
    stopSimulation();
    const results: RawBenchmarkData[] = [];
    const originalSpeed = speed;

    for (const algo of searchAlgorithms) {
      if (abortBenchmarkRef.current) break;
      setAlgorithm(algo);
      setFoundIndex(null);
      setSearchRange(null);

      let wasSuccessful = false;
      const { gen } = getAlgoData(algo);
      const startTime = performance.now();

      if (isVisual) {
        setSpeed(0);
        const wrapped = async function* () {
          for await (const step of gen({ array: array, target: target })) {
            if (step.found !== undefined && step.found !== -1)
              wasSuccessful = true;
            if (step.range) setSearchRange(step.range);
            yield step;
          }
        };
        await runSimulation(wrapped(), (val) => playTone(val));
      } else {
        const it = gen({ array: array, target: target });
        let res = await it.next();
        while (!res.done && !abortBenchmarkRef.current) {
          if (res.value?.found !== undefined && res.value.found !== -1)
            wasSuccessful = true;
          res = await it.next();
        }
      }

      if (!abortBenchmarkRef.current) {
        const duration = Math.round(performance.now() - startTime);
        results.push({
          name: algo,
          time: duration,
          complexity: getAlgoData(algo).complexity.average,
          success: wasSuccessful,
          size: array.length,
        });
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!abortBenchmarkRef.current) {
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <NavHeader title="Search Pulse" subtitle="Diagnostic Engine" />
      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        <SelectionAlgorithm
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          algorithmOptions={searchAlgorithms}
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
              className="p-4 lg:p-0"
            >
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
                  startStepByStep(gen({ array: [...array], target: target }));
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
                <StatCard
                  label="Phase"
                  value={
                    isBenchmarking
                      ? 'BENCHMARK'
                      : hasGenerator && !isPaused
                        ? 'SCANNING'
                        : 'IDLE'
                  }
                  highlight={hasGenerator && !isPaused}
                />
                <StatCard
                  label="Result"
                  value={
                    foundIndex !== null
                      ? `FOUND: ${foundIndex}`
                      : hasGenerator && !isPaused
                        ? 'SEARCHING...'
                        : 'NOT FOUND'
                  }
                  highlight={foundIndex !== null}
                />
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

        {/* Visualization */}
        <div className="flex-1 p-4 lg:p-6 lg:mt-auto">
          <BarVisualizerContainer
            data={array}
            comparing={comparing}
            found={foundIndex !== null ? [foundIndex] : []}
            className="min-h-[200px] lg:min-h-[300px]"
          />
        </div>
      </div>

      {/* Desktop Stats */}
      <div className="hidden lg:block p-4 border-t border-surface-800">
        <StatDashboard>
          <StatCard
            label="Phase"
            value={
              isBenchmarking
                ? 'BENCHMARK'
                : hasGenerator && !isPaused
                  ? 'SCANNING'
                  : 'IDLE'
            }
            highlight={hasGenerator && !isPaused}
          />
          <StatCard
            label="Result"
            value={
              foundIndex !== null
                ? `FOUND: ${foundIndex}`
                : hasGenerator && !isPaused
                  ? 'SEARCHING...'
                  : 'NOT FOUND'
            }
            highlight={foundIndex !== null}
          />
          <StatCard label="Complexity" value={getAlgoData(algorithm).complexity.average} />
          <StatCard label="Elements" value={array.length} />
        </StatDashboard>
      </div>
    </div>
  );

  return (
    <LayoutWrapper
      title="Search Pulse"
      subtitle="Diagnostic Engine"
      sidebar={sidebarContent}
      main={mainContent}
    >
      {benchmarkData && benchmarkData.length > 0 && (
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
