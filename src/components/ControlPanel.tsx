'use client';

interface Props {
  onReset: (size: number) => void;
  onSpeedChange: (speed: number) => void;
  isPaused: boolean;
  size: number;
  speed: number;
}

export const ControlPanel = ({
  onReset,
  onSpeedChange,
  isPaused,
  size,
  speed,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-4xl">
      {/* Array Size Slider */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-mono text-slate-400">
          Array Size: {size}
        </label>
        <input
          type="range"
          min="5"
          max="100"
          value={size}
          disabled={!isPaused}
          onChange={(e) => onReset(Number(e.target.value))}
          className="accent-cyan-500 cursor-pointer disabled:opacity-50"
        />
      </div>

      {/* Speed Slider */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-mono text-slate-400">
          Delay: {speed}ms
        </label>
        <input
          type="range"
          min="1"
          max="500"
          step="10"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="accent-cyan-500 cursor-pointer"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => onReset(size)}
          disabled={!isPaused}
          className="w-full py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-sm font-bold transition-colors"
        >
          Shuffle
        </button>
      </div>
    </div>
  );
};
