'use client';
import { motion, AnimatePresence } from 'framer-motion';

type VisualizerBarStatus = 'idle' | 'comparing' | 'swapping' | 'found';

interface VisualizerBarProps {
  val: number;
  status: VisualizerBarStatus;
  maxVal?: number;
  className?: string;
  isFirst?: boolean;
  isLast?: boolean;
  width?: number; // New prop for Zoom control
}

export const VisualizerBar = ({
  val,
  status,
  maxVal = 100,
  className = '',
  isFirst = false,
  isLast = false,
  width = 32, // Default width
}: VisualizerBarProps) => {
  const colors = {
    idle: 'bg-slate-700/20',
    comparing: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] z-10',
    swapping: 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] z-10',
    found: 'bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.7)] z-20',
  } as const;

  const roundedClass = `
    ${isFirst ? 'rounded-tl-xl' : 'rounded-tl-sm'} 
    ${isLast ? 'rounded-tr-xl' : 'rounded-tr-sm'}
  `;

  // Hide text if zoomed out too far (width < 24px)
  const showText = width >= 24;

  return (
    <motion.div
      layout
      className={`
        relative flex flex-col items-center justify-start 
        shrink-0 
        ${colors[status]} ${roundedClass} ${className} 
        transition-colors duration-300 ease-out
      `}
      style={{
        height: `${(val / (maxVal + 5)) * 100}%`,
        minWidth: `${width}px`, // Controlled by Zoom
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

      {/* Top Glow Edge */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 w-full brightness-150 ${roundedClass} ${status !== 'idle' ? 'bg-white/50' : 'bg-white/10'}`}
      />

      {/* Vertical Value Label - Top Aligned */}
      {showText && (
        <span
          className={`
            hidden md:block
            text-[9px] xl:text-[11px] font-mono font-black select-none mt-2
            ${status === 'idle' ? 'text-slate-600' : 'text-slate-950'}
            /* If value is very small, push text outside (above) to keep it visible */
            ${val < 15 ? '-mt-6 text-slate-400' : ''} 
          `}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {val}
        </span>
      )}

      {/* Comparison Pointer */}
      <AnimatePresence>
        {(status === 'comparing' || status === 'found') && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.5 }}
            className="absolute -top-5 flex flex-col items-center z-40"
          >
            <div
              className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent ${status === 'found' ? 'border-t-8 border-t-emerald-400' : 'border-t-8 border-t-rose-500'}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
