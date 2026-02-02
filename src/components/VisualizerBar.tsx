'use client';
import { motion } from 'framer-motion';

interface VisualizerBarProps {
  val: number;
  status: 'idle' | 'comparing' | 'swapping' | 'found';
  maxVal?: number;
  className?: string;
}

export const VisualizerBar = ({
  val,
  status,
  maxVal = 100,
  className = '',
}: VisualizerBarProps) => {
  const colors = {
    idle: 'bg-cyan-500/40',
    comparing: 'bg-rose-500 shadow-[0_0_15px_#f43f5e]',
    swapping: 'bg-amber-400 shadow-[0_0_15px_#fbbf24]',
    found: 'bg-emerald-500 shadow-[0_0_20px_#10b981]',
  } as const;

  return (
    <motion.div
      layout
      className={`relative flex flex-col items-center justify-start pt-1 ${colors[status]} ${className} rounded-t-[1px] md:rounded-t-sm transition-colors duration-150`}
      style={{
        height: `${(val / (maxVal + 10)) * 100}%`,
        width: '100%',
        transformOrigin: 'bottom',
      }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Value Label Optimization:
          1. hidden lg:block -> Hides text on mobile/tablet to prevent overlap
          2. sm:text-[8px] -> Slightly smaller text on smaller desktop views
      */}
      <span
        className={`
          hidden lg:block
          text-[7px] xl:text-[9px] font-mono font-bold select-none
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

      {/* Mobile Indicator: 
          Optional subtle glow at the top for mobile since labels are hidden 
      */}
      <div
        className={`lg:hidden absolute top-0 left-0 right-0 h-[2px] w-full ${status !== 'idle' ? 'bg-white/50' : 'bg-transparent'}`}
      />
    </motion.div>
  );
};
