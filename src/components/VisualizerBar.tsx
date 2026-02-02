'use client';
import { motion, AnimatePresence } from 'framer-motion';

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
    idle: 'bg-slate-700/30',
    comparing: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] z-10',
    swapping: 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] z-10',
    found: 'bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.8)] z-20',
  } as const;

  return (
    <motion.div
      layout
      className={`relative flex flex-col items-center justify-start pt-1 ${colors[status]} ${className} rounded-t-sm transition-all duration-200 ease-out`}
      style={{
        height: `${(val / (maxVal + 10)) * 100}%`,
        width: '100%',
        transformOrigin: 'bottom',
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Found State Sparkle */}
      {status === 'found' && (
        <motion.div 
          layoutId="sparkle"
          className="absolute -top-2 w-full h-1 bg-white blur-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}

      {/* Vertical Value Label */}
      <span
        className={`
          hidden lg:block
          text-[8px] xl:text-[10px] font-mono font-black select-none
          ${status === 'idle' ? 'text-slate-500' : 'text-slate-950'}
          ${val < 20 ? '-mt-6 text-slate-400' : ''} 
        `}
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        {val}
      </span>

      {/* Comparison Pointer (Triangle above the bar) */}
      <AnimatePresence>
        {(status === 'comparing' || status === 'found') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -15 }}
            exit={{ opacity: 0 }}
            className={`absolute -top-4 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent ${status === 'found' ? 'border-t-[6px] border-t-emerald-400' : 'border-t-[6px] border-t-rose-500'}`}
          />
        )}
      </AnimatePresence>

      {/* Top Glow Edge */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] w-full brightness-125 ${status !== 'idle' ? 'bg-white/40' : 'bg-white/5'}`}
      />
    </motion.div>
  );
};