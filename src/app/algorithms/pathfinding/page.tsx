'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import {
  PathfindingAlgoData,
  usePathfindingLogic,
} from '@/hooks/usePathfindingLogic';

// Components
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { NavHeader } from '@/components/NavHeader';
import { GridVisualizer } from '@/components/vizualizer/GridVisualizer';
import { StatCard } from '@/components/StatCard';
import { LogItem, TelemetryLog } from '@/components/TelemetryLog';
import { ExpandableSidebar } from '@/components/ExpandableSidebar';
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

export default function GridPage() {
  const [dimensions, setDimensions] = useState({ rows: 15, cols: 30 });
  const [grid, setGrid] = useState<PathfindingNode[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [nodesExplored, setNodesExplored] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false); // Track mobile state globally in component

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

  useEffect(() => {
    const width = window.innerWidth;
    const mobile = width < 768;
    setIsMobileView(mobile);
  }, []);

  const startTimer = () => {
    stopTimer();
    const startTime = Date.now() - executionTime;
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

  function algorithmHasHeuristic(algorithm: string) {
    return (
      pathfindingAlgorithmsWithHeuristic.find((i) => i === algorithm) !==
      undefined
    );
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
    if (
      (r === startPos.row && c === startPos.col) ||
      (r === endPos.row && c === endPos.col)
    )
      return;

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
    const startR = 1,
      startC = 1;
    newGrid[startR][startC].isWall = false;
    stack.push([startR, startC]);

    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      [
        [0, 2],
        [0, -2],
        [2, 0],
        [-2, 0],
      ].forEach(([dr, dc]) => {
        const nr = r + dr,
          nc = c + dc;
        if (
          nr > 0 &&
          nr < dimensions.rows - 1 &&
          nc > 0 &&
          nc < dimensions.cols - 1 &&
          newGrid[nr][nc].isWall
        ) {
          neighbors.push([nr, nc, r + dr / 2, c + dc / 2]);
        }
      });

      if (neighbors.length > 0) {
        const [nr, nc, mr, mc] =
          neighbors[Math.floor(Math.random() * neighbors.length)];
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

  const handleExecute = async (
    mode: PathfindingAlgorithmType = algorithm,
    autoRun = true,
  ) => {
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
      ? (
          algoData as PathfindingAlgoData<{
            heuristic: PathfindingHeuristicType;
          }>
        ).gen({
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
      const variants = algorithmHasHeuristic(algo)
        ? pathfindingHeuristics
        : [null];
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

        // 1. Get the full data object so we can narrow it
        const algoData = getAlgoData(algo);
        const { complexity } = algoData;

        // 2. Narrow and call using the single-object input pattern
        const it = hVariant
          ? (
              algoData as PathfindingAlgoData<{
                heuristic: PathfindingHeuristicType;
              }>
            ).gen({
              grid: workGrid,
              startNode,
              endNode,
              options: { heuristic: hVariant },
            })
          : (algoData as PathfindingAlgoData<PathfindingOptions>).gen({
              grid: workGrid,
              startNode,
              endNode,
              options: {}, // Provide empty options to satisfy the interface
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

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <ExpandableSidebar>
        <NavHeader title="Pathfinding Pulse" subtitle="Diagnostic Engine" />
        <section className="space-y-4 pb-20 lg:pb-0">
          <div className="space-y-4">
            <SelectionAlgorithm
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              algorithmOptions={pathfindingAlgorithms}
              hasGenerator={hasGenerator}
              isBenchmarking={isBenchmarking}
            />
            {algorithmHasHeuristic(algorithm) && (
              <div className="pt-2 border-t border-slate-800">
                <h2 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">
                  Heuristic
                </h2>
                <div className="flex gap-1">
                  {pathfindingHeuristics.map((h: PathfindingHeuristicType) => (
                    <button
                      key={h}
                      onClick={() => {
                        handleStopAll();
                        setHeuristic(h);
                      }}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${heuristic === h ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <CodeViewer data={getAlgoData(algorithm)} activeLine={activeLine} variables={variables} />
          </div>
          <TelemetryLog history={history} />
        </section>
      </ExpandableSidebar>

      <section className="flex-1 p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto">
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
            if (isMobileView) {
              setDimensions({
                rows: val | 1,
                cols: Math.floor(val / 2) | 1,
              });
            } else {
              setDimensions({
                rows: Math.floor(val / 2) | 1,
                cols: val | 1,
              });
            }
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
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
        </div>

        <div
          className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden relative cursor-crosshair touch-none min-h-112.5"
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
      </section>

      {showBenchmarkModal && (
        <BenchmarkModal
          data={benchmarkResults}
          onClose={() => setShowBenchmarkModal(false)}
          onReRun={() => runFullBenchmark(false)}
        />
      )}
    </main>
  );
}
