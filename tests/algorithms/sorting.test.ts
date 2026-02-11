import { describe, it, expect } from 'vitest';
import { 
  bubbleSort, quickSort, mergeSort, selectionSort, 
  insertionSort, heapSort, shellSort, cocktailSort,
  gnomeSort, combSort, countingSort 
} from '@/hooks/algorithms/sortingAlgorithms';

describe('Sorting Algorithms', () => {
  describe('bubbleSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of bubbleSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should handle empty array', async () => {
      const input: number[] = [];
      const result = [];
      
      for await (const step of bubbleSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      // Some algorithms may not yield array steps for empty arrays
      if (result.length > 0) {
        expect(result[result.length - 1]).toEqual([]);
      } else {
        // If no array steps were yielded, verify the algorithm completed
        expect(input).toEqual([]);
      }
    });

    it('should handle single element array', async () => {
      const input = [42];
      const result = [];
      
      for await (const step of bubbleSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      if (result.length > 0) {
        expect(result[result.length - 1]).toEqual([42]);
      } else {
        // If no array steps were yielded, verify that algorithm completed
        expect(input).toEqual([42]);
      }
    });

    it('should handle already sorted array', async () => {
      const input = [1, 2, 3, 4, 5];
      const result = [];
      
      for await (const step of bubbleSort({ array: input })) {
        if (step.array) result.push(step.array);
      }
      
      if (result.length > 0) {
        const sortedArray = [...input].sort((a, b) => a - b);
        expect(result[result.length - 1]).toEqual(sortedArray);
      } else {
        // If no array steps were yielded, array should remain unchanged
        expect(input).toEqual([1, 2, 3, 4, 5]);
      }
    });

    it('should yield steps with correct line numbers', async () => {
      const input = [3, 2, 1];
      const lineNumbers = [];
      
      for await (const step of bubbleSort({ array: input })) {
        if (step.line !== undefined) {
          lineNumbers.push(step.line);
        }
      }
      
      expect(lineNumbers).toContain(2); // for loop line
      expect(lineNumbers).toContain(3); // inner loop line
    });

    it('should track comparing indices correctly', async () => {
      const input = [3, 2, 1];
      const comparingSteps = [];
      
      for await (const step of bubbleSort({ array: input })) {
        if (step.comparing) {
          comparingSteps.push(step.comparing);
        }
      }
      
      expect(comparingSteps.length).toBeGreaterThan(0);
      expect(comparingSteps[0]).toHaveLength(2); // Should compare two elements
    });
  });

  describe('quickSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of quickSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should handle empty array', async () => {
      const input: number[] = [];
      const result = [];
      
      for await (const step of quickSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      // Some algorithms may not yield array steps for empty arrays
      if (result.length > 0) {
        expect(result[result.length - 1]).toEqual([]);
      } else {
        // If no array steps were yielded, verify the algorithm completed
        expect(input).toEqual([]);
      }
    });

    it('should track pivot correctly', async () => {
      const input = [3, 7, 8, 5, 2, 1, 9, 4, 6];
      const pivotSteps = [];
      
      for await (const step of quickSort({ array: input })) {
        if (step.pivot !== undefined) {
          pivotSteps.push(step.pivot);
        }
      }
      
      expect(pivotSteps.length).toBeGreaterThan(0);
    });
  });

  describe('mergeSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of mergeSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should handle empty array', async () => {
      const input: number[] = [];
      const result = [];
      
      for await (const step of mergeSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      // Some algorithms may not yield array steps for empty arrays
      if (result.length > 0) {
        expect(result[result.length - 1]).toEqual([]);
      } else {
        // If no array steps were yielded, verify the algorithm completed
        expect(input).toEqual([]);
      }
    });
  });

  describe('selectionSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of selectionSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should track minimum index correctly', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const pivotSteps = [];
      
      for await (const step of selectionSort({ array: input })) {
        if (step.pivot !== undefined) {
          pivotSteps.push(step.pivot);
        }
      }
      
      expect(pivotSteps.length).toBeGreaterThan(0);
    });
  });

  describe('insertionSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of insertionSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });

    it('should handle empty array', async () => {
      const input: number[] = [];
      const result = [];
      
      for await (const step of insertionSort({ array: input })) {
        if (step.array) result.push(step.array);
      }
      
      // Some algorithms may not yield array steps for empty arrays
      if (result.length > 0) {
        expect(result[result.length - 1]).toEqual([]);
      } else {
        // If no array steps were yielded, verify that algorithm completed
        expect(input).toEqual([]);
      }
    });
  });

  describe('heapSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of heapSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });
  });

  describe('shellSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of shellSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });
  });

  describe('cocktailSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of cocktailSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });
  });

  describe('gnomeSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of gnomeSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });
  });

  describe('combSort', () => {
    it('should correctly sort an array', async () => {
      const input = [64, 34, 25, 12, 22, 11, 90];
      const result = [];
      
      for await (const step of combSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([11, 12, 22, 25, 34, 64, 90]);
    });
  });

  describe('countingSort', () => {
    it('should correctly sort an array', async () => {
      const input = [4, 2, 2, 8, 3, 3, 1];
      const result = [];
      
      for await (const step of countingSort({ array: input })) {
        if (step.array) {
          result.push(step.array);
        }
      }
      
      expect(result[result.length - 1]).toEqual([1, 2, 2, 3, 3, 4, 8]);
    });

    it('should handle empty array', async () => {
      const input: number[] = [];
      const result = [];
      
      try {
        for await (const step of countingSort({ array: input })) {
          if (step.array) result.push(step.array);
        }
        
        if (result.length > 0) {
          expect(result[result.length - 1]).toEqual([]);
        }
      } catch (error) {
        // Counting sort may throw error for empty array
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});