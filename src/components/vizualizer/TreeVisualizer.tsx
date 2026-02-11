'use client';

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeNode } from '@/structures/treeAlgorithms';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface TreeVisualizerProps {
  root: TreeNode | null;
  activeNodeId: number | null;
  visitedNodes: number[];
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  root,
  activeNodeId,
  visitedNodes,
}) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFitMode, setIsFitMode] = useState(true);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const baseViewBox = useMemo(() => {
    if (!root) return { minX: 0, minY: 0, width: 100, height: 100 };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const traverse = (node: TreeNode) => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
      if (node.left) traverse(node.left);
      if (node.right) traverse(node.right);
    };

    traverse(root);

    const padding = 60;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    return {
      minX: minX - padding,
      minY: minY - padding,
      width,
      height,
    };
  }, [root]);

  const nodeCount = useMemo(() => {
    if (!root) return 0;
    const count = (node: TreeNode | null): number => {
      if (!node) return 0;
      return 1 + count(node.left) + count(node.right);
    };
    return count(root);
  }, [root]);

  const currentViewBoxString = `${baseViewBox.minX + offset.x} ${
    baseViewBox.minY + offset.y
  } ${baseViewBox.width} ${baseViewBox.height}`;

  useEffect(() => {
    if (isFitMode && containerRef.current && root) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const scaleX = containerWidth / baseViewBox.width;
      const scaleY = containerHeight / baseViewBox.height;
      const newZoom = Math.min(scaleX, scaleY, 1) * 0.9;
      setZoom(newZoom);
    }
  }, [root, baseViewBox, isFitMode]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 3));
        setIsFitMode(false);
      } else {
        setOffset((prev) => ({
          x: prev.x + e.deltaX,
          y: prev.y + e.deltaY,
        }));
      }
    },
    [],
  );

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const dx = (lastMousePos.current.x - clientX) * (1 / zoom);
    const dy = (lastMousePos.current.y - clientY) * (1 / zoom);

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => setIsDragging(false);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
    setIsFitMode(false);
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.3));
    setIsFitMode(false);
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setIsFitMode(true);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setOffset({ x: 0, y: 0 });
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [root]);

  const renderNodes = (node: TreeNode | null): React.ReactNode => {
    if (!node) return null;

    const isActive = activeNodeId === node.value;
    const isVisited = visitedNodes.includes(node.value);

    return (
      <g key={node.value}>
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="#334155"
            strokeWidth="1.5"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#334155"
            strokeWidth="1.5"
          />
        )}

        <motion.circle
          cx={node.x}
          cy={node.y}
          r="14"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            transition-all duration-300 cursor-pointer
            ${isActive ? 'fill-primary-400' : ''}
            ${isVisited && !isActive ? 'fill-indigo-600' : ''}
            ${!isActive && !isVisited ? 'fill-surface-800' : ''}
          `}
          stroke={isActive ? '#fff' : '#475569'}
          strokeWidth="2"
        />

        <text
          x={node.x}
          y={node.y}
          dy=".35em"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="white"
          className="pointer-events-none select-none"
        >
          {node.value}
        </text>

        {renderNodes(node.left)}
        {renderNodes(node.right)}
      </g>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900/50 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500">
            {root ? `${nodeCount} nodes` : 'No tree'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-surface-800/80 px-2 py-1 rounded-lg">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-surface-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} className="text-surface-300" />
          </button>

          <button
            onClick={() => {
              setIsFitMode(true);
            }}
            className={`p-1.5 rounded transition-colors ${
              isFitMode ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-surface-700 text-surface-300'
            }`}
            title="Fit to Screen"
          >
            <Maximize2 size={14} />
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-surface-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} className="text-surface-300" />
          </button>

          <div className="w-px h-4 bg-surface-700 mx-1" />

          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-surface-700 transition-colors"
            title="Reset View"
          >
            <RotateCcw size={14} className="text-surface-300" />
          </button>
        </div>
      </div>

      {/* Visualization Area */}
      <div
        ref={containerRef}
        className={`
          flex-1 relative overflow-hidden bg-surface-950/50
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        onWheel={handleWheel}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) =>
          handleStart(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          handleMove(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={handleEnd}
      >
        <svg
          viewBox={currentViewBoxString}
          className="w-full h-full transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          <AnimatePresence>
            {root ? (
              renderNodes(root)
            ) : (
              <text
                x={baseViewBox.minX + baseViewBox.width / 2}
                y={baseViewBox.minY + baseViewBox.height / 2}
                fill="#64748b"
                textAnchor="middle"
                className="text-sm font-medium"
              >
                Awaiting Tree Data...
              </text>
            )}
          </AnimatePresence>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 px-3 py-1.5 bg-surface-900/80 backdrop-blur rounded-lg border border-surface-700">
          {[
            { color: 'bg-primary-400', label: 'Active' },
            { color: 'bg-indigo-600', label: 'Visited' },
            { color: 'bg-surface-800', label: 'Idle' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-[10px] text-surface-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
