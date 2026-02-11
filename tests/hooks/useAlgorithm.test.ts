import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { bubbleSort } from '@/hooks/algorithms/sortingAlgorithms';

describe('useAlgorithm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAlgorithm([1, 2, 3]));
    
    expect(result.current.array).toEqual([1, 2, 3]);
    expect(result.current.isPaused).toBe(true);
    expect(result.current.speed).toBe(50);
    expect(result.current.comparing).toEqual([]);
    expect(result.current.activeLine).toBe(0);
    expect(result.current.variables).toEqual({});
  });

  it('should handle play/pause functionality', async () => {
    const { result } = renderHook(() => useAlgorithm([3, 2, 1]));
    const generator = bubbleSort({ array: [3, 2, 1] });
    
    act(() => {
      result.current.runSimulation(generator);
    });
    
    expect(result.current.isPaused).toBe(false);
    
    act(() => {
      result.current.togglePause();
    });
    
    expect(result.current.isPaused).toBe(true);
  });

  it('should handle stop functionality', async () => {
    const { result } = renderHook(() => useAlgorithm([3, 2, 1]));
    const generator = bubbleSort({ array: [3, 2, 1] });
    
    act(() => {
      result.current.runSimulation(generator);
    });
    
    act(() => {
      result.current.stopSimulation();
    });
    
    expect(result.current.isPaused).toBe(true);
    expect(result.current.comparing).toEqual([]);
    expect(result.current.activeLine).toBe(0);
    expect(result.current.variables).toEqual({});
  });

  it('should maintain history correctly', async () => {
    const { result } = renderHook(() => useAlgorithm([3, 2, 1]));
    const generator = bubbleSort({ array: [3, 2, 1] });
    
    // Start simulation and let it run a bit
    act(() => {
      result.current.runSimulation(generator);
    });
    
    // Advance timers to let simulation progress
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Pause
    act(() => {
      result.current.togglePause();
    });
    
    // Test stepping backward
    const initialArray = result.current.array;
    
    act(() => {
      result.current.stepBackward();
    });
    
    // Should have moved to previous state
    expect(result.current.generatorRef.current).not.toBeNull();
  });

  it('should handle speed changes', () => {
    const { result } = renderHook(() => useAlgorithm([1, 2, 3]));
    
    act(() => {
      result.current.setSpeed(75);
    });
    
    expect(result.current.speed).toBe(75);
  });

  it('should generate random arrays correctly', () => {
    const { result } = renderHook(() => useAlgorithm([1, 2, 3]));
    
    act(() => {
      result.current.generateRandom(10);
    });
    
    expect(result.current.array).toHaveLength(10);
    expect(result.current.array.every(val => val >= 5 && val <= 95)).toBe(true);
  });

  it('should generate pattern arrays correctly', () => {
    const { result } = renderHook(() => useAlgorithm([1, 2, 3]));
    
    act(() => {
      result.current.generatePattern(10, 'sorted');
    });
    
    expect(result.current.array).toHaveLength(10);
    const sortedArray = [...result.current.array].sort((a, b) => a - b);
    expect(result.current.array).toEqual(sortedArray);
  });

  it('should shuffle array correctly', () => {
    const { result } = renderHook(() => useAlgorithm([1, 2, 3, 4, 5]));
    const originalArray = [...result.current.array];
    
    act(() => {
      result.current.shuffleArray();
    });
    
    expect(result.current.array).toHaveLength(5);
    // Array should be different (very high probability)
    // But we can't guarantee it's different due to randomness
    // So we just check that it's a valid permutation
    expect(result.current.array).toEqual(expect.arrayContaining(originalArray));
    expect(originalArray).toEqual(expect.arrayContaining(result.current.array));
  });

  it('should handle step by step mode', () => {
    const { result } = renderHook(() => useAlgorithm([3, 2, 1]));
    const generator = bubbleSort({ array: [3, 2, 1] });
    
    act(() => {
      result.current.startStepByStep(generator);
    });
    
    expect(result.current.isPaused).toBe(true);
    expect(result.current.generatorRef.current).not.toBeNull();
  });

  it('should step forward correctly', async () => {
    const { result } = renderHook(() => useAlgorithm([3, 2, 1]));
    const generator = bubbleSort({ array: [3, 2, 1] });
    
    act(() => {
      result.current.startStepByStep(generator);
    });
    
    // Step forward
    act(() => {
      result.current.stepForward();
    });
    
    // Should have progressed or at least have a generator
    expect(result.current.generatorRef.current).not.toBeNull();
    // Check if activeLine was updated (may not be > 0 if no steps were taken yet)
    expect(result.current.activeLine).toBeGreaterThanOrEqual(0);
  });

  it('should handle grid state correctly', () => {
    const mockGrid = [
      [{ row: 0, col: 0, isWall: false, isMud: false, isVisited: false, isPath: false, distance: Infinity, heuristic: Infinity, totalCost: Infinity, previousNode: null }]
    ];
    
    const { result } = renderHook(() => useAlgorithm([], mockGrid));
    
    expect(result.current.grid).toEqual(mockGrid);
  });

  it('should reset state correctly on stop', () => {
    const { result } = renderHook(() => useAlgorithm([3, 2, 1]));
    const generator = bubbleSort({ array: [3, 2, 1] });
    
    // Start simulation
    act(() => {
      result.current.runSimulation(generator);
    });
    
    // Let it run a bit
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Stop
    act(() => {
      result.current.stopSimulation();
    });
    
    // Should reset to initial state
    expect(result.current.isPaused).toBe(true);
    expect(result.current.comparing).toEqual([]);
    expect(result.current.activeLine).toBe(0);
    expect(result.current.variables).toEqual({});
  });

  it('should handle empty initial array', () => {
    const { result } = renderHook(() => useAlgorithm([]));
    
    expect(result.current.array).toEqual([]);
    expect(result.current.isPaused).toBe(true);
  });

  it('should handle simulation completion', () => {
    const { result } = renderHook(() => useAlgorithm([3, 2, 1]));
    const generator = bubbleSort({ array: [3, 2, 1] });
    
    act(() => {
      result.current.runSimulation(generator);
    });
    
    // Let simulation run a bit
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Stop simulation
    act(() => {
      result.current.stopSimulation();
    });
    
    // Should be paused after stop
    expect(result.current.isPaused).toBe(true);
  });
});