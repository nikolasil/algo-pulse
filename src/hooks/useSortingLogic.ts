'use client';
import { useState, useCallback } from 'react';
import {
  bubbleSort,
  bubbleSortCode,
  quickSort,
  quickSortCode,
  mergeSort,
  mergeSortCode,
} from '@/algorithms/sortingAlgorithms';
import { RawBenchmarkData } from '@/components/BenchmarkModal';

export type AlgorithmType = 'Bubble' | 'Quick' | 'Merge';

export function useSortingLogic() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('Bubble');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [quickResults, setQuickResults] = useState<any[]>([]);
  const [history, setHistory] = useState<
    { id: number; algorithm: string; size: number; time: number }[]
  >([]);
  const [benchmarkData, setBenchmarkData] = useState<RawBenchmarkData[]>([]);

  const getAlgoData = useCallback((type: AlgorithmType) => {
    switch (type) {
      case 'Quick':
        return {
          gen: quickSort,
          code: quickSortCode,
          complexity: 'O(n log n)',
        };
      case 'Merge':
        return {
          gen: mergeSort,
          code: mergeSortCode,
          complexity: 'O(n log n)',
        };
      default:
        return {
          gen: bubbleSort,
          code: bubbleSortCode,
          complexity: 'O(n²)',
        };
    }
  }, []);

  return {
    algorithm,
    setAlgorithm,
    isBenchmarking,
    setIsBenchmarking,
    showQuickReport,
    setShowQuickReport,
    history,
    setHistory,
    benchmarkData,
    setBenchmarkData,
    quickResults,
    setQuickResults,
    getAlgoData,
  };
}
