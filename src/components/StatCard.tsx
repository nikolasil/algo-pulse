export function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-xl">
      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        {label}
      </div>
      <div
        className={`text-sm font-bold mt-1 ${highlight ? 'text-green-500 animate-pulse' : 'text-slate-200'}`}
      >
        {value}
      </div>
    </div>
  );
}
