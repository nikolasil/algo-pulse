'use client';

import { useState, useCallback } from 'react';
import {
  dijkstra,
  aStar,
  greedyBestFirst,
  dijkstraCode,
  aStarCode,
  greedyCode,
  bfs,
  bfsCode,
  dfs,
  dfsCode,
  HeuristicType,
} from '@/algorithms/pathfindingAlgorithms';
import { RawBenchmarkData } from '@/components/BenchmarkModal';

export type AlgorithmType = 'Dijkstra' | 'A*' | 'Greedy' | 'BFS' | 'DFS';

export function usePathfindingLogic() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('Dijkstra');
  const [heuristic, setHeuristic] = useState<HeuristicType>('Manhattan');
  const [brush, setBrush] = useState<'Wall' | 'Mud'>('Wall');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<RawBenchmarkData[]>([]);
  const [history, setHistory] = useState<
    {
      id: number;
      algorithm: string;
      size: number;
      time: number;
      success: boolean;
      pathLength?: number;
    }[]
  >([]);

  const getAlgoData = useCallback((type: AlgorithmType) => {
    switch (type) {
      case 'A*':
        return { gen: aStar, code: aStarCode, complexity: 'O(E log V)' };
      case 'Greedy':
        return { gen: greedyBestFirst, code: greedyCode, complexity: 'O(b^m)' };
      case 'BFS':
        return { gen: bfs, code: bfsCode, complexity: 'O(V + E)' };
      case 'DFS':
        return { gen: dfs, code: dfsCode, complexity: 'O(V + E)' };
      default:
        return { gen: dijkstra, code: dijkstraCode, complexity: 'O(E log V)' };
    }
  }, []);

  return {
    algorithm,
    setAlgorithm,
    heuristic,
    setHeuristic,
    brush,
    setBrush,
    isBenchmarking,
    setIsBenchmarking,
    benchmarkResults,
    setBenchmarkResults,
    history,
    setHistory,
    getAlgoData,
  };
}
