'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Node } from '@/algorithms/pathfindingAlgorithms';

interface GridVisualizerProps {
  grid: Node[][];
  dimensions: { rows: number; cols: number };
  startPos: { row: number; col: number };
  endPos: { row: number; col: number };
  onNodeMouseDown: (row: number, col: number) => void;
  onNodeMouseEnter: (row: number, col: number) => void;
  isMousePressed: boolean;
}

export const GridVisualizer = ({
  grid,
  dimensions,
  startPos,
  endPos,
  onNodeMouseDown,
  onNodeMouseEnter,
  isMousePressed,
}: GridVisualizerProps) => {
  const [scale, setScale] = useState(1); // Scale state for "Zoom"
  const gridRef = useRef<HTMLDivElement>(null);

  // Base size that looks good on desktop
  const BASE_NODE_SIZE = 24;

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMousePressed) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const nodeData = element?.getAttribute('data-node');

    if (nodeData) {
      const [r, c] = nodeData.split('-').map(Number);
      onNodeMouseEnter(r, c);
    }
  };

  const getNodeStyles = (node: Node, r: number, c: number) => {
    const isStart = r === startPos.row && c === startPos.col;
    const isEnd = r === endPos.row && c === endPos.col;

    if (isStart)
      return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] z-20 rounded-md scale-95';
    if (isEnd)
      return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] z-20 rounded-md scale-95';
    if (node.isPath)
      return 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] z-10 scale-90 rounded-sm';
    if (node.isVisited) return 'bg-cyan-500/30 border border-cyan-400/20';
    if (node.isWall) return 'bg-slate-700 border border-slate-600 rounded-sm';
    if (node.isMud) return 'bg-amber-900/40 border border-amber-700/30';

    return 'bg-slate-900/40 border border-slate-800/50';
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Zoom Control UI */}
      <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300">
        <span>Zoom Out</span>
        <input
          type="range"
          min="0.3"
          max="1"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <span>100%</span>
      </div>

      <div className="w-full max-w-[100vw] overflow-auto p-2 sm:p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl touch-none flex justify-center">
        <div
          ref={gridRef}
          className="grid gap-[1px] bg-transparent origin-top transition-transform duration-200"
          onTouchMove={handleTouchMove}
          style={{
            gridTemplateColumns: `repeat(${dimensions.cols}, ${BASE_NODE_SIZE}px)`,
            transform: `scale(${scale})`, // This shrinks the grid to fit the screen
            width: 'fit-content',
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((node, cIdx) => {
              const isStart = rIdx === startPos.row && cIdx === startPos.col;
              const isEnd = rIdx === endPos.row && cIdx === endPos.col;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  data-node={`${rIdx}-${cIdx}`}
                  onMouseDown={() => onNodeMouseDown(rIdx, cIdx)}
                  onMouseEnter={() =>
                    isMousePressed && onNodeMouseEnter(rIdx, cIdx)
                  }
                  onTouchStart={() => onNodeMouseDown(rIdx, cIdx)}
                  className={`
                    relative transition-all duration-150 cursor-crosshair select-none
                    ${getNodeStyles(node, rIdx, cIdx)}
                  `}
                  style={{
                    width: BASE_NODE_SIZE,
                    height: BASE_NODE_SIZE,
                    touchAction: 'none',
                  }}
                >
                  {(isStart || isEnd) && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className={`absolute inset-0 rounded-lg ${isStart ? 'bg-emerald-400' : 'bg-rose-500'} blur-md -z-10`}
                    />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {scale < 0.6 && (
        <p className="text-[10px] text-rose-400 animate-pulse">
          Tip: Zooming in makes it easier to draw walls precisely!
        </p>
      )}
    </div>
  );
};
