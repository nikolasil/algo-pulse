'use client';

import React from 'react';
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
  const NODE_SIZE = 20; // Slightly larger for better tap targets

  const getNodeStyles = (node: Node, r: number, c: number) => {
    const isStart = r === startPos.row && c === startPos.col;
    const isEnd = r === endPos.row && c === endPos.col;

    // Start Node
    if (isStart)
      return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] z-20 rounded-md scale-95';
    // End Node
    if (isEnd)
      return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)] z-20 rounded-md scale-95';

    // The Final Path
    if (node.isPath)
      return 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] z-10 scale-90 rounded-sm transition-all duration-300';

    // Explored Nodes
    if (node.isVisited)
      return 'bg-cyan-500/30 border border-cyan-400/20 scale-100';

    // Obstacles
    if (node.isWall)
      return 'bg-slate-700 shadow-[inset_0_0_8px_rgba(0,0,0,0.4)] border border-slate-600 rounded-sm';

    // Terrain (Mud)
    if (node.isMud)
      return 'bg-amber-900/40 border border-amber-700/30 shadow-inner';

    // Default Empty
    return 'bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/80 hover:border-slate-700';
  };

  return (
    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-auto custom-scrollbar">
      <div
        className="grid gap-[2px] bg-transparent mx-auto"
        style={{
          gridTemplateColumns: `repeat(${dimensions.cols}, ${NODE_SIZE}px)`,
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
                onMouseDown={() => onNodeMouseDown(rIdx, cIdx)}
                onMouseEnter={() =>
                  isMousePressed && onNodeMouseEnter(rIdx, cIdx)
                }
                className={`
                  relative transition-all duration-150 cursor-crosshair
                  ${getNodeStyles(node, rIdx, cIdx)}
                `}
                style={{ width: NODE_SIZE, height: NODE_SIZE }}
              >
                {/* Pulse effect for Start/End */}
                {(isStart || isEnd) && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: 'easeInOut',
                    }}
                    className={`absolute inset-0 rounded-lg ${isStart ? 'bg-emerald-400' : 'bg-rose-500'} blur-md -z-10`}
                  />
                )}

                {/* Mud Icon (centered dot) */}
                {node.isMud && !node.isPath && !node.isVisited && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-1.5 h-1.5 bg-amber-700 rounded-full opacity-60" />
                  </div>
                )}

                {/* Subtle coordinate tooltip on hover (optional) */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-white/5 pointer-events-none transition-opacity" />
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
};
