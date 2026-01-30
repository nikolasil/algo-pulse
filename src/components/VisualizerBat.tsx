// components/VisualizerBar.tsx
import { motion } from 'framer-motion';

export const VisualizerBar = ({
  val,
  status,
}: {
  val: number;
  status: 'idle' | 'comparing' | 'swapping';
}) => {
  const colors = {
    idle: 'bg-blue-500',
    comparing: 'bg-yellow-400',
    swapping: 'bg-red-500',
  };

  return (
    <motion.div
      layout // This handles the sliding animation automatically!
      className={`${colors[status]} w-4 rounded-t-sm`}
      style={{ height: `${val}px` }}
    />
  );
};
