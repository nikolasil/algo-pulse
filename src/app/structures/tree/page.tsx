'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { CodeViewer } from '@/components/CodeViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { NavHeader } from '@/components/NavHeader';
import { TreeVisualizer } from '@/components/TreeVisualizer';
import { TelemetryLog } from '@/components/TelemetryLog';
import { ExpandableSidebar } from '@/components/ExpandableSidebar';

import {
  inOrder,
  preOrder,
  postOrder,
  treeCode,
  TreeNode,
} from '@/structures/treeAlgorithms';

// --- Tree Utility Logic (Extracted for Local Use) ---
type TreeMode = 'BST' | 'Balanced' | 'Complete';

const bstInsert = (node: TreeNode | null, val: number): TreeNode => {
  if (!node) return { value: val, left: null, right: null, x: 0, y: 0 };
  if (val < node.value) node.left = bstInsert(node.left, val);
  else if (val > node.value) node.right = bstInsert(node.right, val);
  return node;
};

const buildBalanced = (
  values: number[],
  start: number,
  end: number,
): TreeNode | null => {
  if (start > end) return null;
  const mid = Math.floor((start + end) / 2);
  const node: TreeNode = {
    value: values[mid],
    left: null,
    right: null,
    x: 0,
    y: 0,
  };
  node.left = buildBalanced(values, start, mid - 1);
  node.right = buildBalanced(values, mid + 1, end);
  return node;
};

const assignPositions = (
  node: TreeNode | null,
  x: number,
  y: number,
  offset: number,
) => {
  if (!node) return;
  node.x = x;
  node.y = y;
  if (node.left) assignPositions(node.left, x - offset, y + 70, offset / 1.7);
  if (node.right) assignPositions(node.right, x + offset, y + 70, offset / 1.7);
};

const generateTreeFromValues = (
  values: number[],
  mode: TreeMode = 'BST',
): TreeNode | null => {
  let root: TreeNode | null = null;
  if (mode === 'BST' || mode === 'Complete') {
    values.forEach((v) => {
      root = bstInsert(root, v);
    });
  } else {
    const sorted = [...values].sort((a, b) => a - b);
    root = buildBalanced(sorted, 0, sorted.length - 1);
  }
  assignPositions(root, 600, 50, 250);
  return root;
};

export default function TreeTraversalPage() {
  // --- UI State ---
  const [treeMode, setTreeMode] = useState<TreeMode>('BST');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // --- Data State ---
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [algoType, setAlgoType] = useState<
    'In-Order' | 'Pre-Order' | 'Post-Order'
  >('In-Order');
  const [treeTarget, setTreeTarget] = useState<string>('');
  const [activeTreeNode, setActiveTreeNode] = useState<number | null>(null);
  const [visitedTreeNodes, setVisitedTreeNodes] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const {
    runSimulation,
    isPaused,
    activeLine,
    speed,
    setSpeed,
    stopSimulation,
    togglePause,
    hasGenerator,
  } = useAlgorithm([]);

  useEffect(() => {
    randomizeTree('BST');
    setSpeed(10);
  }, [setSpeed]);

  const randomizeTree = (mode: TreeMode = treeMode) => {
    const count = 12 + Math.floor(Math.random() * 5);
    const vals = Array.from(
      { length: count },
      () => Math.floor(Math.random() * 99) + 1,
    );
    setTreeData(generateTreeFromValues(Array.from(new Set(vals)), mode));
    setVisitedTreeNodes([]);
    setActiveTreeNode(null);
  };

  const handleExecute = async () => {
    const startTime = performance.now();
    setVisitedTreeNodes([]);
    const targetVal = treeTarget ? parseInt(treeTarget) : null;

    let gen = (
      algoType === 'Pre-Order'
        ? preOrder
        : algoType === 'Post-Order'
          ? postOrder
          : inOrder
    )(treeData);

    await runSimulation(
      (async function* () {
        let count = 0;
        for await (const step of gen) {
          count++;
          const val = step.activeNode.value;
          setActiveTreeNode(val);
          setVisitedTreeNodes((prev) => [...prev, val]);

          if (targetVal !== null && val === targetVal) {
            yield step;
            break;
          }
          yield step;
        }
        setHistory((prev) =>
          [
            {
              id: Date.now(),
              algorithm: algoType,
              size: count,
              time: Math.round(performance.now() - startTime),
              success: targetVal ? visitedTreeNodes.includes(targetVal) : true,
            },
            ...prev,
          ].slice(0, 10),
        );
      })(),
    );
  };

  // --- Input Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPanRef.current.x,
      y: e.clientY - startPanRef.current.y,
    });
  };

  return (
    <main className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <ExpandableSidebar>
        <NavHeader title="TreeTraverse" subtitle="Hierarchical Engine" />

        <div className="space-y-4">
          <section className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              Traversal Logic
            </h2>
            <div className="flex gap-1">
              {['In-Order', 'Pre-Order', 'Post-Order'].map((m) => (
                <button
                  key={m}
                  onClick={() => setAlgoType(m as any)}
                  className={`flex-1 py-1.5 rounded text-[8px] font-bold transition-all ${
                    algoType === m
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {m.split('-')[0]}
                </button>
              ))}
            </div>
          </section>

          <CodeViewer
            code={
              treeCode[
                algoType === 'Pre-Order'
                  ? 'preOrder'
                  : algoType === 'Post-Order'
                    ? 'postOrder'
                    : 'inOrder'
              ]
            }
            activeLine={activeLine}
          />
          <TelemetryLog history={history} />
        </div>
      </ExpandableSidebar>

      <section className="flex-1 p-6 flex flex-col gap-6 relative">
        <ControlPanel
          size={visitedTreeNodes.length}
          sizeShower={false} // Hidden for trees as size is determined by structure
          speed={speed}
          isPaused={isPaused}
          hasGenerator={hasGenerator}
          viewMode="Tree"
          treeMode={treeMode}
          targetValue={treeTarget ? Number(treeTarget) : undefined}
          onTreeModeChange={(m) => {
            setTreeMode(m);
            randomizeTree(m);
          }}
          onTargetChange={(val) => setTreeTarget(val.toString())}
          onSpeedChange={setSpeed}
          onExecute={handleExecute}
          onStop={stopSimulation}
          onTogglePause={togglePause}
          onShuffle={() => randomizeTree(treeMode)}
          onGenerate={() => randomizeTree(treeMode)}
          // Set unused grid props to empty functions
          onSizeChange={() => {}}
          onStepBack={() => {}}
          onStepForward={() => {}}
          onManualUpdate={() => {}}
          onQuickBenchmark={() => {}}
          onVisualRun={() => {}}
          onStartStepByStep={handleExecute}
          onGeneratePattern={() => {}}
        />

        <div
          className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner relative cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
        >
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <TreeVisualizer
              root={treeData}
              activeNodeId={activeTreeNode}
              visitedNodes={visitedTreeNodes}
            />
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
              className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
              className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700"
            >
              -button
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
