'use client';

interface ControlPanelProps {
  size: number;
  speed: number;
  isPaused: boolean;
  onSpeedChange: (speed: number) => void;
  onSizeChange: (size: number) => void;
}

export const ControlPanel = ({
  size,
  speed,
  isPaused,
  onSpeedChange,
  onSizeChange,
}: ControlPanelProps) => {
  return (
    <div className="flex flex-wrap items-center gap-8 bg-slate-900/50 p-4 px-6 rounded-xl border border-slate-800 w-full md:w-auto">
      {/* Size Slider */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Resolution
          </label>
          <span className="text-[10px] font-mono text-cyan-400">{size}</span>
        </div>
        <input
          type="range"
          min="10"
          max="80"
          value={size}
          disabled={!isPaused}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        />
      </div>

      {/* Speed Slider */}
      <div className="flex flex-col gap-1 min-w-[140px]">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Pulse Delay
          </label>
          <span className="text-[10px] font-mono text-amber-400">
            {speed}ms
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="400"
          step="5"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
      </div>
    </div>
  );
};
