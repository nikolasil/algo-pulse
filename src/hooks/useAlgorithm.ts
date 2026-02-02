'use client';
import { useState, useRef, useCallback } from 'react';

export const useAlgorithm = (initialArray: number[]) => {
  const [array, setArray] = useState<number[]>(initialArray);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(50);
  const [comparing, setComparing] = useState<number[]>([]);
  const [activeLine, setActiveLine] = useState<number>(0);

  const arrayRef = useRef(initialArray);
  const speedRef = useRef(speed);
  const stopRef = useRef(false);
  const pauseRef = useRef(true);
  const historyRef = useRef<any[]>([]);
  const currentStepIdx = useRef(-1);
  const generatorRef = useRef<AsyncGenerator<any> | null>(null);
  const isRunningRef = useRef(false);

  const updateArray = useCallback((newArray: number[]) => {
    arrayRef.current = [...newArray];
    setArray([...newArray]);
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

  // --- Data Generation Logic ---
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
    (size: number, pattern: 'nearly' | 'reversed' | 'sorted' | 'few-unique') => {
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
      } else if (pattern === 'reversed') {
        newArr.reverse();
      } else if (pattern === 'sorted') {
        newArr.sort((a, b) => a - b);
      } else if (pattern === 'few-unique') {
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

  // --- Execution Logic ---
  const sleep = (ms?: number) =>
    new Promise((resolve) => setTimeout(resolve, ms ?? speedRef.current));

  const checkPause = async () => {
    while (pauseRef.current && !stopRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const togglePause = useCallback(() => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  }, []);

  const startStepByStep = useCallback(
    (algoGenerator: AsyncGenerator<any>) => {
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
    async (
      algoGenerator: AsyncGenerator<any>,
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

        const state = {
          array: step.array ? [...step.array] : [...arrayRef.current],
          comparing: step.comparing ? [...step.comparing] : [],
          line: step.line ?? 0,
        };
        historyRef.current.push(state);
        currentStepIdx.current++;

        if (step.line !== undefined) setActiveLine(step.line);
        if (step.array) updateArray(step.array);
        if (step.comparing) {
          setComparing(step.comparing);
          if (onStep && step.comparing.length > 0)
            onStep(arrayRef.current[step.comparing[0]]);
        }
        await sleep();
      }

      if (!stopRef.current) stopSimulation();
      isRunningRef.current = false;
    },
    [updateArray, stopSimulation],
  );

  const stepForward = useCallback(async () => {
    if (!generatorRef.current) return;
    if (currentStepIdx.current < historyRef.current.length - 1) {
      currentStepIdx.current++;
      const state = historyRef.current[currentStepIdx.current];
      updateArray(state.array);
      setComparing(state.comparing);
      setActiveLine(state.line);
      return;
    }
    const { value, done } = await generatorRef.current.next();
    if (!done && value) {
      const state = {
        array: value.array ? [...value.array] : [...arrayRef.current],
        comparing: value.comparing ? [...value.comparing] : [],
        line: value.line ?? 0,
      };
      historyRef.current.push(state);
      currentStepIdx.current++;
      updateArray(state.array);
      setComparing(state.comparing);
      setActiveLine(state.line);
    } else if (done) {
      stopSimulation();
    }
  }, [updateArray, stopSimulation]);

  const stepBackward = useCallback(() => {
    if (currentStepIdx.current > 0) {
      currentStepIdx.current--;
      const state = historyRef.current[currentStepIdx.current];
      updateArray(state.array);
      setComparing(state.comparing);
      setActiveLine(state.line);
    }
  }, [updateArray]);

  return {
    array,
    setArray: updateArray,
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
