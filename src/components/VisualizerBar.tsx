'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualizerBarProps {
  val: number;
  status: 'idle' | 'comparing' | 'swapping' | 'found';
  maxVal?: number;
  className?: string;
  isFirst?: boolean; // New prop to handle left edge
  isLast?: boolean; // New prop to handle right edge
}

export const VisualizerBar = ({
  val,
  status,
  maxVal = 100,
  className = '',
  isFirst = false,
  isLast = false,
}: VisualizerBarProps) => {
  const colors = {
    idle: 'bg-slate-700/20',
    comparing: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] z-10',
    swapping: 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] z-10',
    found: 'bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.7)] z-20',
  } as const;

  // Better rounding logic for the container edges
  const roundedClass = `
    ${isFirst ? 'rounded-tl-xl' : 'rounded-tl-sm'} 
    ${isLast ? 'rounded-tr-xl' : 'rounded-tr-sm'}
  `;

  return (
    <motion.div
      layout
      className={`relative flex flex-col items-center justify-start ${colors[status]} ${roundedClass} ${className} transition-all duration-300 ease-out`}
      style={{
        height: `${(val / (maxVal + 5)) * 100}%`,
        width: '100%',
        transformOrigin: 'bottom',
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Found State Sparkle */}
      {status === 'found' && (
        <motion.div
          layoutId="sparkle"
          className="absolute -top-1 left-0 right-0 h-1 bg-white blur-[2px] z-30"
          animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Top Glow Edge - refined to follow rounding */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] w-full brightness-150 ${roundedClass} ${status !== 'idle' ? 'bg-white/50' : 'bg-white/10'}`}
      />

      {/* Vertical Value Label - Improved contrast and positioning */}
      <span
        className={`
          hidden lg:block
          text-[9px] xl:text-[11px] font-mono font-black select-none mt-2
          ${status === 'idle' ? 'text-slate-600' : 'text-slate-950'}
          ${val < 15 ? '-mt-7 text-slate-400' : ''} 
        `}
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        {val}
      </span>

      {/* Comparison Pointer - Higher elevation to avoid clipping */}
      <AnimatePresence>
        {(status === 'comparing' || status === 'found') && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.5 }}
            className="absolute -top-5 flex flex-col items-center"
          >
            <div
              className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent ${status === 'found' ? 'border-t-[8px] border-t-emerald-400' : 'border-t-[8px] border-t-rose-500'}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
