'use client';
import { useState, useCallback } from 'react';
import {
  bubbleSort,
  bubbleSortTraceCode,
  quickSort,
  quickSortTraceCode,
  mergeSort,
  mergeSortTraceCode,
  selectionSort,
  selectionSortTraceCode,
  insertionSort,
  insertionSortTraceCode,
  heapSort,
  heapSortTraceCode,
  shellSort,
  shellSortTraceCode,
  cocktailSort,
  cocktailSortTraceCode,
  gnomeSort,
  gnomeSortTraceCode,
  combSort,
  combSortTraceCode,
  countingSort,
  countingSortTraceCode,
  SortingAlgorithmType,
  sortingComplexities,
  SortStep,
  SortInput,
} from '@/hooks/algorithms/sortingAlgorithms';
import { RawBenchmarkData } from '@/components/BenchmarkModal';
import { LogItem } from '@/components/TelemetryLog';
import { Complexity } from '@/hooks/algorithms/general';

export function useSortingLogic() {
  const [algorithm, setAlgorithm] = useState<SortingAlgorithmType>('Bubble');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [history, setHistory] = useState<LogItem[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<RawBenchmarkData[]>([]);

  const getAlgoData: (type: SortingAlgorithmType) => SortingAlgoData =
    useCallback((type: SortingAlgorithmType) => {
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

export type SortingAlgoData = {
  gen: (input: SortInput) => AsyncGenerator<SortStep>;
  algorithmTraceCode: string;
  complexity: Complexity;
};

function createAlgoData(type: string): SortingAlgoData {
  switch (type) {
    case 'Quick':
      return {
        gen: quickSort,
        algorithmTraceCode: quickSortTraceCode,
        complexity: sortingComplexities.Quick,
      };
    case 'Merge':
      return {
        gen: mergeSort,
        algorithmTraceCode: mergeSortTraceCode,
        complexity: sortingComplexities.Merge,
      };
    case 'Selection':
      return {
        gen: selectionSort,
        algorithmTraceCode: selectionSortTraceCode,
        complexity: sortingComplexities.Selection,
      };
    case 'Insertion': {
      return {
        gen: insertionSort,
        algorithmTraceCode: insertionSortTraceCode,
        complexity: sortingComplexities.Insertion,
      };
    }
    case 'Heap': {
      return {
        gen: heapSort,
        algorithmTraceCode: heapSortTraceCode,
        complexity: sortingComplexities.Heap,
      };
    }
    case 'Shell': {
      return {
        gen: shellSort,
        algorithmTraceCode: shellSortTraceCode,
        complexity: sortingComplexities.Shell,
      };
    }
    case 'Cocktail': {
      return {
        gen: cocktailSort,
        algorithmTraceCode: cocktailSortTraceCode,
        complexity: sortingComplexities.Cocktail,
      };
    }
    case 'Gnome': {
      return {
        gen: gnomeSort,
        algorithmTraceCode: gnomeSortTraceCode,
        complexity: sortingComplexities.Gnome,
      };
    }
    case 'Comb': {
      return {
        gen: combSort,
        algorithmTraceCode: combSortTraceCode,
        complexity: sortingComplexities.Comb,
      };
    }
    case 'Counting': {
      return {
        gen: countingSort,
        algorithmTraceCode: countingSortTraceCode,
        complexity: sortingComplexities.Counting,
      };
    }
    default:
      return {
        gen: bubbleSort,
        algorithmTraceCode: bubbleSortTraceCode,
        complexity: sortingComplexities.Bubble,
      };
  }
}
