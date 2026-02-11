'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect, useRef } from 'react';

type VisualizerBarStatus = 'idle' | 'comparing' | 'swapping' | 'found';

interface VisualizerBarProps {
  val: number;
  status: VisualizerBarStatus;
  maxVal?: number;
  className?: string;
  isFirst?: boolean;
  isLast?: boolean;
  barWidth?: number;
}

export const VisualizerBar = ({
  val,
  status,
  maxVal = 100,
  className = '',
  isFirst = false,
  isLast = false,
  barWidth = 24,
}: VisualizerBarProps) => {
  const colors = {
    idle: 'bg-surface-600/30',
    comparing: 'bg-error-500 shadow-lg z-10',
    swapping: 'bg-warning-400 shadow-lg z-10',
    found: 'bg-success-400 shadow-xl z-20',
  } as const;

  const roundedClass = `
    ${isFirst ? 'rounded-l-lg' : 'rounded-l-sm'}
    ${isLast ? 'rounded-r-lg' : 'rounded-r-sm'}
  `;

  const showLabel = barWidth >= 20;

  return (
    <motion.div
      layout
      data-testid="visualizer-bar"
      className={`
        relative flex flex-col items-center justify-end
        shrink-0
        ${colors[status]} ${roundedClass} ${className}
        transition-colors duration-200 ease-out
      `}
      style={{
        height: `${Math.max((val / maxVal) * 100, 4)}%`,
        minWidth: `${barWidth}px`,
        transformOrigin: 'bottom',
      }}
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {status === 'found' && (
        <motion.div
          layoutId="sparkle"
          className="absolute -top-1 left-0 right-0 h-1 bg-white blur-[2px] z-30"
          animate={{ opacity: [0.4, 1, 0.4], scaleX: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      <div
        className={`absolute top-0 left-0 right-0 h-0.5 w-full brightness-150 ${roundedClass} ${
          status !== 'idle' ? 'bg-white/50' : 'bg-white/10'
        }`}
      />

      {showLabel && (
        <span
          className={`
            hidden xs:block absolute -bottom-6 text-[10px] font-mono font-bold select-none
            ${status === 'idle' ? 'text-surface-500' : 'text-surface-200'}
          `}
        >
          {val}
        </span>
      )}

      <AnimatePresence>
        {(status === 'comparing' || status === 'found') && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -16, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.5 }}
            className="absolute -top-4 flex flex-col items-center z-40"
          >
            <div
              className={`
                w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent
                ${status === 'found' ? 'border-b-8 border-b-success-400' : 'border-b-8 border-b-error-500'}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface BarVisualizerContainerProps {
  data: number[];
  comparing?: number[];
  found?: number[];
  className?: string;
}

export function BarVisualizerContainer({
  data,
  comparing = [],
  found = [],
  className = '',
}: BarVisualizerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const barWidth = useMemo(() => {
    const minBarWidth = 8;
    const gap = 2;
    const availableWidth = containerWidth - gap;
    const maxBars = data.length;
    const calculatedWidth = Math.max(
      minBarWidth,
      (availableWidth / maxBars) - gap,
    );
    return Math.min(calculatedWidth, 40);
  }, [containerWidth, data.length]);

  const maxVal = useMemo(() => Math.max(...data, 1), [data]);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full h-64 sm:h-80 lg:h-96
        bg-surface-900/30 rounded-xl border border-surface-800
        flex items-end justify-start px-2 pb-8 gap-0.5 sm:gap-1
        overflow-x-auto overflow-y-hidden
        ${className}
      `}
      style={{ minHeight: '200px' }}
    >
      {/* Value tooltip on hover */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 bg-surface-800 border border-surface-700 rounded-lg shadow-xl"
          >
            <span className="text-sm font-medium text-surface-200">
              Index {hoveredIndex}: <span className="text-primary-400">{data[hoveredIndex]}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {data.map((val, idx) => {
        const isComparing = comparing.includes(idx);
        const isFound = found.includes(idx);
        const status: VisualizerBarStatus = isFound
          ? 'found'
          : isComparing
            ? 'comparing'
            : 'idle';

        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="h-full"
          >
            <VisualizerBar
              val={val}
              status={status}
              maxVal={maxVal}
              barWidth={barWidth}
              isFirst={idx === 0}
              isLast={idx === data.length - 1}
            />
          </div>
        );
      })}
    </div>
  );
}

