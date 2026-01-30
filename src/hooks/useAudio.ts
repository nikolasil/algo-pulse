'use client';
import { useRef } from 'react';

export const useAudio = () => {
  const audioCtx = useRef<AudioContext | null>(null);

  const playTone = (value: number, duration = 0.05) => {
    if (!audioCtx.current) {
      audioCtx.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Map bar value (5-105) to frequency (200Hz - 800Hz)
    const freq = 200 + value * 6;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  return { playTone };
};
