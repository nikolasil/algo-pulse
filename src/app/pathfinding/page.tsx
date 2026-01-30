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
import { bfs, dfs, bfsCode, dfsCode } from '@/algorithms/traversalAlgorithms';
import {
  inOrder,
  preOrder,
  postOrder,
  treeCode,
  TreeNode,
} from '@/algorithms/treeAlgorithms';
import { NavHeader } from '@/components/NavHeader';
import { TreeVisualizer } from '@/components/TreeVisualizer';

// --- Tree Utility Logic ---
const generateTreeFromValues = (values: number[]): TreeNode | null => {
  let root: TreeNode | null = null;
  const bstInsert = (node: TreeNode | null, val: number): TreeNode => {
    if (!node) return { value: val, left: null, right: null, x: 0, y: 0 };
    if (val < node.value) node.left = bstInsert(node.left, val);
    else if (val > node.value) node.right = bstInsert(node.right, val);
    return node;
  };
  values.forEach((v) => {
    root = bstInsert(root, v);
  });
  const assignPositions = (
    node: TreeNode | null,
    x: number,
    y: number,
    offset: number,
  ) => {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) assignPositions(node.left, x - offset, y + 65, offset / 1.8);
    if (node.right)
      assignPositions(node.right, x + offset, y + 65, offset / 1.8);
  };
  assignPositions(root, 400, 45, 200);
  return root;
};

type ViewMode = 'Grid' | 'Tree';
type AlgoMode =
  | 'Dijkstra'
  | 'A*'
  | 'Greedy'
  | 'BFS'
  | 'DFS'
  | 'In-Order'
  | 'Pre-Order'
  | 'Post-Order';

interface HistoryItem {
  id: number;
  timestamp: string;
  nodesExplored: number;
  status: string;
  algorithm: string;
  heuristic?: HeuristicType;
}

interface BenchmarkResult {
  name: string;
  time: string;
  explored: number;
  cost: number | string;
  found: boolean;
  heuristic?: HeuristicType;
}

export default function PathfindingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('Grid');
  const [dimensions] = useState({ rows: 15, cols: 30 });
  const [grid, setGrid] = useState<Node[][]>([]);
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [algoType, setAlgoType] = useState<AlgoMode>('Dijkstra');
  const [heuristic, setHeuristic] = useState<HeuristicType>('Manhattan');
  const [treeTarget, setTreeTarget] = useState<string>('');
  const [brush, setBrush] = useState<'Wall' | 'Mud'>('Wall');
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>(
    [],
  );
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentStats, setCurrentStats] = useState({ explored: 0, path: 0 });
  const [activeTreeNode, setActiveTreeNode] = useState<number | null>(null);
  const [visitedTreeNodes, setVisitedTreeNodes] = useState<number[]>([]);
  const [startPos] = useState({ row: 7, col: 5 });
  const [endPos] = useState({ row: 7, col: 25 });

  const { runSimulation, isPaused, activeLine, speed, setSpeed } = useAlgorithm(
    [],
  );

  const initGrid = useCallback((rows: number, cols: number) => {
    const newGrid = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => createNode(r, c)),
    );
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    setIsClient(true);
    initGrid(dimensions.rows, dimensions.cols);
    setTreeData(
      generateTreeFromValues([50, 30, 70, 20, 40, 60, 80, 15, 25, 35, 45]),
    );
    setSpeed(10);
  }, [initGrid, setSpeed, dimensions]);

  const isStartOrEnd = (r: number, c: number) =>
    (r === startPos.row && c === startPos.col) ||
    (r === endPos.row && c === endPos.col);

  const saveToHistory = useCallback(
    (
      explored: number,
      mode: string,
      found: boolean,
      usedHeuristic?: HeuristicType,
    ) => {
      const newItem: HistoryItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        algorithm: mode,
        nodesExplored: explored,
        status:
          viewMode === 'Tree'
            ? treeTarget
              ? found
                ? 'Found'
                : 'Not Found'
              : 'Complete'
            : found
              ? 'Found'
              : 'No Path',
        heuristic:
          mode === 'A*' || mode === 'Greedy' ? usedHeuristic : undefined,
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 8));
    },
    [viewMode, treeTarget],
  );

  const handleNodeAction = (row: number, col: number) => {
    if (!isPaused || viewMode !== 'Grid' || isStartOrEnd(row, col)) return;
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

  const generateMaze = () => {
    if (!isPaused) return;
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isWall: Math.random() < 0.3 && !isStartOrEnd(node.row, node.col),
        isMud: false,
        isVisited: false,
        isPath: false,
      })),
    );
    setGrid(newGrid);
  };

  const runQuickBenchmark = async () => {
    if (!isPaused) return;
    const algos: AlgoMode[] = ['Dijkstra', 'A*', 'Greedy', 'BFS', 'DFS'];
    const results: BenchmarkResult[] = [];
    for (const name of algos) {
      const res = await handleExecute(name, true);
      const finalGrid = res?.lastStep?.grid;
      if (finalGrid) {
        const flat = finalGrid.flat();
        results.push({
          name,
          time: res.time,
          explored: flat.filter((n: any) => n.isVisited).length,
          cost: flat.filter((n: any) => n.isPath).length || 'N/A',
          found: flat.some((n: any) => n.isPath),
          heuristic: name === 'A*' || name === 'Greedy' ? heuristic : undefined,
        });
      }
    }
    setBenchmarkResults(results);
    setShowBenchmark(true);
  };

  const handleExecute = async (
    mode: AlgoMode = algoType,
    isSilent = false,
  ): Promise<any> => {
    if (viewMode === 'Grid') {
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

      let gen;
      if (mode === 'A*') gen = aStar(workGrid, startNode, endNode, heuristic);
      else if (mode === 'Greedy')
        gen = greedyBestFirst(workGrid, startNode, endNode, heuristic);
      else if (mode === 'BFS') gen = bfs(workGrid, startNode, endNode);
      else if (mode === 'DFS') gen = dfs(workGrid, startNode, endNode);
      else gen = dijkstra(workGrid, startNode, endNode);

      if (isSilent) {
        const start = performance.now();
        let last = { grid: workGrid };
        for await (const step of gen) {
          last = step;
        }
        return { lastStep: last, time: (performance.now() - start).toFixed(2) };
      }

      await runSimulation(
        (async function* () {
          let lastExp = 0,
            found = false;
          for await (const step of gen) {
            if ('grid' in step) {
              setGrid(step.grid);
              const flat = step.grid.flat();
              lastExp = flat.filter((n) => n.isVisited).length;
              found = flat.some((n) => n.isPath);
              setCurrentStats({
                explored: lastExp,
                path: flat.filter((n) => n.isPath).length,
              });
            }
            yield step;
          }
          saveToHistory(lastExp, mode, found, heuristic);
        })(),
      );
    } else {
      setVisitedTreeNodes([]);
      const targetVal = treeTarget ? parseInt(treeTarget) : null;
      let gen = (
        mode === 'Pre-Order'
          ? preOrder
          : mode === 'Post-Order'
            ? postOrder
            : inOrder
      )(treeData);

      await runSimulation(
        (async function* () {
          let count = 0,
            found = false;
          for await (const step of gen) {
            count++;
            const val = step.activeNode.value;
            setActiveTreeNode(val);
            setVisitedTreeNodes((prev) => [...prev, val]);
            setCurrentStats({ explored: count, path: 0 });
            if (targetVal !== null && val === targetVal) {
              found = true;
              yield step;
              break;
            }
            yield step;
          }
          saveToHistory(count, mode, found);
        })(),
      );
    }
  };

  if (!isClient) return null;

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-full lg:w-[350px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        <NavHeader title="PathFind Pulse" subtitle="Diagnostic Engine" />

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['Grid', 'Tree'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setViewMode(v);
                setAlgoType(v === 'Grid' ? 'Dijkstra' : 'In-Order');
              }}
              className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${viewMode === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {v.toUpperCase()} ENGINE
            </button>
          ))}
        </div>

        {viewMode === 'Grid' ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Brush Selection
              </p>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setBrush('Wall')}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${brush === 'Wall' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                >
                  WALL
                </button>
                <button
                  onClick={() => setBrush('Mud')}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${brush === 'Mud' ? 'bg-amber-700 text-white' : 'text-slate-500'}`}
                >
                  MUD (Cost: 5)
                </button>
              </div>
            </div>

            {(algoType === 'A*' || algoType === 'Greedy') && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Heuristic Formula
                </p>
                <select
                  value={heuristic}
                  onChange={(e) =>
                    setHeuristic(e.target.value as HeuristicType)
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Manhattan">Manhattan (4-Directional)</option>
                  <option value="Euclidean">Euclidean (Direct Line)</option>
                </select>
              </div>
            )}

            <button
              onClick={generateMaze}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
            >
              Generate Maze
            </button>
          </div>
        ) : (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Search Target
            </p>
            <input
              type="number"
              placeholder="Value (e.g. 45)"
              value={treeTarget}
              onChange={(e) => setTreeTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-cyan-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Algorithm
          </p>
          <div className="grid grid-cols-1 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(viewMode === 'Grid'
              ? ['Dijkstra', 'A*', 'Greedy', 'BFS', 'DFS']
              : ['In-Order', 'Pre-Order', 'Post-Order']
            ).map((m) => (
              <button
                key={m}
                onClick={() => setAlgoType(m as AlgoMode)}
                className={`py-2 text-[10px] font-bold rounded-lg transition-colors ${algoType === m ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:bg-slate-900'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-3">
            Live Telemetry
          </p>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-[8px] text-slate-500 uppercase">Explored</p>
              <p className="text-xl font-mono font-bold text-white">
                {currentStats.explored}
              </p>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase">Path Length</p>
              <p className="text-xl font-mono font-bold text-cyan-400">
                {currentStats.path || '--'}
              </p>
            </div>
          </div>
          {(algoType === 'A*' || algoType === 'Greedy') && (
            <div className="border-t border-indigo-500/10 pt-2 text-center">
              <span className="text-[9px] text-slate-500 uppercase">
                Heuristic:{' '}
              </span>
              <span className="text-[9px] font-bold text-indigo-300 uppercase">
                {heuristic}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Execution History
          </p>
          <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {history.length === 0 ? (
              <p className="text-[9px] text-slate-600 italic">
                No logs detected...
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase">
                      {item.algorithm}
                      {item.heuristic ? ` (${item.heuristic[0]})` : ''}
                    </span>
                    <span className="text-[8px] text-slate-600 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono flex justify-between">
                    <span>Exp: {item.nodesExplored}</span>
                    <span
                      className={
                        item.status.includes('Found') ||
                        item.status === 'Complete'
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <CodeViewer
          code={
            viewMode === 'Grid'
              ? {
                  Dijkstra: dijkstraCode,
                  'A*': aStarCode,
                  Greedy: greedyCode,
                  BFS: bfsCode,
                  DFS: dfsCode,
                }[algoType]
              : treeCode[
                  algoType === 'Pre-Order'
                    ? 'preOrder'
                    : algoType === 'Post-Order'
                      ? 'postOrder'
                      : 'inOrder'
                ]
          }
          activeLine={activeLine}
        />
      </aside>

      <section className="flex-1 p-6 flex flex-col gap-6 relative">
        <div className="flex justify-between items-center">
          <ControlPanel
            size={30}
            speed={speed}
            isPaused={isPaused}
            onSpeedChange={setSpeed}
            onSizeChange={() => {}}
          />
          {viewMode === 'Grid' && (
            <div className="flex gap-2">
              <button
                onClick={() => initGrid(15, 30)}
                className="px-4 py-2 bg-slate-800 hover:bg-rose-900/40 border border-slate-700 rounded-xl text-[10px] font-bold uppercase text-rose-400 transition-colors"
              >
                Clear Board
              </button>
              <button
                onClick={runQuickBenchmark}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-indigo-500/20 transition-all"
              >
                Benchmark
              </button>
            </div>
          )}
        </div>

        <div
          className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner"
          onMouseDown={() => setIsMousePressed(true)}
          onMouseUp={() => setIsMousePressed(false)}
        >
          {viewMode === 'Grid' ? (
            <div
              className="grid gap-[1px] bg-slate-800 p-[1px] rounded-sm"
              style={{ gridTemplateColumns: `repeat(30, 18px)` }}
            >
              {grid.map((row, rIdx) =>
                row.map((node, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    onMouseEnter={() =>
                      isMousePressed && handleNodeAction(rIdx, cIdx)
                    }
                    onMouseDown={() => handleNodeAction(rIdx, cIdx)}
                    className={`w-[18px] h-[18px] transition-colors duration-200 cursor-crosshair ${rIdx === startPos.row && cIdx === startPos.col ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : rIdx === endPos.row && cIdx === endPos.col ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : node.isPath ? 'bg-amber-400' : node.isVisited ? 'bg-cyan-500/30' : node.isWall ? 'bg-slate-700' : node.isMud ? 'bg-amber-900/60' : 'bg-slate-900'}`}
                  />
                )),
              )}
            </div>
          ) : (
            <TreeVisualizer
              root={treeData}
              activeNodeId={activeTreeNode}
              visitedNodes={visitedTreeNodes}
            />
          )}
        </div>

        <button
          onClick={() => handleExecute()}
          disabled={!isPaused}
          className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-xl uppercase tracking-widest disabled:opacity-30 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          {isPaused
            ? treeTarget
              ? `SEARCH FOR ${treeTarget}`
              : `RUN ${algoType} ANALYSIS`
            : 'SYSTEM ANALYZING...'}
        </button>
      </section>

      {showBenchmark && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between mb-6 items-center">
              <h2 className="text-2xl font-black italic tracking-tighter text-white">
                BENCHMARK REPORT
              </h2>
              <button
                onClick={() => setShowBenchmark(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-[10px] uppercase text-slate-500 font-bold">
                  <tr>
                    <th className="p-4">Algorithm</th>
                    <th className="p-4">Latency</th>
                    <th className="p-4">Heuristic</th>
                    <th className="p-4">Coverage</th>
                    <th className="p-4">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {benchmarkResults.map((res) => (
                    <tr
                      key={res.name}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 font-bold text-cyan-400">
                        {res.name}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        {res.time}ms
                      </td>
                      <td className="p-4 text-[10px] text-slate-500 uppercase font-bold">
                        {res.heuristic || 'N/A'}
                      </td>
                      <td className="p-4 font-mono text-amber-400">
                        {res.explored}
                      </td>
                      <td
                        className={`p-4 font-mono font-bold ${res.found ? 'text-emerald-400' : 'text-rose-500'}`}
                      >
                        {res.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
