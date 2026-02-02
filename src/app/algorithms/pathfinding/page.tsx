'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import {
  usePathfindingLogic,
  AlgorithmType,
} from '@/hooks/usePathfindingLogic';

// Components
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { NavHeader } from '@/components/NavHeader';
import { GridVisualizer } from '@/components/GridVisualizer';
import { StatCard } from '@/components/StatCard';
import { TelemetryLog } from '@/components/TelemetryLog';
import { ExpandableSidebar } from '@/components/ExpandableSidebar';
import { BenchmarkModal } from '@/components/BenchmarkModal';
import { createNode, Node } from '@/algorithms/pathfindingAlgorithms';
import { useAudio } from '@/hooks/useAudio';

export default function GridPage() {
  const [dimensions, setDimensions] = useState({ rows: 15, cols: 30 });
  const [grid, setGrid] = useState<Node[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [nodesExplored, setNodesExplored] = useState(0);

  const activeGenRef = useRef<AsyncGenerator<any> | null>(null);
  const abortBenchmarkRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Destructure the resume function if you updated the hook,
  // otherwise we'll just use playTone
  const { playTone } = useAudio();

  const {
    algorithm,
    setAlgorithm,
    isBenchmarking,
    setIsBenchmarking,
    heuristic,
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
    speed,
    setSpeed,
    stopSimulation,
    togglePause,
    hasGenerator,
    startStepByStep,
    stepForward,
    stepBackward,
  } = useAlgorithm([]);

  const startPos = { row: Math.floor(dimensions.rows / 2), col: 5 };
  const endPos = {
    row: Math.floor(dimensions.rows / 2),
    col: dimensions.cols - 5,
  };

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

  const initGrid = useCallback(
    (rows: number, cols: number) => {
      stopSimulation();
      stopTimer();
      setExecutionTime(0);
      setNodesExplored(0);
      activeGenRef.current = null;
      setGrid(
        Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => createNode(r, c)),
        ),
      );
    },
    [stopSimulation],
  );

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

  const handleStopAll = () => {
    abortBenchmarkRef.current = true;
    stopSimulation();
    stopTimer();
    setIsBenchmarking(false);
    activeGenRef.current = null;
  };

  const handleExecute = async (
    mode: AlgorithmType = algorithm,
    autoRun = true,
  ) => {
    // TRIGGER: Initial tone to unlock AudioContext via User Gesture
    playTone(0);

    if (activeGenRef.current && autoRun && isPaused) {
      startTimer();
      await runSimulation(activeGenRef.current);
      stopTimer();
      return;
    }

    handleStopAll();
    const startTime = performance.now();
    startTimer();

    const { gen } = getAlgoData(mode);
    const workGrid = getPreparedGrid();
    const startNode = workGrid[startPos.row][startPos.col];
    const endNode = workGrid[endPos.row][endPos.col];

    const algorithmInstance =
      mode === 'A*' || mode === 'Greedy'
        ? gen(workGrid, startNode, endNode, heuristic)
        : gen(workGrid, startNode, endNode);

    const wrappedGen = (async function* () {
      let count = 0;
      let pathLen = 0;
      for await (const step of algorithmInstance) {
        if ('grid' in step) {
          setGrid(step.grid);
          const flat = step.grid.flat();
          count = flat.filter((n) => n.isVisited).length;
          pathLen = flat.filter((n) => n.isPath).length;

          setNodesExplored(count);

          // PLAY TONE HERE: inside the generator for real-time frequency updates
          playTone(count % 1000);
        }
        yield step;
      }
      stopTimer();

      // Optional: Success sound
      if (pathLen > 0) playTone(150, 0.2);

      setHistory((prev): any =>
        [
          {
            id: Date.now(),
            algorithm: mode,
            size: count,
            pathLength: pathLen,
            time: Math.round(performance.now() - startTime),
            success: pathLen > 0,
          },
          ...prev,
        ].slice(0, 10),
      );
      activeGenRef.current = null;
    })();

    activeGenRef.current = wrappedGen;
    if (autoRun) await runSimulation(wrappedGen);
    else startStepByStep(wrappedGen);
  };

  const runFullBenchmark = async (isVisual: boolean) => {
    // Unlock audio for visual benchmark
    if (isVisual) playTone(0);

    setIsBenchmarking(true);
    setShowBenchmarkModal(false);
    abortBenchmarkRef.current = false;
    stopSimulation();
    setExecutionTime(0);

    const algos: AlgorithmType[] = ['Dijkstra', 'A*', 'Greedy', 'BFS', 'DFS'];
    const results: any[] = [];
    const originalSpeed = speed;

    for (const algo of algos) {
      if (abortBenchmarkRef.current) break;
      setAlgorithm(algo);
      setNodesExplored(0);
      setExecutionTime(0);
      startTimer();

      const workGrid = getPreparedGrid();
      const startNode = workGrid[startPos.row][startPos.col];
      const endNode = workGrid[endPos.row][endPos.col];
      const { gen, complexity } = getAlgoData(algo);

      let wasSuccessful = false;
      let count = 0;
      let pathLen = 0;
      const startTime = performance.now();

      const it =
        algo === 'A*' || algo === 'Greedy'
          ? gen(workGrid, startNode, endNode, heuristic)
          : gen(workGrid, startNode, endNode);

      if (isVisual) {
        setSpeed(0);
        for await (const step of it) {
          if (abortBenchmarkRef.current) break;
          if (step.grid) {
            setGrid(step.grid);
            const flat = step.grid.flat();
            count = flat.filter((n: any) => n.isVisited).length;
            pathLen = flat.filter((n: any) => n.isPath).length;
            setNodesExplored(count);
            if (pathLen > 0) wasSuccessful = true;

            // Audio for visual benchmark
            playTone(count % 1000);
          }
          await new Promise((r) => setTimeout(r, 1));
        }
      } else {
        let res = await it.next();
        while (!res.done && !abortBenchmarkRef.current) {
          if (res.value?.grid) {
            const flat = res.value.grid.flat();
            count = flat.filter((n: any) => n.isVisited).length;
            pathLen = flat.filter((n: any) => n.isPath).length;
            setNodesExplored(count);
            if (pathLen > 0) wasSuccessful = true;
          }
          res = await it.next();
        }
      }

      stopTimer();
      if (!abortBenchmarkRef.current) {
        results.push({
          name: algo,
          time: Math.round(performance.now() - startTime),
          complexity,
          success: wasSuccessful,
          size: count,
          pathLength: pathLen,
        });
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!abortBenchmarkRef.current) {
      setBenchmarkResults(results);
      setHistory((prev) =>
        [
          ...results.map((r) => ({
            id: Date.now() + Math.random(),
            algorithm: r.name,
            size: r.size,
            pathLength: r.pathLength,
            time: r.time,
            success: r.success,
          })),
          ...prev,
        ].slice(0, 10),
      );
      setShowBenchmarkModal(true);
    }

    setSpeed(originalSpeed);
    setIsBenchmarking(false);
  };

  const handleNodeInteraction = (r: number, c: number) => {
    // This function was missing in your snippet but referenced
    // Logic for drawing walls/start/end would go here
  };

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <ExpandableSidebar>
        <NavHeader title="Pathfinding Pulse" subtitle="Diagnostic Engine" />
        <section className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              Select Algorithm
            </h2>
            <div className="flex gap-1">
              {(
                ['Dijkstra', 'A*', 'Greedy', 'BFS', 'DFS'] as AlgorithmType[]
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    handleStopAll();
                    setAlgorithm(type);
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${algorithm === type ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
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
          <TelemetryLog history={history} />
        </section>
      </ExpandableSidebar>

      <section className="flex-1 p-6 flex flex-col gap-6">
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
          onSizeChange={(val) =>
            setDimensions({ rows: Math.floor(val / 2), cols: val })
          }
          onExecute={() => handleExecute(algorithm, true)}
          onStop={handleStopAll}
          onTogglePause={() => {
            if (isPaused && activeGenRef.current) {
              // Unlock audio on resume
              playTone(0);
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
          onGenerateMaze={() => {}}
          isBenchmarking={isBenchmarking}
          onGeneratePattern={() => {}}
          onManualUpdate={() => {}}
          onQuickBenchmark={() => runFullBenchmark(false)}
          onVisualRun={() => runFullBenchmark(true)}
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
            label="Explored"
            value={nodesExplored}
            highlight={nodesExplored > 0}
          />
          <StatCard
            label="Grid Units"
            value={dimensions.rows * dimensions.cols}
          />
          <StatCard label="Cycle Speed" value={`${speed}ms`} />
        </div>

        <div
          className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden relative"
          onMouseDown={() => setIsMousePressed(true)}
          onMouseUp={() => setIsMousePressed(false)}
        >
          <GridVisualizer
            grid={grid}
            dimensions={dimensions}
            startPos={startPos}
            endPos={endPos}
            onNodeMouseDown={(r, c) => isPaused && handleNodeInteraction(r, c)}
            onNodeMouseEnter={(r, c) =>
              isMousePressed && isPaused && handleNodeInteraction(r, c)
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
