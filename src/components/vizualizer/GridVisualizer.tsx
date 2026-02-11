'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PathfindingNode } from '@/hooks/algorithms/pathfindingAlgorithms';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3 } from 'lucide-react';

interface GridVisualizerProps {
  grid: PathfindingNode[][];
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
  const [scale, setScale] = useState(1);
  const [isFitMode, setIsFitMode] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const MIN_NODE_SIZE = 16;
  const BASE_NODE_SIZE = 24;

  const currentNodeSize = useMemo(
    () => Math.round(BASE_NODE_SIZE * scale),
    [scale],
  );

  useEffect(() => {
    const updateFit = () => {
      if (containerRef.current && isFitMode) {
        const containerWidth = containerRef.current.offsetWidth;
        const requiredWidth = dimensions.cols * BASE_NODE_SIZE + 32;
        if (containerWidth < requiredWidth) {
          setScale(Math.max(0.4, containerWidth / requiredWidth));
        }
      }
    };

    updateFit();
    window.addEventListener('resize', updateFit);
    return () => window.removeEventListener('resize', updateFit);
  }, [dimensions, isFitMode]);

  const handleZoom = useCallback(
    (delta: number) => {
      setIsFitMode(false);
      setScale((prev) => Math.max(0.3, Math.min(1.5, prev + delta)));
    },
    [],
  );

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

  const getNodeStyles = (node: PathfindingNode) => {
    if (node.isPath)
      return 'bg-warning-400 shadow-lg z-10 rounded-sm scale-95';
    if (node.isVisited)
      return 'bg-primary-500/40 border border-primary-400/20';
    if (node.isWall)
      return 'bg-surface-700 border border-surface-600 rounded-sm';
    if (node.isMud)
      return 'bg-amber-900/50 border border-amber-700/30 rounded-sm';

    return 'bg-surface-800/60 border border-surface-700/50';
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <Grid3X3 size={14} className="text-surface-500" />
          <span className="text-xs text-surface-500">
            {dimensions.rows} × {dimensions.cols}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-surface-800/80 px-3 py-1.5 rounded-full border border-surface-700">
          <button
            onClick={() => handleZoom(-0.1)}
            disabled={scale <= 0.3}
            className="p-1 rounded hover:bg-surface-700 disabled:opacity-30 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} className="text-surface-300" />
          </button>

          <button
            onClick={() => {
              setIsFitMode(true);
              setScale(1);
            }}
            className={`p-1 rounded transition-colors ${isFitMode ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-surface-700 text-surface-300'}`}
            title="Fit to Screen"
          >
            <Maximize2 size={14} />
          </button>

          <span className="text-xs font-mono text-surface-400 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => handleZoom(0.1)}
            disabled={scale >= 1.5}
            className="p-1 rounded hover:bg-surface-700 disabled:opacity-30 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} className="text-surface-300" />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div
        ref={containerRef}
        className="w-full overflow-auto p-3 bg-surface-950 rounded-xl border border-surface-800 shadow-inner"
      >
        <div
          ref={gridRef}
          className="grid gap-px bg-surface-800/50 origin-top transition-transform duration-200"
          onTouchMove={handleTouchMove}
          style={{
            gridTemplateColumns: `repeat(${dimensions.cols}, ${currentNodeSize}px)`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: 'fit-content',
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((node, cIdx) => {
              const isStart =
                rIdx === startPos.row && cIdx === startPos.col;
              const isEnd =
                rIdx === endPos.row && cIdx === endPos.col;

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
                    ${getNodeStyles(node)}
                    ${isStart ? 'bg-success-400 shadow-lg z-20 rounded-md scale-95' : ''}
                    ${isEnd ? 'bg-error-500 shadow-lg z-20 rounded-md scale-95' : ''}
                  `}
                  style={{
                    width: currentNodeSize,
                    height: currentNodeSize,
                    touchAction: 'none',
                    minWidth: MIN_NODE_SIZE,
                    minHeight: MIN_NODE_SIZE,
                  }}
                >
                  <AnimatePresence>
                    {(isStart || isEnd) && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`absolute inset-0 rounded-md ${
                          isStart ? 'bg-success-400' : 'bg-error-500'
                        } blur-md -z-10`}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-2">
        {[
          { color: 'bg-success-400', label: 'Start' },
          { color: 'bg-error-500', label: 'End' },
          { color: 'bg-warning-400', label: 'Path' },
          { color: 'bg-primary-500/40', label: 'Visited' },
          { color: 'bg-surface-700', label: 'Wall' },
          { color: 'bg-amber-900/50', label: 'Mud' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-sm ${item.color} border border-surface-600`}
            />
            <span className="text-[10px] text-surface-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
