'use client';
import { useState, useRef } from 'react';

export const useSorting = (initialArray: number[]) => {
  const [array, setArray] = useState<number[]>(initialArray);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(50);
  const [comparing, setComparing] = useState<number[]>([]);

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

  // Shuffles the existing array values
  const shuffleData = async () => {
    setIsPaused(false);
    let shuffled = [...arrayRef.current];
    // Fisher-Yates Shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

      // Visual feedback of the shuffle
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
      if (step.array) updateArray(step.array);
      if (step.comparing) {
        setComparing(step.comparing);
        // Play sound for the first element being compared
        if (onStep && step.comparing.length > 0) {
          onStep(arrayRef.current[step.comparing[0]]);
        }
      }
      await sleep();
    }
    setComparing([]);
    setIsPaused(true);
  };

  return {
    array,
    setArray: updateArray,
    comparing,
    isPaused,
    setIsPaused,
    speed,
    setSpeed: handleSetSpeed,
    startSorting,
    shuffleData,
  };
};
