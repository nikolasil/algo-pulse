'use client';

import React from 'react';
import { TreeNode } from '@/algorithms/treeAlgorithms';

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
  const renderNodes = (node: TreeNode | null): React.ReactNode => {
    if (!node) return null;

    const isActive = activeNodeId === node.value;
    const isVisited = visitedNodes.includes(node.value);

    return (
      <g key={node.value}>
        {/* Draw lines to children first so they are behind nodes */}
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="#334155"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#334155"
            strokeWidth="2"
          />
        )}

        {/* The Node Circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r="22"
          className={`transition-all duration-300 ${
            isActive
              ? 'fill-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
              : isVisited
                ? 'fill-indigo-600'
                : 'fill-slate-800'
          }`}
          stroke={isActive ? '#fff' : '#475569'}
          strokeWidth="2"
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fontSize="14"
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
    /* FIX: Removed overflow-hidden and fixed height/width. 
       The SVG now uses overflow: visible so that nodes rendered outside 
       the "0 0" origin are still visible when the user pans.
    */
    <div className="w-full h-full flex items-center justify-center">
      <svg className="overflow-visible" style={{ width: '1px', height: '1px' }}>
        {renderNodes(root)}
      </svg>
    </div>
  );
};
