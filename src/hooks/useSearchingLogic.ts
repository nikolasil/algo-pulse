'use client';
import { useState, useCallback } from 'react';
import {
  linearSearch,
  linearSearchCode,
  binarySearch,
  binarySearchCode,
  jumpSearch,
  jumpSearchCode,
} from '@/algorithms/searchingAlgorithms';

export type AlgorithmType = 'Linear' | 'Binary' | 'Jump';

export function useSearchingLogic() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('Linear');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [quickResults, setQuickResults] = useState<any[]>([]);

  const getAlgoData = useCallback((type: AlgorithmType) => {
    switch (type) {
      case 'Binary':
        return {
          gen: binarySearch,
          code: binarySearchCode,
          complexity: 'O(log n)',
        };
      case 'Jump':
        return { gen: jumpSearch, code: jumpSearchCode, complexity: 'O(√n)' };
      default:
        return {
          gen: linearSearch,
          code: linearSearchCode,
          complexity: 'O(n)',
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
