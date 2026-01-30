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

  const runSimulation = useCallback(
    async (
      algoGenerator: AsyncGenerator<any>,
      onStep?: (val: number) => void,
    ) => {
      setIsPaused(false);
      for await (const step of algoGenerator) {
        if (step.line !== undefined) setActiveLine(step.line);
        if (step.array) updateArray(step.array);
        if (step.comparing) {
          setComparing(step.comparing);
          if (onStep && step.comparing.length > 0) {
            onStep(arrayRef.current[step.comparing[0]]);
          }
        }
        await sleep();
      }
      setActiveLine(0);
      setComparing([]);
      setIsPaused(true);
    },
    [updateArray],
  ); // Only changes if updateArray changes

  const shuffleData = useCallback(async () => {
    setIsPaused(false);
    let shuffled = [...arrayRef.current];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      if (i % 2 === 0) {
        setArray([...shuffled]);
        await sleep(10);
      }
    }
    updateArray(shuffled);
    setIsPaused(true);
  }, [updateArray]);

  return {
    array,
    setArray: updateArray,
    comparing,
    setComparing,
    activeLine,
    setActiveLine,
    isPaused,
    setIsPaused,
    speed,
    setSpeed: handleSetSpeed,
    runSimulation,
    shuffleData,
  };
};
