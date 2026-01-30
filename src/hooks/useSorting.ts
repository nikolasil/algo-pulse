'use client';
import { useState, useRef } from 'react';

export const useSorting = (initialArray: number[]) => {
  const [array, setArray] = useState<number[]>(initialArray);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(50);
  const [comparing, setComparing] = useState<number[]>([]);
  const [activeLine, setActiveLine] = useState<number>(0);

  const arrayRef = useRef(initialArray);
  const speedRef = useRef(speed);

  const updateArray = (newArray: number[]) => {
    arrayRef.current = [...newArray];
    setArray([...newArray]);
  };

  const handleSetSpeed = (val: number) => {
    setSpeed(val);
    speedRef.current = val;
  };

  const sleep = (ms?: number) =>
    new Promise((resolve) => setTimeout(resolve, ms ?? speedRef.current));

  const shuffleData = async () => {
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
  };

  const startSorting = async (
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
  };

  return {
    array,
    setArray: updateArray,
    comparing,
    activeLine,
    isPaused,
    setIsPaused,
    speed,
    setSpeed: handleSetSpeed,
    startSorting,
    shuffleData,
  };
};
