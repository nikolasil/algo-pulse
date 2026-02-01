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

  const updateArray = useCallback((newArray: number[]) => {
    arrayRef.current = [...newArray];
    setArray([...newArray]);
  }, []);

  const handleSetSpeed = useCallback((val: number) => {
    setSpeed(val);
    speedRef.current = val;
  }, []);

  const sleep = (ms?: number) =>
    new Promise((resolve) => setTimeout(resolve, ms ?? speedRef.current));

  const checkPause = async () => {
    while (pauseRef.current && !stopRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  const stopSimulation = useCallback(() => {
    stopRef.current = true;
    pauseRef.current = false;
    setIsPaused(true);
    setComparing([]);
    setActiveLine(0);
    generatorRef.current = null;
  }, []);

  const togglePause = useCallback(() => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(pauseRef.current);
  }, []);

  const runSimulation = useCallback(
    async (
      algoGenerator: AsyncGenerator<any>,
      onStep?: (val: number) => void,
    ) => {
      stopRef.current = false;
      pauseRef.current = false;
      setIsPaused(false);
      generatorRef.current = algoGenerator;
      historyRef.current = [];
      currentStepIdx.current = -1;

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

      if (!stopRef.current) {
        setActiveLine(0);
        setComparing([]);
        setIsPaused(true);
        pauseRef.current = true;
      }
    },
    [updateArray],
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
    }
  }, [updateArray]);

  const stepBackward = useCallback(() => {
    if (currentStepIdx.current > 0) {
      currentStepIdx.current--;
      const state = historyRef.current[currentStepIdx.current];
      updateArray(state.array);
      setComparing(state.comparing);
      setActiveLine(state.line);
    }
  }, [updateArray]);

  const shuffleData = useCallback(async () => {
    stopRef.current = false;
    pauseRef.current = false;
    setIsPaused(false);
    let shuffled = [...arrayRef.current];
    for (let i = shuffled.length - 1; i > 0; i--) {
      if (stopRef.current) break;
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      if (i % 2 === 0) {
        setArray([...shuffled]);
        await sleep(10);
      }
    }
    updateArray(shuffled);
    setIsPaused(true);
    pauseRef.current = true;
  }, [updateArray]);

  return {
    array,
    setArray: updateArray,
    comparing,
    activeLine,
    isPaused,
    togglePause,
    speed,
    setSpeed: handleSetSpeed,
    runSimulation,
    stopSimulation,
    stepForward,
    stepBackward,
    shuffleData,
    generatorRef, // Exported generatorRef
  };
};
