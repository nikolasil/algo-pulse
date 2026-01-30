'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import {
  Node,
  createNode,
  dijkstra,
  dijkstraCode,
} from '@/algorithms/pathfindingAlgorithms';

interface HistoryItem {
  id: number;
  timestamp: string;
  nodesExplored: number;
  pathLength: number;
  status: 'Found' | 'No Path';
}

export default function PathfindingPage() {
  const [dimensions, setDimensions] = useState({ rows: 15, cols: 30 });
  const [grid, setGrid] = useState<Node[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentStats, setCurrentStats] = useState({ explored: 0, path: 0 });

  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [startPos, setStartPos] = useState({ row: 2, col: 2 });
  const [endPos, setEndPos] = useState({ row: 10, col: 25 });

  const { runSimulation, isPaused, activeLine, speed, setSpeed } = useAlgorithm(
    [],
  );

  const initGrid = useCallback((rows: number, cols: number) => {
    const initialGrid = [];
    for (let r = 0; r < rows; r++) {
      const currentRow = [];
      for (let c = 0; c < cols; c++) {
        currentRow.push(createNode(r, c));
      }
      initialGrid.push(currentRow);
    }
    const sRow = Math.floor(rows / 2);
    const sCol = Math.floor(cols / 4);
    const eRow = Math.floor(rows / 2);
    const eCol = Math.floor((cols / 4) * 3);

    setStartPos({ row: sRow, col: sCol });
    setEndPos({ row: eRow, col: eCol });
    setGrid(initialGrid);
    setCurrentStats({ explored: 0, path: 0 });
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
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      })),
    );
    setGrid(newGrid);
    setCurrentStats({ explored: 0, path: 0 });
  };

  const clearWalls = () => {
    if (!isPaused) return;
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isWall: false,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      })),
    );
    setGrid(newGrid);
    setCurrentStats({ explored: 0, path: 0 });
  };

  const generateMaze = () => {
    if (!isPaused) return;

    const rows = dimensions.rows;
    const cols = dimensions.cols;

    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isWall: true,
        isVisited: false,
        isPath: false,
      })),
    );

    const getNeighbors = (r: number, c: number) => {
      const neighbors = [];
      if (r >= 2) neighbors.push([r - 2, c]);
      if (r <= rows - 3) neighbors.push([r + 2, c]);
      if (c >= 2) neighbors.push([r, c - 2]);
      if (c <= cols - 3) neighbors.push([r, c + 2]);
      return neighbors;
    };

    const stack: [number, number][] = [[0, 0]];
    newGrid[0][0].isWall = false;
    const visited = new Set(['0-0']);

    while (stack.length > 0) {
      const [currR, currC] = stack[stack.length - 1];
      const neighbors = getNeighbors(currR, currC).filter(
        ([nr, nc]) => !visited.has(`${nr}-${nc}`),
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
    setCurrentStats({ explored: 0, path: 0 });
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
    if (
      (row === startPos.row && col === startPos.col) ||
      (row === endPos.row && col === endPos.col)
    )
      return;

    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      const target = newGrid[row][col];
      newGrid[row][col] = { ...target, isWall: !target.isWall };
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

  const handleMouseUp = () => {
    setIsMousePressed(false);
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
  };

  const handleExecute = async () => {
    if (!isPaused) return;
    setCurrentStats({ explored: 0, path: 0 });

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
    const generator = dijkstra(workGrid, startNode, endNode);

    let latestGrid: Node[][] = workGrid;

    async function* gridWrapper() {
      for await (const step of generator) {
        if (step.grid) {
          latestGrid = step.grid;
          setGrid(step.grid);
          const visited = step.grid.flat().filter((n) => n.isVisited).length;
          const path = step.grid.flat().filter((n) => n.isPath).length;
          setCurrentStats({ explored: visited, path });
        }
        yield step;
      }
    }

    await runSimulation(gridWrapper());

    const flatGrid = latestGrid.flat();
    const visitedCount = flatGrid.filter((n) => n.isVisited).length;
    const pathCount = flatGrid.filter((n) => n.isPath).length;
    const success = pathCount > 0;

    const newEntry: HistoryItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      nodesExplored: visitedCount,
      pathLength: pathCount,
      status: success ? 'Found' : 'No Path',
    };

    setHistory((prev) => [newEntry, ...prev].slice(0, 5));
  };

  if (!isClient) return null;

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-full lg:w-[350px] bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
        <h1 className="text-2xl font-black text-cyan-500 tracking-tighter italic">
          GRID PULSE
        </h1>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Live Telemetry
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Explored</p>
              <p className="text-xl font-mono text-cyan-400 font-bold">
                {currentStats.explored}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Path</p>
              <p className="text-xl font-mono text-amber-400 font-bold">
                {currentStats.path}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Session History
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 && (
              <p className="text-xs text-slate-600 italic">
                Waiting for first run...
              </p>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/40 p-3 rounded-lg border border-slate-700 text-[11px] font-mono"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">{item.timestamp}</span>
                  <span
                    className={
                      item.status === 'Found'
                        ? 'text-emerald-400'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-3 text-slate-300">
                  <span>EXP: {item.nodesExplored}</span>
                  <span>PTH: {item.pathLength}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CodeViewer code={dijkstraCode} activeLine={activeLine} />
      </aside>

      <section className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex flex-wrap gap-4 items-center">
          <ControlPanel
            size={dimensions.cols}
            speed={speed}
            isPaused={isPaused}
            onReset={() => initGrid(dimensions.rows, dimensions.cols)}
            onSpeedChange={setSpeed}
            onSizeChange={handleSizeChange}
          />
          <div className="flex gap-2">
            <button
              onClick={generateMaze}
              disabled={!isPaused}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors disabled:opacity-30 active:scale-95"
            >
              Generate Maze
            </button>
            <button
              onClick={clearWalls}
              disabled={!isPaused}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors disabled:opacity-30 active:scale-95 text-rose-400 border-rose-900/30"
            >
              Clear Walls
            </button>
            <button
              onClick={clearPath}
              disabled={!isPaused}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors disabled:opacity-30 active:scale-95"
            >
              Clear Path
            </button>
          </div>
        </div>

        <div
          className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden"
          onMouseLeave={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          <div
            className="grid gap-[1px] bg-slate-800 p-[1px] select-none"
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
                  className={`${dimensions.cols > 45 ? 'w-[10px] h-[10px]' : 'w-[18px] h-[18px]'} transition-colors duration-100 ${
                    rIdx === startPos.row && cIdx === startPos.col
                      ? 'bg-emerald-400 scale-110 z-10 shadow-[0_0_8px_#34d399]'
                      : rIdx === endPos.row && cIdx === endPos.col
                        ? 'bg-rose-500 scale-110 z-10 shadow-[0_0_8px_#f43f5e]'
                        : node.isPath
                          ? 'bg-amber-400'
                          : node.isVisited
                            ? 'bg-cyan-500/30'
                            : node.isWall
                              ? 'bg-slate-700'
                              : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                />
              )),
            )}
          </div>
        </div>

        <button
          onClick={handleExecute}
          disabled={!isPaused}
          className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-xl uppercase tracking-widest hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-30"
        >
          {isPaused ? 'Run Dijkstra' : 'Calculating...'}
        </button>
      </section>
    </main>
  );
}
