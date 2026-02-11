'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import {
  PathfindingAlgoData,
  usePathfindingLogic,
} from '@/hooks/usePathfindingLogic';
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { NavHeader } from '@/components/NavHeader';
import { GridVisualizer } from '@/components/vizualizer/GridVisualizer';
import { StatCard, StatDashboard } from '@/components/StatCard';
import { LogItem, TelemetryLog } from '@/components/TelemetryLog';
import { BenchmarkModal, RawBenchmarkData } from '@/components/BenchmarkModal';
import {
  createPathfindingNode,
  PathfindingNode,
  PathfindingAlgorithmType,
  PathfindingHeuristicType,
  PathfindingOptions,
  pathfindingAlgorithms,
  pathfindingHeuristics,
  pathfindingAlgorithmsWithHeuristic,
} from '@/hooks/algorithms/pathfindingAlgorithms';
import { AllStepTypes } from '@/hooks/algorithms/general';
import { SelectionAlgorithm } from '@/components/SelectionAlgorithm';
import { Menu, X, Zap, BarChart2, Code, Activity } from 'lucide-react';

type MobileTab = 'controls' | 'code' | 'stats' | 'history';

export default function GridPage() {
  const [dimensions, setDimensions] = useState({ rows: 12, cols: 20 });
  const [grid, setGrid] = useState<PathfindingNode[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [nodesExplored, setNodesExplored] = useState(0);
  const [activeTab, setActiveTab] = useState<MobileTab>('controls');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const activeGenRef = useRef<AsyncGenerator<AllStepTypes> | null>(null);
  const abortBenchmarkRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    algorithm,
    setAlgorithm,
    isBenchmarking,
    setIsBenchmarking,
    heuristic,
    setHeuristic,
    brush,
    setBrush,
    history,
    setHistory,
    getAlgoData,
    setBenchmarkResults,
    benchmarkResults,
  } = usePathfindingLogic();

  const {
    runSimulation,
    isPaused,
    activeLine,
    variables,
    speed,
    setSpeed,
    stopSimulation,
    togglePause,
    hasGenerator,
    startStepByStep,
    stepForward,
    stepBackward,
  } = useAlgorithm([]);

  const startPos = { row: 1, col: 1 };
  const endPos = {
    row: dimensions.rows - 2,
    col: dimensions.cols - 2,
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    const startTime = Date.now() - executionTime;
    timerIntervalRef.current = setInterval(
      () => setExecutionTime(Date.now() - startTime),
      10,
    );
  };

  const handleStopAll = useCallback(() => {
    abortBenchmarkRef.current = true;
    stopSimulation();
    stopTimer();
    setIsBenchmarking(false);
    activeGenRef.current = null;
  }, [setIsBenchmarking, stopSimulation]);

  const initGrid = useCallback(
    (rows: number, cols: number) => {
      handleStopAll();
      setExecutionTime(0);
      setNodesExplored(0);
      setGrid(
        Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => createPathfindingNode(r, c)),
        ),
      );
    },
    [handleStopAll],
  );

  function algorithmHasHeuristic(algo: string) {
    return pathfindingAlgorithmsWithHeuristic.includes(algo as typeof pathfindingAlgorithmsWithHeuristic[number]);
  }

  useEffect(() => {
    initGrid(dimensions.rows, dimensions.cols);
  }, [initGrid, dimensions]);

  const getPreparedGrid = useCallback(() => {
    return grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      })),
    );
  }, [grid]);

  const handleNodeInteraction = (r: number, c: number) => {
    if (!isPaused || isBenchmarking) return;
    if (r === startPos.row && c === startPos.col) return;
    if (r === endPos.row && c === endPos.col) return;

    const newGrid = [...grid];
    const node = newGrid[r][c];

    if (brush === 'Wall') {
      node.isWall = !node.isWall;
      node.isMud = false;
    } else if (brush === 'Mud') {
      node.isMud = !node.isMud;
      node.isWall = false;
    } else {
      node.isWall = false;
      node.isMud = false;
    }
    setGrid(newGrid);
  };

  const handleGenerateMaze = () => {
    handleStopAll();
    const newGrid = Array.from({ length: dimensions.rows }, (_, r) =>
      Array.from({ length: dimensions.cols }, (_, c) => {
        const node = createPathfindingNode(r, c);
        node.isWall = true;
        return node;
      }),
    );

    const stack: [number, number][] = [];
    const startR = 1, startC = 1;
    newGrid[startR][startC].isWall = false;
    stack.push([startR, startC]);

    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      [[0, 2], [0, -2], [2, 0], [-2, 0]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < dimensions.rows - 1 && nc > 0 && nc < dimensions.cols - 1 && newGrid[nr][nc].isWall) {
          neighbors.push([nr, nc, r + dr / 2, c + dc / 2]);
        }
      });

      if (neighbors.length > 0) {
        const [nr, nc, mr, mc] = neighbors[Math.floor(Math.random() * neighbors.length)];
        newGrid[nr][nc].isWall = false;
        newGrid[mr][mc].isWall = false;
        stack.push([nr, nc]);
      } else {
        stack.pop();
      }
    }

    newGrid[startPos.row][startPos.col].isWall = false;
    newGrid[endPos.row][endPos.col].isWall = false;
    setGrid(newGrid);
  };

  const handleExecute = async (mode: PathfindingAlgorithmType = algorithm, autoRun = true) => {
    if (activeGenRef.current && autoRun && isPaused) {
      startTimer();
      await runSimulation(activeGenRef.current);
      stopTimer();
      return;
    }

    handleStopAll();
    const startTime = performance.now();
    startTimer();

    const algoData = getAlgoData(mode);
    const workGrid = getPreparedGrid();
    const startNode = workGrid[startPos.row][startPos.col];
    const endNode = workGrid[endPos.row][endPos.col];

    const algorithmInstance = algorithmHasHeuristic(algorithm)
      ? (algoData as PathfindingAlgoData<{ heuristic: PathfindingHeuristicType }>).gen({
          grid: workGrid,
          startNode,
          endNode,
          options: { heuristic },
        })
      : (algoData as PathfindingAlgoData<PathfindingOptions>).gen({
          grid: workGrid,
          startNode,
          endNode,
          options: {},
        });

    const wrappedGen = (async function* () {
      let count = 0;
      let pathLen = 0;
      for await (const step of algorithmInstance) {
        if ('grid' in step && step.grid) {
          setGrid(step.grid);
          const flat = step.grid.flat();
          count = flat.filter((n: PathfindingNode) => n.isVisited).length;
          pathLen = flat.filter((n: PathfindingNode) => n.isPath).length;
          setNodesExplored(count);
        }
        yield step;
      }
      stopTimer();

      setHistory((prev: LogItem[]) => [
        {
          id: Date.now(),
          algorithm: mode,
          size: count,
          pathLength: pathLen,
          time: Math.round(performance.now() - startTime),
          success: pathLen > 0,
        },
        ...prev,
      ]);
      activeGenRef.current = null;
    })();

    activeGenRef.current = wrappedGen;
    if (autoRun) await runSimulation(wrappedGen);
    else startStepByStep(wrappedGen);
  };

  const runFullBenchmark = async (isVisual: boolean) => {
    setIsBenchmarking(true);
    setShowBenchmarkModal(false);
    abortBenchmarkRef.current = false;
    stopSimulation();

    const results: RawBenchmarkData[] = [];
    const originalSpeed = speed;

    for (const algo of pathfindingAlgorithms) {
      if (abortBenchmarkRef.current) break;
      const variants = algorithmHasHeuristic(algo) ? pathfindingHeuristics : [null];
      for (const hVariant of variants) {
        if (abortBenchmarkRef.current) break;
        setAlgorithm(algo);
        if (hVariant) setHeuristic(hVariant);
        setNodesExplored(0);
        setExecutionTime(0);
        startTimer();

        const workGrid = getPreparedGrid();
        const startNode = workGrid[startPos.row][startPos.col];
        const endNode = workGrid[endPos.row][endPos.col];
        const algoData = getAlgoData(algo);
        const { complexity } = algoData;

        const it = hVariant
          ? (algoData as PathfindingAlgoData<{ heuristic: PathfindingHeuristicType }>).gen({
              grid: workGrid,
              startNode,
              endNode,
              options: { heuristic: hVariant },
            })
          : (algoData as PathfindingAlgoData<PathfindingOptions>).gen({
              grid: workGrid,
              startNode,
              endNode,
              options: {},
            });

        let wasSuccessful = false;
        let count = 0;
        let pathLen = 0;
        const startTime = performance.now();

        if (isVisual) {
          setSpeed(0);
          for await (const step of it) {
            if (abortBenchmarkRef.current) break;
            if ('grid' in step && step.grid) {
              setGrid(step.grid);
              const flat = step.grid.flat();
              count = flat.filter((n: PathfindingNode) => n.isVisited).length;
              pathLen = flat.filter((n: PathfindingNode) => n.isPath).length;
              setNodesExplored(count);
              if (pathLen > 0) wasSuccessful = true;
            }
            await new Promise((r) => setTimeout(r, 1));
          }
        } else {
          let res = await it.next();
          while (!res.done && !abortBenchmarkRef.current) {
            const val = res.value;
            if (val && 'grid' in val && val.grid) {
              const flat = val.grid.flat();
              count = flat.filter((n: PathfindingNode) => n.isVisited).length;
              pathLen = flat.filter((n: PathfindingNode) => n.isPath).length;
              if (pathLen > 0) wasSuccessful = true;
            }
            res = await it.next();
          }
        }

        stopTimer();
        if (!abortBenchmarkRef.current) {
          results.push({
            name: hVariant ? `${algo} (${hVariant})` : algo,
            time: Math.round(performance.now() - startTime),
            complexity: complexity.average,
            success: wasSuccessful,
            size: count,
            pathLength: pathLen,
          });
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (!abortBenchmarkRef.current) {
      setBenchmarkResults(results);
      setShowBenchmarkModal(true);
    }
    setSpeed(originalSpeed);
    setIsBenchmarking(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <NavHeader title="Pathfinding Pulse" subtitle="Diagnostic Engine" />
      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        <SelectionAlgorithm
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          algorithmOptions={pathfindingAlgorithms}
          hasGenerator={hasGenerator}
          isBenchmarking={isBenchmarking}
        />
        {algorithmHasHeuristic(algorithm) && (
          <div className="pt-2 border-t border-surface-800">
            <h2 className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">
              Heuristic
            </h2>
            <div className="flex flex-wrap gap-1">
              {pathfindingHeuristics.map((h: PathfindingHeuristicType) => (
                <button
                  key={h}
                  onClick={() => {
                    handleStopAll();
                    setHeuristic(h);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    heuristic === h
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
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
              className="p-4 lg:p-0 lg:space-y-0"
            >
              <ControlPanel
                size={dimensions.cols}
                sizeShower={true}
                speed={speed}
                isPaused={isPaused}
                hasGenerator={hasGenerator}
                viewMode="Grid"
                brush={brush}
                onBrushChange={setBrush}
                onSpeedChange={setSpeed}
                onSizeChange={(val) => {
                  setDimensions({
                    rows: Math.floor(val / 2) | 1,
                    cols: val | 1,
                  });
                }}
                onExecute={() => handleExecute(algorithm, true)}
                onStop={handleStopAll}
                onTogglePause={() => {
                  if (isPaused && activeGenRef.current) {
                    startTimer();
                    runSimulation(activeGenRef.current);
                  } else {
                    togglePause();
                    stopTimer();
                  }
                }}
                onShuffle={() => initGrid(dimensions.rows, dimensions.cols)}
                onStepBack={stepBackward}
                onStepForward={stepForward}
                onStartStepByStep={() => handleExecute(algorithm, false)}
                onGenerate={() => initGrid(dimensions.rows, dimensions.cols)}
                onGenerateMaze={handleGenerateMaze}
                isBenchmarking={isBenchmarking}
                onGeneratePattern={() => {}}
                onManualUpdate={() => {}}
                onQuickBenchmark={() => runFullBenchmark(false)}
                onVisualRun={() => runFullBenchmark(true)}
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
                  label="Heuristic"
                  value={algorithmHasHeuristic(algorithm) ? heuristic : 'N/A'}
                />
                <StatCard label="Time" value={(executionTime / 1000).toFixed(2) + 's'} />
                <StatCard label="Explored" value={nodesExplored} />
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
          <div
            className="bg-surface-950 border border-surface-800 rounded-xl flex items-center justify-center overflow-hidden relative cursor-crosshair touch-none"
            onMouseDown={() => setIsMousePressed(true)}
            onMouseUp={() => setIsMousePressed(false)}
            onMouseLeave={() => setIsMousePressed(false)}
            onTouchStart={() => setIsMousePressed(true)}
            onTouchEnd={() => setIsMousePressed(false)}
          >
            <GridVisualizer
              grid={grid}
              dimensions={dimensions}
              startPos={startPos}
              endPos={endPos}
              onNodeMouseDown={handleNodeInteraction}
              onNodeMouseEnter={(r, c) =>
                isMousePressed && handleNodeInteraction(r, c)
              }
              isMousePressed={isMousePressed}
            />
          </div>
        </div>
      </div>

      {/* Desktop Stats */}
      <div className="hidden lg:block p-4 border-t border-surface-800">
        <StatDashboard>
          <StatCard label="Algorithm" value={algorithm} highlight={true} />
          <StatCard
            label="Heuristic"
            value={algorithmHasHeuristic(algorithm) ? heuristic : 'N/A'}
          />
          <StatCard
            label="Time"
            value={(executionTime / 1000).toFixed(2) + 's'}
            highlight={!!timerIntervalRef.current}
          />
          <StatCard
            label="Explored"
            value={nodesExplored}
            highlight={nodesExplored > 0}
          />
          <StatCard label="Units" value={dimensions.rows * dimensions.cols} />
          <StatCard label="Speed" value={`${speed}ms`} />
        </StatDashboard>
      </div>
    </div>
  );

  return (
    <LayoutWrapper
      title="Pathfinding Pulse"
      subtitle="Diagnostic Engine"
      sidebar={sidebarContent}
      main={mainContent}
    >
      {showBenchmarkModal && (
        <BenchmarkModal
          data={benchmarkResults}
          onClose={() => setShowBenchmarkModal(false)}
          onReRun={() => runFullBenchmark(false)}
        />
      )}
    </LayoutWrapper>
  );
}
