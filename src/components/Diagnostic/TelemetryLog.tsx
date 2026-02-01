export function TelemetryLog({ history }: { history: any[] }) {
  return (
    <section className="flex-1">
      <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
        Telemetry Log
      </h2>
      <div className="space-y-2">
        {history.length === 0 && (
          <p className="text-[10px] text-slate-600 italic">
            Waiting for execution data...
          </p>
        )}
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs"
          >
            <div>
              <span className="font-bold text-cyan-500 uppercase">
                {item.algorithm}
              </span>
              <span className="ml-2 text-slate-500 font-mono text-[10px]">
                N={item.size}
              </span>
            </div>
            <div className="font-mono text-slate-200">{item.time}ms</div>
          </div>
        ))}
      </div>
    </section>
  );
}
