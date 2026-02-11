'use client';

import { AllAlgorithmTypes } from '@/hooks/algorithms/general';
import { Dispatch, SetStateAction } from 'react';
import { ChevronDown, Layers } from 'lucide-react';

interface SelectionAlgorithmProps<T extends AllAlgorithmTypes> {
  algorithm: T;
  setAlgorithm: Dispatch<SetStateAction<T>>;
  algorithmOptions: T[];
  hasGenerator: boolean;
  isBenchmarking: boolean;
}

export function SelectionAlgorithm<T extends AllAlgorithmTypes>({
  algorithm,
  setAlgorithm,
  algorithmOptions: options,
  hasGenerator,
  isBenchmarking,
}: SelectionAlgorithmProps<T>) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-surface-400 uppercase tracking-wide flex items-center gap-2">
        <Layers size={14} />
        Algorithm
      </label>
      <div className="relative">
        <select
          value={algorithm}
          onChange={(e) => {
            setAlgorithm(e.target.value as T);
          }}
          disabled={hasGenerator || isBenchmarking}
          className={`
            w-full appearance-none cursor-pointer
            bg-surface-800 text-surface-100 text-sm font-medium
            px-4 py-3 pr-10 rounded-lg border border-surface-700
            hover:border-primary-500/50 transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {options.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-surface-400">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}
