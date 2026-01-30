'use client';
import { motion } from 'framer-motion';

interface VisualizerBarProps {
  val: number;
  status: 'idle' | 'comparing' | 'swapping' | 'found';
  maxVal?: number;
  className?: string; // Fixed: Added to support the opacity-20 filter
}

export const VisualizerBar = ({
  val,
  status,
  maxVal = 100,
  className = '', // Default to empty string
}: VisualizerBarProps) => {
  // Using 'as const' ensures keys match the status type perfectly
  const colors = {
    idle: 'bg-cyan-500/40',
    comparing: 'bg-rose-500 shadow-[0_0_15px_#f43f5e]',
    swapping: 'bg-amber-400 shadow-[0_0_15px_#fbbf24]',
    found: 'bg-emerald-500 shadow-[0_0_20px_#10b981]',
  } as const;

  return (
    <motion.div
      layout
      // Merge internal styles with the incoming className prop
      className={`relative flex flex-col items-center justify-start pt-1 ${colors[status]} ${className} rounded-t-sm transition-colors duration-150`}
      style={{
        height: `${(val / (maxVal + 10)) * 100}%`,
        width: '100%',
        transformOrigin: 'bottom', // Ensure scaling starts from the bottom
      }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Value Label */}
      <span
        className={`
          text-[9px] font-mono font-bold select-none
          ${status === 'idle' ? 'text-slate-400' : 'text-white'}
          ${val < 15 ? '-mt-4 text-slate-300' : ''} 
        `}
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        {val}
      </span>
    </motion.div>
  );
};
