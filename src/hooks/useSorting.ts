'use client';
import { useState, useRef, useCallback } from 'react';

export const useSorting = (initialArray: number[]) => {
  const [array, setArray] = useState<number[]>(initialArray);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(50);
  const [comparing, setComparing] = useState<number[]>([]);

  // Use a ref to keep track of the current state for the async generator
  const arrayRef = useRef(initialArray);
  const speedRef = useRef(speed);

  // Sync ref with state
  const updateArray = (newArray: number[]) => {
    arrayRef.current = [...newArray];
    setArray([...newArray]);
  };

  // Sync speed ref
  const handleSetSpeed = (val: number) => {
    setSpeed(val);
    speedRef.current = val;
  };

  const sleep = () =>
    new Promise((resolve) => setTimeout(resolve, speedRef.current));

  const startSorting = async (algoGenerator: AsyncGenerator<any>) => {
    setIsPaused(false);
    for await (const step of algoGenerator) {
      if (step.array) updateArray(step.array);
      if (step.comparing) setComparing(step.comparing);
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
  };
};
