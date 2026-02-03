'use client';
import { useState, useRef, useCallback } from 'react';
import { AllStepTypes, VisualState } from './algorithms/general';
import { SortStep } from './algorithms/sortingAlgorithms';
import {
  PathfindingStep,
  PathfindingNode,
} from './algorithms/pathfindingAlgorithms';
import { SearchStep } from './algorithms/searchingAlgorithms';

export const useAlgorithm = (
  initialArray: number[],
  initialGrid: PathfindingNode[][] = [],
) => {
  const [array, setArray] = useState<number[]>(initialArray);
  const [grid, setGrid] = useState<PathfindingNode[][]>(initialGrid);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(50);
  const [comparing, setComparing] = useState<number[] | undefined>([]);
  const [activeLine, setActiveLine] = useState<number>(0);

  const arrayRef = useRef(initialArray);
  const gridRef = useRef(initialGrid);
  const speedRef = useRef(speed);
  const stopRef = useRef(false);
  const pauseRef = useRef(true);

  const historyRef = useRef<VisualState[]>([]);
  const currentStepIdx = useRef(-1);
  const generatorRef = useRef<AsyncGenerator<AllStepTypes> | null>(null);
  const isRunningRef = useRef(false);

  const updateArray = useCallback((newArray: number[]) => {
    arrayRef.current = [...newArray];
    setArray([...newArray]);
  }, []);

  const updateGrid = useCallback((newGrid: PathfindingNode[][]) => {
    gridRef.current = newGrid;
    setGrid(newGrid);
  }, []);

  const handleSetSpeed = useCallback((val: number) => {
    setSpeed(val);
    speedRef.current = val;
  }, []);

  const stopSimulation = useCallback(() => {
    stopRef.current = true;
    pauseRef.current = false;
    isRunningRef.current = false;
    setIsPaused(true);
    setComparing([]);
    setActiveLine(0);
    generatorRef.current = null;
    historyRef.current = [];
    currentStepIdx.current = -1;
  }, []);

  // --- Data Generation ---
  const generateRandom = useCallback(
    (size: number) => {
      stopSimulation();
      const newArray = Array.from(
        { length: size },
        () => Math.floor(Math.random() * 90) + 5,
      );
      updateArray(newArray);
    },
    [updateArray, stopSimulation],
  );

  const generatePattern = useCallback(
    (
      size: number,
      pattern: 'nearly' | 'reversed' | 'sorted' | 'few-unique',
    ) => {
      stopSimulation();
      let newArr = Array.from(
        { length: size },
        (_, i) => Math.floor((i / size) * 90) + 5,
      );
      if (pattern === 'nearly') {
        for (let i = 0; i < newArr.length; i++) {
          if (Math.random() > 0.8) {
            const j = Math.floor(Math.random() * newArr.length);
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
          }
        }
      } else if (pattern === 'reversed') newArr.reverse();
      else if (pattern === 'sorted') newArr.sort((a, b) => a - b);
      else if (pattern === 'few-unique') {
        const values = [20, 40, 60, 80];
        newArr = Array.from(
          { length: size },
          () => values[Math.floor(Math.random() * values.length)],
        );
      }
      updateArray(newArr);
    },
    [updateArray, stopSimulation],
  );

  const shuffleArray = useCallback(() => {
    stopSimulation();
    const shuffled = [...arrayRef.current].sort(() => Math.random() - 0.5);
    updateArray(shuffled);
  }, [updateArray, stopSimulation]);

  // --- Helpers ---
  const sleep = useCallback(
    (ms?: number) =>
      new Promise((resolve) => setTimeout(resolve, ms ?? speedRef.current)),
    [],
  );
  const checkPause = useCallback(async () => {
    while (pauseRef.current && !stopRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, []);
  const togglePause = useCallback(() => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  }, []);

  const startStepByStep = useCallback(
    (algoGenerator: AsyncGenerator<AllStepTypes>) => {
      stopSimulation();
      stopRef.current = false;
      pauseRef.current = true;
      setIsPaused(true);
      generatorRef.current = algoGenerator;
      historyRef.current = [];
      currentStepIdx.current = -1;
    },
    [stopSimulation],
  );

  const runSimulation = useCallback(
    async <T extends AllStepTypes>(
      algoGenerator: AsyncGenerator<T>,
      onStep?: (val: number) => void,
    ) => {
      if (isRunningRef.current && generatorRef.current === algoGenerator) {
        pauseRef.current = false;
        setIsPaused(false);
        return;
      }

      stopRef.current = false;
      pauseRef.current = false;
      setIsPaused(false);
      isRunningRef.current = true;

      if (generatorRef.current !== algoGenerator) {
        generatorRef.current = algoGenerator;
        historyRef.current = [];
        currentStepIdx.current = -1;
      }

      for await (const step of algoGenerator) {
        if (stopRef.current) break;
        await checkPause();
        if (stopRef.current) break;

        const isPathfinding = 'grid' in step;
        const sSort = step as SortStep;
        const sSearch = step as SearchStep;
        const sPath = step as PathfindingStep;

        // Deep copy grid if it exists, otherwise shallow copy array
        const state: VisualState = {
          line: step.line ?? 0,
          array: sSort.array
            ? [...sSort.array]
            : arrayRef.current.length > 0
              ? [...arrayRef.current]
              : undefined,
          grid: sPath.grid
            ? JSON.parse(JSON.stringify(sPath.grid))
            : gridRef.current.length > 0
              ? JSON.parse(JSON.stringify(gridRef.current))
              : undefined,
          comparing: sSort.comparing || sSearch.comparing || [],
          found: sSearch.found,
        };

        historyRef.current.push(state);
        currentStepIdx.current++;

        if (step.line !== undefined) setActiveLine(step.line);

        if (isPathfinding && sPath.grid) {
          updateGrid(sPath.grid);
        } else if (sSort.array) {
          updateArray(sSort.array);
        }

        if (sSort.comparing) {
          setComparing(sSort.comparing);
          if (
            onStep &&
            sSort.comparing.length > 0 &&
            arrayRef.current.length > 0
          ) {
            const val = arrayRef.current[sSort.comparing[0]];
            if (val !== undefined) onStep(val);
          }
        }
        await sleep();
      }
      if (!stopRef.current) stopSimulation();
      isRunningRef.current = false;
    },
    [updateArray, updateGrid, stopSimulation, sleep, checkPause],
  );

  const stepForward = useCallback(async () => {
    if (!generatorRef.current) return;

    if (currentStepIdx.current < historyRef.current.length - 1) {
      currentStepIdx.current++;
      const state = historyRef.current[currentStepIdx.current];
      if (state.array) updateArray(state.array);
      if (state.grid) updateGrid(state.grid);
      setComparing(state.comparing || []);
      setActiveLine(state.line ?? 0);
      return;
    }

    const { value, done } = await generatorRef.current.next();
    if (!done && value) {
      // Cast to specific types to access properties safely
      const valSort = value as SortStep;
      const valSearch = value as SearchStep;
      const valPath = value as PathfindingStep;

      const state: VisualState = {
        line: value.line ?? 0,
        array: valSort.array
          ? [...valSort.array]
          : arrayRef.current.length > 0
            ? [...arrayRef.current]
            : undefined,
        grid: valPath.grid
          ? JSON.parse(JSON.stringify(valPath.grid))
          : gridRef.current.length > 0
            ? JSON.parse(JSON.stringify(gridRef.current))
            : undefined,
        // Fix: Check for comparing on both Sort and Search steps
        comparing: valSort.comparing || valSearch.comparing || [],
      };

      historyRef.current.push(state);
      currentStepIdx.current++;

      if (state.array) updateArray(state.array);
      if (state.grid) updateGrid(state.grid);
      setComparing(state.comparing);
      setActiveLine(state.line);
    } else if (done) {
      stopSimulation();
    }
  }, [updateArray, updateGrid, stopSimulation]);

  const stepBackward = useCallback(() => {
    if (currentStepIdx.current > 0) {
      currentStepIdx.current--;
      const state = historyRef.current[currentStepIdx.current];
      if (state.array) updateArray(state.array);
      if (state.grid) updateGrid(state.grid);
      setComparing(state.comparing || []);
      setActiveLine(state.line ?? 0);
    }
  }, [updateArray, updateGrid]);

  return {
    array,
    grid,
    setArray: updateArray,
    setGrid: updateGrid,
    comparing,
    activeLine,
    isPaused,
    hasGenerator: !!generatorRef.current,
    togglePause,
    speed,
    setSpeed: handleSetSpeed,
    runSimulation,
    stopSimulation,
    startStepByStep,
    stepForward,
    stepBackward,
    generateRandom,
    generatePattern,
    shuffleArray,
    generatorRef,
  };
};
