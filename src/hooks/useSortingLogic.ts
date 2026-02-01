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

export type AlgorithmType = 'bubble' | 'quick' | 'merge';

export function useSortingLogic() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bubble');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [quickResults, setQuickResults] = useState<any[]>([]);

  const getAlgoData = useCallback((type: AlgorithmType) => {
    switch (type) {
      case 'quick':
        return {
          gen: quickSort,
          code: quickSortCode,
          complexity: 'O(n log n)',
          color: 'text-emerald-400',
        };
      case 'merge':
        return {
          gen: mergeSort,
          code: mergeSortCode,
          complexity: 'O(n log n)',
          color: 'text-emerald-400',
        };
      default:
        return {
          gen: bubbleSort,
          code: bubbleSortCode,
          complexity: 'O(n²)',
          color: 'text-rose-400',
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
    quickResults,
    setQuickResults,
    getAlgoData,
  };
}
