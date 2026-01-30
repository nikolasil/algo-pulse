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
            stroke="#1e293b"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="#1e293b"
            strokeWidth="2"
          />
        )}

        {/* The Node Circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          className={`transition-colors duration-300 ${
            isActive
              ? 'fill-cyan-400'
              : isVisited
                ? 'fill-indigo-600'
                : 'fill-slate-800'
          }`}
          stroke={isActive ? '#fff' : '#334155'}
          strokeWidth="2"
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="white"
        >
          {node.value}
        </text>

        {renderNodes(node.left)}
        {renderNodes(node.right)}
      </g>
    );
  };

  return (
    <div className="w-full h-[400px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        {renderNodes(root)}
      </svg>
    </div>
  );
};
