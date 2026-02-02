'use client';
import { useRef, useEffect } from 'react';

export const useAudio = () => {
  const audioCtx = useRef<AudioContext | null>(null);

  // Helper to initialize or resume the context
  const initContext = async () => {
    if (!audioCtx.current) {
      audioCtx.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    // Crucial: Browsers suspend audio contexts until a user interacts with the page
    if (audioCtx.current.state === 'suspended') {
      await audioCtx.current.resume();
    }
    return audioCtx.current;
  };

  const playTone = async (value: number, duration = 0.05) => {
    try {
      const ctx = await initContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Ensure value is a number and provide a fallback to avoid NaN frequencies
      const safeValue = typeof value === 'number' ? value : 0;
      const freq = 200 + safeValue * 6;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Smooth volume envelope to prevent clicking sounds
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  // Cleanup context on unmount
  useEffect(() => {
    return () => {
      if (audioCtx.current && audioCtx.current.state !== 'closed') {
        audioCtx.current.close();
      }
    };
  }, []);

  return { playTone };
};
