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
    <div className="flex flex-col sm:flex-row gap-8 flex-1 justify-center">
      {/* Array Size */}
      <div className="flex flex-col gap-2 min-w-[140px]">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Size
          </label>
          <span className="text-xs font-bold text-cyan-500">{size}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={size}
          disabled={!isPaused}
          onChange={(e) => onReset(Number(e.target.value))}
          className="h-1.5 w-full bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-30"
        />
      </div>

      {/* Speed Slider */}
      <div className="flex flex-col gap-2 min-w-[140px]">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Delay
          </label>
          <span className="text-xs font-bold text-cyan-500">{speed}ms</span>
        </div>
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="h-1.5 w-full bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  );
};
