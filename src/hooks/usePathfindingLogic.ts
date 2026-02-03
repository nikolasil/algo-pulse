'use client';

import { useState, useCallback } from 'react';
import {
  dijkstra,
  aStar,
  greedyBestFirst,
  dijkstraTraceCode,
  aStarTraceCode,
  greedyTraceCode,
  bfs,
  bfsTraceCode,
  dfs,
  dfsTraceCode,
  PathfindingHeuristicType,
  PathfindingAlgorithmType,
  PathfindingComplexities,
  PathfindingInput,
  PathfindingStep,
  PathfindingOptions,
} from '@/hooks/algorithms/pathfindingAlgorithms';
import { RawBenchmarkData } from '@/components/BenchmarkModal';
import { LogItem } from '@/components/TelemetryLog';
import { Complexity } from './algorithms/general';

export function usePathfindingLogic() {
  const [algorithm, setAlgorithm] =
    useState<PathfindingAlgorithmType>('Dijkstra');
  const [heuristic, setHeuristic] =
    useState<PathfindingHeuristicType>('Manhattan');
  const [brush, setBrush] = useState<'Wall' | 'Mud'>('Wall');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [history, setHistory] = useState<LogItem[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<RawBenchmarkData[]>(
    [],
  );

  const getAlgoData = useCallback((type: PathfindingAlgorithmType) => {
    return createAlgoData(type);
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

export type PathfindingAlgoData<
  T extends PathfindingOptions = PathfindingOptions,
> = {
  gen: (input: PathfindingInput<T>) => AsyncGenerator<PathfindingStep>;
  algorithmTraceCode: string;
  complexity: Complexity;
};

export function createAlgoData(
  type: PathfindingAlgorithmType,
):
  | PathfindingAlgoData<{ heuristic: PathfindingHeuristicType }>
  | PathfindingAlgoData<PathfindingOptions> {
  switch (type) {
    case 'A*':
      return {
        gen: aStar,
        algorithmTraceCode: aStarTraceCode,
        complexity: PathfindingComplexities['A*'],
      };
    case 'Greedy':
      return {
        gen: greedyBestFirst,
        algorithmTraceCode: greedyTraceCode,
        complexity: PathfindingComplexities.Greedy,
      };
    case 'BFS':
      return {
        gen: bfs,
        algorithmTraceCode: bfsTraceCode,
        complexity: PathfindingComplexities.BFS,
      };
    case 'DFS':
      return {
        gen: dfs,
        algorithmTraceCode: dfsTraceCode,
        complexity: PathfindingComplexities.DFS,
      };
    default:
      return {
        gen: dijkstra,
        algorithmTraceCode: dijkstraTraceCode,
        complexity: PathfindingComplexities.Dijkstra,
      };
  }
}
