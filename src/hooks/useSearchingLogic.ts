'use client';
import { useState, useCallback } from 'react';
import {
  linearSearch,
  linearSearchTraceCode,
  binarySearch,
  binarySearchTraceCode,
  jumpSearch,
  jumpSearchTraceCode,
  interpolationSearch,
  interpolationSearchTraceCode,
  exponentialSearch,
  exponentialSearchTraceCode,
  SearchStep,
  searchComplexities,
  SearchInput,
  SearchAlgorithmType,
} from '@/hooks/algorithms/searchingAlgorithms';
import { RawBenchmarkData } from '@/components/BenchmarkModal';
import { LogItem } from '@/components/TelemetryLog';
import { Complexity } from '@/hooks/algorithms/general';

export function useSearchingLogic() {
  const [algorithm, setAlgorithm] = useState<SearchAlgorithmType>('Linear');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [history, setHistory] = useState<LogItem[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<RawBenchmarkData[]>([]);

  const getAlgoData = useCallback((type: SearchAlgorithmType) => {
    return createAlgoData(type);
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
    getAlgoData,
  };
}

export type SearchingAlgoData = {
  gen: (input: SearchInput) => AsyncGenerator<SearchStep>;
  algorithmTraceCode: string;
  complexity: Complexity;
};

function createAlgoData(type: SearchAlgorithmType): SearchingAlgoData {
  switch (type) {
    case 'Binary':
      return {
        gen: binarySearch,
        algorithmTraceCode: binarySearchTraceCode,
        complexity: searchComplexities.Binary,
      };
    case 'Jump':
      return {
        gen: jumpSearch,
        algorithmTraceCode: jumpSearchTraceCode,
        complexity: searchComplexities.Jump,
      };
    case 'Interpolation':
      return {
        gen: interpolationSearch,
        algorithmTraceCode: interpolationSearchTraceCode,
        complexity: searchComplexities.Interpolation,
      };
    case 'Exponential':
      return {
        gen: exponentialSearch,
        algorithmTraceCode: exponentialSearchTraceCode,
        complexity: searchComplexities.Exponential,
      };
    default:
      return {
        gen: linearSearch,
        algorithmTraceCode: linearSearchTraceCode,
        complexity: searchComplexities.Linear,
      };
  }
}
