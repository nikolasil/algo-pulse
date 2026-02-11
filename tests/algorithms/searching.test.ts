import { describe, it, expect } from 'vitest';
import { 
  linearSearch, binarySearch, jumpSearch, 
  interpolationSearch, exponentialSearch 
} from '@/hooks/algorithms/searchingAlgorithms';

describe('Searching Algorithms', () => {
  const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25];
  const unsortedArray = [64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42];

  describe('linearSearch', () => {
    it('should find element in unsorted array', async () => {
      const target = 22;
      let foundIndex = -1;
      
      for await (const step of linearSearch({ array: unsortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(4); // 22 is at index 4
    });

    it('should return -1 for element not found', async () => {
      const target = 99;
      let foundIndex = -1;
      
      for await (const step of linearSearch({ array: unsortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should handle empty array', async () => {
      const target = 5;
      let foundIndex = -1;
      
      for await (const step of linearSearch({ array: [], target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should track comparing indices correctly', async () => {
      const target = 22;
      const comparingSteps = [];
      
      for await (const step of linearSearch({ array: unsortedArray, target })) {
        if (step.comparing) {
          comparingSteps.push(step.comparing);
        }
      }
      
      expect(comparingSteps.length).toBeGreaterThan(0);
      expect(comparingSteps[0]).toHaveLength(1); // Linear search compares one element at a time
    });
  });

  describe('binarySearch', () => {
    it('should find element in sorted array', async () => {
      const target = 13;
      let foundIndex = -1;
      
      for await (const step of binarySearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(6); // 13 is at index 6
    });

    it('should return -1 for element not found', async () => {
      const target = 8;
      let foundIndex = -1;
      
      for await (const step of binarySearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should handle empty array', async () => {
      const target = 5;
      let foundIndex = -1;
      
      for await (const step of binarySearch({ array: [], target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should track range correctly', async () => {
      const target = 13;
      const rangeSteps = [];
      
      for await (const step of binarySearch({ array: sortedArray, target })) {
        if (step.range) {
          rangeSteps.push(step.range);
        }
      }
      
      expect(rangeSteps.length).toBeGreaterThan(0);
      expect(rangeSteps[0]).toHaveLength(2); // Should have start and end indices
    });
  });

  describe('jumpSearch', () => {
    it('should find element in sorted array', async () => {
      const target = 17;
      let foundIndex = -1;
      
      for await (const step of jumpSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(8); // 17 is at index 8
    });

    it('should return -1 for element not found', async () => {
      const target = 8;
      let foundIndex = -1;
      
      for await (const step of jumpSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should handle empty array', async () => {
      const target = 5;
      let foundIndex = -1;
      
      for await (const step of jumpSearch({ array: [], target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });
  });

  describe('interpolationSearch', () => {
    it('should find element in sorted array', async () => {
      const target = 15;
      let foundIndex = -1;
      
      for await (const step of interpolationSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(7); // 15 is at index 7
    });

    it('should return -1 for element not found', async () => {
      const target = 8;
      let foundIndex = -1;
      
      for await (const step of interpolationSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should handle empty array', async () => {
      const target = 5;
      let foundIndex = -1;
      
      for await (const step of interpolationSearch({ array: [], target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });
  });

  describe('exponentialSearch', () => {
    it('should find element in sorted array', async () => {
      const target = 19;
      let foundIndex = -1;
      
      for await (const step of exponentialSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(9); // 19 is at index 9
    });

    it('should return -1 for element not found', async () => {
      const target = 8;
      let foundIndex = -1;
      
      for await (const step of exponentialSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should handle empty array', async () => {
      const target = 5;
      let foundIndex = -1;
      
      for await (const step of exponentialSearch({ array: [], target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(-1);
    });

    it('should find first element', async () => {
      const target = 1;
      let foundIndex = -1;
      
      for await (const step of exponentialSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(0);
    });

    it('should find last element', async () => {
      const target = 25;
      let foundIndex = -1;
      
      for await (const step of exponentialSearch({ array: sortedArray, target })) {
        if (step.found !== undefined) {
          foundIndex = step.found;
          break;
        }
      }
      
      expect(foundIndex).toBe(12); // 25 is at index 12
    });
  });
});