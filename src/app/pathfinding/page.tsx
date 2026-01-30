'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import {
  Node,
  createNode,
  dijkstra,
  aStar,
  greedyBestFirst,
  dijkstraCode,
  aStarCode,
  greedyCode,
  HeuristicType,
} from '@/algorithms/pathfindingAlgorithms';
import { NavHeader } from '@/components/NavHeader';

interface HistoryItem {
  id: number;
  timestamp: string;
  nodesExplored: number;
  pathLength: number;
  pathCost: number;
  status: 'Found' | 'No Path';
  algorithm: string;
}

interface BenchmarkResult {
  name: string;
  time: string;
  explored: number;
  cost: number | string;
  found: boolean;
}

type AlgoMode = 'Dijkstra' | 'A*' | 'Greedy';
type BrushType = 'Wall' | 'Mud';

export default function PathfindingPage() {
  // --- States ---
  const [dimensions, setDimensions] = useState({ rows: 15, cols: 30 });
  const [grid, setGrid] = useState<Node[][]>([]);
  const [algoType, setAlgoType] = useState<AlgoMode>('Dijkstra');
  const [heuristic, setHeuristic] = useState<HeuristicType>('Manhattan');
  const [brush, setBrush] = useState<BrushType>('Wall');
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [showBenchmark, setShowBenchmark] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>(
    [],
  );
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentStats, setCurrentStats] = useState({
    explored: 0,
    path: 0,
    cost: 0,
  });

  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [startPos, setStartPos] = useState({ row: 2, col: 2 });
  const [endPos, setEndPos] = useState({ row: 10, col: 25 });

  const { runSimulation, isPaused, activeLine, speed, setSpeed } = useAlgorithm(
    [],
  );

  // --- Initialization ---
  const initGrid = useCallback((rows: number, cols: number) => {
    const newGrid: Node[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => createNode(r, c)),
    );

    const sRow = Math.floor(rows / 2);
    const sCol = Math.floor(cols / 4);
    const eRow = Math.floor(rows / 2);
    const eCol = Math.floor((cols / 4) * 3);

    setStartPos({ row: sRow, col: sCol });
    setEndPos({ row: eRow, col: eCol });
    setGrid(newGrid);
    setCurrentStats({ explored: 0, path: 0, cost: 0 });
  }, []);

  useEffect(() => {
    setIsClient(true);
    initGrid(dimensions.rows, dimensions.cols);
    setSpeed(10);
  }, [initGrid, setSpeed]);

  const handleSizeChange = (newCols: number) => {
    const newRows = Math.floor(newCols / 2);
    setDimensions({ rows: newRows, cols: newCols });
    initGrid(newRows, newCols);
  };

  const clearPath = () => {
    if (!isPaused) return;
    setGrid((prev) =>
      prev.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousNode: null,
        })),
      ),
    );
    setCurrentStats({ explored: 0, path: 0, cost: 0 });
  };

  const clearWalls = () => {
    if (!isPaused) return;
    setGrid((prev) =>
      prev.map((row) =>
        row.map((node) => ({
          ...node,
          isWall: false,
          isMud: false,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previousNode: null,
        })),
      ),
    );
    setCurrentStats({ explored: 0, path: 0, cost: 0 });
  };

  const generateMaze = () => {
    if (!isPaused) return;
    const rows = dimensions.rows;
    const cols = dimensions.cols;
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isWall: true,
        isMud: false,
        isVisited: false,
        isPath: false,
      })),
    );
    const stack: [number, number][] = [[0, 0]];
    newGrid[0][0].isWall = false;
    const visited = new Set(['0-0']);

    while (stack.length > 0) {
      const [currR, currC] = stack[stack.length - 1];
      const neighbors = [
        [currR - 2, currC],
        [currR + 2, currC],
        [currR, currC - 2],
        [currR, currC + 2],
      ].filter(
        ([nr, nc]) =>
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          !visited.has(`${nr}-${nc}`),
      );

      if (neighbors.length > 0) {
        const [nextR, nextC] =
          neighbors[Math.floor(Math.random() * neighbors.length)];
        newGrid[nextR][nextC].isWall = false;
        newGrid[(currR + nextR) / 2][(currC + nextC) / 2].isWall = false;
        visited.add(`${nextR}-${nextC}`);
        stack.push([nextR, nextC]);
      } else {
        stack.pop();
      }
    }
    newGrid[startPos.row][startPos.col].isWall = false;
    newGrid[endPos.row][endPos.col].isWall = false;
    setGrid(newGrid);
  };

  const handleNodeAction = (row: number, col: number) => {
    if (!isPaused) return;
    if (isDraggingStart) {
      if (row === endPos.row && col === endPos.col) return;
      setStartPos({ row, col });
      return;
    }
    if (isDraggingEnd) {
      if (row === startPos.row && col === startPos.col) return;
      setEndPos({ row, col });
      return;
    }
    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      const target = newGrid[row][col];
      if (brush === 'Wall')
        newGrid[row][col] = { ...target, isWall: !target.isWall, isMud: false };
      else
        newGrid[row][col] = { ...target, isMud: !target.isMud, isWall: false };
      return newGrid;
    });
  };

  const handleMouseDown = (row: number, col: number) => {
    if (!isPaused) return;
    setIsMousePressed(true);
    if (row === startPos.row && col === startPos.col) setIsDraggingStart(true);
    else if (row === endPos.row && col === endPos.col) setIsDraggingEnd(true);
    else handleNodeAction(row, col);
  };

  const addHistoryItem = (
    algoName: string,
    explored: number,
    pathLen: number,
    pathCost: number,
  ) => {
    setHistory((prev) =>
      [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          algorithm: algoName,
          nodesExplored: explored,
          pathLength: pathLen,
          pathCost: pathCost,
          status: (pathLen > 0 ? 'Found' : 'No Path') as 'Found' | 'No Path',
        },
        ...prev,
      ].slice(0, 10),
    );
  };

  const handleExecute = async (mode: AlgoMode = algoType, isSilent = false) => {
    const workGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      })),
    );
    const startNode = workGrid[startPos.row][startPos.col];
    const endNode = workGrid[endPos.row][endPos.col];

    let generator: AsyncGenerator<
      { grid: Node[][]; line: number } | { line: number },
      void,
      unknown
    >;
    if (mode === 'A*')
      generator = aStar(workGrid, startNode, endNode, heuristic);
    else if (mode === 'Greedy')
      generator = greedyBestFirst(workGrid, startNode, endNode, heuristic);
    else generator = dijkstra(workGrid, startNode, endNode);

    if (isSilent) {
      const startTime = performance.now();
      let lastStep;
      for await (const step of generator) {
        lastStep = step;
      }
      const endTime = performance.now();
      return { lastStep, time: (endTime - startTime).toFixed(2) };
    }

    async function* gridWrapper() {
      for await (const step of generator) {
        if ('grid' in step && step.grid) {
          setGrid(step.grid);
          const flat = step.grid.flat();
          const pNodes = flat.filter((n) => n.isPath);
          const exp = flat.filter((n) => n.isVisited).length;
          const cost = pNodes.reduce(
            (acc, curr) => acc + (curr.isMud ? 5 : 1),
            0,
          );
          setCurrentStats({ explored: exp, path: pNodes.length, cost: cost });
        }
        yield step;
      }
    }
    await runSimulation(gridWrapper());

    const finalFlat = grid.flat();
    const finalP = finalFlat.filter((n) => n.isPath);
    addHistoryItem(
      mode,
      finalFlat.filter((n) => n.isVisited).length,
      finalP.length,
      finalP.reduce((acc, curr) => acc + (curr.isMud ? 5 : 1), 0),
    );
    return null;
  };

  const runQuickBenchmark = async () => {
    if (!isPaused) return;
    const algos: AlgoMode[] = ['Dijkstra', 'A*', 'Greedy'];
    const results: BenchmarkResult[] = [];

    for (const name of algos) {
      const res = await handleExecute(name, true);
      if (res && res.lastStep) {
        const step = res.lastStep;
        const finalGrid: Node[][] =
          'grid' in step ? (step.grid as Node[][]) : [];
        const explored = finalGrid.flat().filter((n) => n.isVisited).length;
        const pathNodes = finalGrid.flat().filter((n) => n.isPath);
        const cost = pathNodes.reduce(
          (acc, curr) => acc + (curr.isMud ? 5 : 1),
          0,
        );
        results.push({
          name,
          time: res.time,
          explored,
          cost: pathNodes.length > 0 ? cost : 'N/A',
          found: pathNodes.length > 0,
        });
        addHistoryItem(
          `${name} (Quick)`,
          explored,
          pathNodes.length,
          Number(cost),
        );
      }
    }
    setBenchmarkResults(results);
    setShowBenchmark(true);
  };

  const runVisualBenchmark = async () => {
    if (!isPaused) return;
    setIsBenchmarking(true);
    const algos: AlgoMode[] = ['Dijkstra', 'A*', 'Greedy'];
    for (const name of algos) {
      setAlgoType(name);
      await handleExecute(name, false);
      await new Promise((r) => setTimeout(r, 800));
    }
    setIsBenchmarking(false);
  };

  if (!isClient) return null;

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      <aside className="w-full lg:w-[350px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <NavHeader title="PathFind Pulse" subtitle="Diagnostic Engine" />

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Brush
            </p>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBrush('Wall')}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${brush === 'Wall' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
              >
                WALL
              </button>
              <button
                onClick={() => setBrush('Mud')}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${brush === 'Mud' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}
              >
                MUD
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Algorithm
            </p>
            <div className="flex flex-col gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['Dijkstra', 'A*', 'Greedy'] as AlgoMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAlgoType(mode)}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all ${algoType === mode ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500'}`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* New Heuristic Selector - Appears only for A* and Greedy */}
          {(algoType === 'A*' || algoType === 'Greedy') && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Heuristic Distance
              </p>
              <div className="grid grid-cols-1 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(
                  ['Manhattan', 'Euclidean'] as HeuristicType[]
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setHeuristic(type)}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all ${heuristic === type ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[9px] text-slate-500 uppercase">Explored</p>
            <p className="text-lg font-mono text-cyan-400 font-bold">
              {currentStats.explored}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase">Length</p>
            <p className="text-lg font-mono text-amber-400 font-bold">
              {currentStats.path}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase">Cost</p>
            <p className="text-lg font-mono text-emerald-400 font-bold">
              {currentStats.cost}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Run History
          </p>
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {history.length === 0 && (
              <p className="text-[10px] text-slate-600 italic">
                No runs recorded...
              </p>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-cyan-500">
                    {item.algorithm}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono">
                    {item.timestamp}
                  </span>
                </div>
                <div className="flex gap-3 text-[9px] text-slate-400 font-mono">
                  <span>EXP: {item.nodesExplored}</span>
                  <span>COST: {item.pathCost}</span>
                  <span
                    className={
                      item.status === 'Found'
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CodeViewer
          code={
            algoType === 'Dijkstra'
              ? dijkstraCode
              : algoType === 'A*'
                ? aStarCode
                : greedyCode
          }
          activeLine={activeLine}
        />
      </aside>

      <section className="flex-1 p-6 flex flex-col gap-6 relative">
        {isBenchmarking && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 px-6 py-2 rounded-full font-bold animate-pulse shadow-2xl">
            AUTO-BENCHMARK: {algoType.toUpperCase()}
          </div>
        )}

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <ControlPanel
            size={dimensions.cols}
            speed={speed}
            isPaused={isPaused}
            onSpeedChange={setSpeed}
            onSizeChange={handleSizeChange}
          />
          <div className="flex gap-2">
            <button
              onClick={generateMaze}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700"
            >
              Maze
            </button>
            <button
              onClick={clearWalls}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 text-rose-400"
            >
              Clear
            </button>
            <div className="h-8 w-[1px] bg-slate-800 mx-1" />
            <button
              onClick={runQuickBenchmark}
              className="px-4 py-2 bg-indigo-600 border border-indigo-500 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
            >
              Quick
            </button>
            <button
              onClick={runVisualBenchmark}
              className="px-4 py-2 bg-slate-100 text-slate-950 rounded-xl text-[10px] font-bold uppercase hover:bg-white"
            >
              Visual (All)
            </button>
          </div>
        </div>

        <div
          className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden"
          onMouseLeave={() => setIsMousePressed(false)}
          onMouseUp={() => setIsMousePressed(false)}
        >
          <div
            className="grid gap-[1px] bg-slate-800 p-[1px] select-none shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${dimensions.cols}, ${dimensions.cols > 45 ? '10px' : '18px'})`,
            }}
          >
            {grid.map((row, rIdx) =>
              row.map((node, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                  onMouseEnter={() =>
                    isMousePressed && handleNodeAction(rIdx, cIdx)
                  }
                  className={`${dimensions.cols > 45 ? 'w-[10px] h-[10px]' : 'w-[18px] h-[18px]'} transition-all duration-200 ${
                    rIdx === startPos.row && cIdx === startPos.col
                      ? 'bg-emerald-400 scale-110 z-10 shadow-[0_0_10px_#34d399]'
                      : rIdx === endPos.row && cIdx === endPos.col
                        ? 'bg-rose-500 scale-110 z-10 shadow-[0_0_10px_#f43f5e]'
                        : node.isPath
                          ? 'bg-amber-400 scale-[1.05]'
                          : node.isVisited
                            ? 'bg-cyan-500/20'
                            : node.isWall
                              ? 'bg-slate-700'
                              : node.isMud
                                ? 'bg-amber-900/60'
                                : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                />
              )),
            )}
          </div>
        </div>

        <button
          onClick={() => handleExecute()}
          disabled={!isPaused || isBenchmarking}
          className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-xl uppercase tracking-widest hover:bg-cyan-400 shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98] disabled:opacity-30"
        >
          {isPaused ? `RUN ${algoType}` : 'ANALYZING...'}
        </button>
      </section>

      {showBenchmark && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white italic">
                WARP RESULTS
              </h2>
              <button
                onClick={() => setShowBenchmark(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="p-4">Algorithm</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Explored</th>
                    <th className="p-4">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {benchmarkResults.map((res) => (
                    <tr key={res.name} className="hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-cyan-400">
                        {res.name}
                      </td>
                      <td className="p-4 font-mono text-white">{res.time}ms</td>
                      <td className="p-4 font-mono text-amber-400">
                        {res.explored}
                      </td>
                      <td
                        className={`p-4 font-mono ${res.found ? 'text-emerald-400' : 'text-rose-500'}`}
                      >
                        {res.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowBenchmark(false)}
                className="px-8 py-3 bg-slate-800 rounded-xl font-bold uppercase text-xs hover:bg-slate-700 text-white transition-colors"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
