import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('Array Generation', () => {
    it('should generate random array with correct size', () => {
      const generateRandomArray = (size: number) => {
        return Array.from(
          { length: size },
          () => Math.floor(Math.random() * 90) + 5,
        );
      };

      const array = generateRandomArray(10);
      
      expect(array).toHaveLength(10);
      expect(array.every(val => val >= 5 && val <= 95)).toBe(true);
    });

    it('should generate sorted pattern array', () => {
      const generatePatternArray = (size: number, pattern: string) => {
        let arr = Array.from(
          { length: size },
          (_, i) => Math.floor((i / size) * 90) + 5,
        );
        
        if (pattern === 'sorted') {
          arr.sort((a, b) => a - b);
        }
        
        return arr;
      };

      const array = generatePatternArray(10, 'sorted');
      
      expect(array).toHaveLength(10);
      const sortedArray = [...array].sort((a, b) => a - b);
      expect(array).toEqual(sortedArray);
    });

    it('should generate reversed pattern array', () => {
      const generatePatternArray = (size: number, pattern: string) => {
        let arr = Array.from(
          { length: size },
          (_, i) => Math.floor((i / size) * 90) + 5,
        );
        
        if (pattern === 'reversed') {
          arr.sort((a, b) => b - a);
        }
        
        return arr;
      };

      const array = generatePatternArray(10, 'reversed');
      
      expect(array).toHaveLength(10);
      const reversedArray = [...array].sort((a, b) => b - a);
      expect(array).toEqual(reversedArray);
    });

    it('should generate nearly sorted pattern array', () => {
      const generatePatternArray = (size: number, pattern: string) => {
        let arr = Array.from(
          { length: size },
          (_, i) => Math.floor((i / size) * 90) + 5,
        );
        
        if (pattern === 'nearly') {
          for (let i = 0; i < arr.length; i++) {
            if (Math.random() > 0.8) {
              const j = Math.floor(Math.random() * arr.length);
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
          }
        }
        
        return arr;
      };

      const array = generatePatternArray(20, 'nearly');
      
      expect(array).toHaveLength(20);
      // Should be mostly sorted (within reason)
      let inversions = 0;
      for (let i = 0; i < array.length - 1; i++) {
        if (array[i] > array[i + 1]) {
          inversions++;
        }
      }
      // Should have some inversions but not too many
      expect(inversions).toBeGreaterThan(0);
      expect(inversions).toBeLessThan(array.length / 2);
    });

    it('should generate few unique pattern array', () => {
      const generatePatternArray = (size: number, pattern: string) => {
        let arr: number[] = [];
        
        if (pattern === 'few-unique') {
          const values = [20, 40, 60, 80];
          arr = Array.from(
            { length: size },
            () => values[Math.floor(Math.random() * values.length)],
          );
        }
        
        return arr;
      };

      const array = generatePatternArray(10, 'few-unique');
      
      expect(array).toHaveLength(10);
      const uniqueValues = new Set(array);
      expect(uniqueValues.size).toBeLessThanOrEqual(4);
      expect(Array.from(uniqueValues)).toEqual(expect.arrayContaining([20, 40, 60, 80]));
    });
  });

  describe('Array Utilities', () => {
    it('should shuffle array correctly', () => {
      const shuffleArray = (array: number[]) => {
        return [...array].sort(() => Math.random() - 0.5);
      };

      const originalArray = [1, 2, 3, 4, 5];
      const shuffledArray = shuffleArray(originalArray);
      
      expect(shuffledArray).toHaveLength(5);
      expect(shuffledArray).toEqual(expect.arrayContaining(originalArray));
      // Very high probability that arrays are different
      expect(shuffledArray).not.toEqual(originalArray);
    });

    it('should handle empty array shuffle', () => {
      const shuffleArray = (array: number[]) => {
        return [...array].sort(() => Math.random() - 0.5);
      };

      const emptyArray: number[] = [];
      const shuffledArray = shuffleArray(emptyArray);
      
      expect(shuffledArray).toEqual([]);
    });

    it('should handle single element array shuffle', () => {
      const shuffleArray = (array: number[]) => {
        return [...array].sort(() => Math.random() - 0.5);
      };

      const singleArray = [42];
      const shuffledArray = shuffleArray(singleArray);
      
      expect(shuffledArray).toEqual([42]);
    });
  });

  describe('Validation Utilities', () => {
    it('should validate array input', () => {
      const validateArray = (array: any): array is number[] => {
        return Array.isArray(array) && array.every(item => typeof item === 'number');
      };

      expect(validateArray([1, 2, 3])).toBe(true);
      expect(validateArray([])).toBe(true);
      expect(validateArray([1, '2', 3])).toBe(false);
      expect(validateArray('not an array')).toBe(false);
      expect(validateArray(null)).toBe(false);
      expect(validateArray(undefined)).toBe(false);
    });

    it('should validate number range', () => {
      const validateNumberRange = (num: number, min: number, max: number): boolean => {
        return typeof num === 'number' && num >= min && num <= max;
      };

      expect(validateNumberRange(50, 0, 100)).toBe(true);
      expect(validateNumberRange(0, 0, 100)).toBe(true);
      expect(validateNumberRange(100, 0, 100)).toBe(true);
      expect(validateNumberRange(-1, 0, 100)).toBe(false);
      expect(validateNumberRange(101, 0, 100)).toBe(false);
      expect(validateNumberRange(50.5, 0, 100)).toBe(true);
    });
  });

  describe('Performance Utilities', () => {
    it('should measure execution time', async () => {
      const measureTime = async (fn: () => Promise<void>): Promise<number> => {
        const start = performance.now();
        await fn();
        return performance.now() - start;
      };

      const mockAsyncFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      };

      const executionTime = await measureTime(mockAsyncFunction);
      
      expect(executionTime).toBeGreaterThan(90); // Should take at least 100ms
      expect(executionTime).toBeLessThan(200); // But not too much more
    });

    it('should calculate array statistics', () => {
      const calculateStats = (array: number[]) => {
        if (array.length === 0) {
          return { min: 0, max: 0, mean: 0, median: 0 };
        }

        const sorted = [...array].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

        return { min, max, mean, median };
      };

      const array = [1, 2, 3, 4, 5];
      const stats = calculateStats(array);
      
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(5);
      expect(stats.mean).toBe(3);
      expect(stats.median).toBe(3);
    });

    it('should handle empty array statistics', () => {
      const calculateStats = (array: number[]) => {
        if (array.length === 0) {
          return { min: 0, max: 0, mean: 0, median: 0 };
        }

        const sorted = [...array].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

        return { min, max, mean, median };
      };

      const emptyArray: number[] = [];
      const stats = calculateStats(emptyArray);
      
      expect(stats).toEqual({ min: 0, max: 0, mean: 0, median: 0 });
    });
  });
});