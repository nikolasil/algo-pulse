'use client';
import { AllAlgorithmTypes } from '@/hooks/algorithms/general';
import { Dispatch, SetStateAction } from 'react';

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
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
        Algorithm
      </h2>
      <div className="relative group">
        <select
          value={algorithm}
          onChange={(e) => {
            setAlgorithm(e.target.value as T);
          }}
          disabled={hasGenerator || isBenchmarking}
          className={`
            appearance-none cursor-pointer
            bg-slate-800 text-slate-200 text-[11px] font-bold
            px-3 py-1.5 pr-8 rounded border border-slate-700
            hover:border-cyan-600 transition-colors
            focus:outline-none focus:ring-1 focus:ring-cyan-600
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {options.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Custom Chevron Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
