'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { TreeNode } from '@/structures/treeAlgorithms';

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
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Calculate boundaries for the ViewBox
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

    const padding = 40;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    return {
      minX: minX - padding,
      minY: minY - padding,
      width,
      height,
    };
  }, [root]);

  // Combined ViewBox string with offset applied
  const currentViewBoxString = `${baseViewBox.minX + offset.x} ${
    baseViewBox.minY + offset.y
  } ${baseViewBox.width} ${baseViewBox.height}`;

  // 2. Interaction Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
    } else {
      // Normal scrolling pans the view
      setOffset((prev) => ({
        x: prev.x + e.deltaX,
        y: prev.y + e.deltaY,
      }));
    }
  };

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

  // Reset offset when tree changes radically if desired
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
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
            stroke="#1e293b"
            strokeWidth="1"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#1e293b"
            strokeWidth="1"
          />
        )}

        <circle
          cx={node.x}
          cy={node.y}
          r="12"
          className={`transition-all duration-300 ${
            isActive
              ? 'fill-cyan-400 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]'
              : isVisited
                ? 'fill-indigo-600'
                : 'fill-slate-900'
          }`}
          stroke={isActive ? '#fff' : '#334155'}
          strokeWidth="1"
        />

        <text
          x={node.x}
          y={node.y}
          dy=".35em"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="white"
          className="pointer-events-none select-none font-sans"
        >
          {node.value}
        </text>

        {renderNodes(node.left)}
        {renderNodes(node.right)}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center relative overflow-hidden bg-slate-950/50 rounded-xl touch-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
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
        {root ? (
          renderNodes(root)
        ) : (
          <text
            x={baseViewBox.minX + baseViewBox.width / 2}
            y={baseViewBox.minY + baseViewBox.height / 2}
            fill="#475569"
            textAnchor="middle"
            className="text-sm font-medium"
          >
            Awaiting Tree Data...
          </text>
        )}
      </svg>
    </div>
  );
};
