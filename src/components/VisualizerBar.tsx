'use client';
import { motion } from 'framer-motion';

interface VisualizerBarProps {
  val: number;
  status: 'idle' | 'comparing' | 'swapping' | 'found';
  maxVal?: number;
}

export const VisualizerBar = ({
  val,
  status,
  maxVal = 100,
}: VisualizerBarProps) => {
  const colors = {
    idle: 'bg-cyan-500/40',
    comparing: 'bg-rose-500 shadow-[0_0_15px_#f43f5e]',
    swapping: 'bg-amber-400 shadow-[0_0_15px_#fbbf24]',
    found: 'bg-emerald-500 shadow-[0_0_20px_#10b981]',
  };

  return (
    <motion.div
      layout
      className={`relative flex flex-col items-center justify-start pt-1 ${colors[status]} rounded-t-sm transition-colors duration-150`}
      style={{
        height: `${(val / (maxVal + 10)) * 100}%`,
        width: '100%',
      }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Display the value */}
      <span
        className={`
          text-[9px] font-mono font-bold select-none
          ${status === 'idle' ? 'text-slate-400' : 'text-white'}
          ${val < 15 ? '-mt-4 text-slate-300' : ''} /* Lift text if bar is too short */
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
