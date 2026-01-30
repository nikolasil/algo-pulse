'use client';

import Link from 'next/link';
import { ALGO_CATEGORIES } from '@/constants/algorithms';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Animated Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-900 bg-slate-950 px-6 py-32 sm:py-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[100px] w-full animate-scanline opacity-20" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-block px-3 py-1 mb-6 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[10px] font-mono tracking-[0.3em] text-cyan-400 uppercase">
            Initializing Kernel v3.0.4
          </div>
          <h1 className="text-6xl font-black tracking-tighter sm:text-8xl">
            ALGO{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                PULSE
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-cyan-500/20 blur-sm" />
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 font-mono italic">
            &gt; Visualizing computational complexity across distributed logic
            nodes.
            <br />
            &gt; Select a module to authorize execution.
          </p>
        </div>
      </div>

      {/* Grid Selection */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ALGO_CATEGORIES.map((cat) => (
            <AlgorithmCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      {/* Enhanced Footer with Creator Branding */}
      <footer className="border-t border-slate-900 bg-slate-950 pb-16 pt-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">
                  Algo Pulse
                </span>
              </div>
              <p className="text-sm text-slate-500 font-mono max-w-xs leading-relaxed">
                An open-source visualization suite built for the next generation
                of software engineers and logic theorists.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-16">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Software Engineer
                </p>
                <div className="group cursor-pointer">
                  <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    ILIOPOULOS NIKOLAS
                  </p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">
                    <Link
                      href="https://iliopoulos.work"
                      className="hover:text-cyan-400 transition-colors"
                    >
                      https://iliopoulos.work
                    </Link>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Network
                </p>
                <ul className="text-sm space-y-2 font-mono text-slate-500">
                  <li className="hover:text-white transition-colors">
                    <Link href="https://github.com/nikolasil/algo-pulse">
                      GitHub Repository
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(1000%);
          }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>
    </main>
  );
}

function AlgorithmCard({ category }: { category: any }) {
  const isActive = category.status === 'ACTIVE';

  return (
    <Link
      href={isActive ? category.path : '#'}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-8 transition-all duration-300 
        ${
          isActive
            ? 'hover:border-cyan-500/50 hover:bg-slate-900/60 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)]'
            : 'cursor-not-allowed opacity-40 grayscale'
        }`}
    >
      {isActive && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
      )}

      <div>
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-3xl shadow-inner group-hover:border-cyan-500/30 group-hover:scale-110 transition-all duration-500">
          {category.icon}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            {category.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500 group-hover:text-slate-400 transition-colors">
            {category.description}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-1.5">
          {category.algos.map((algo: string) => (
            <span
              key={algo}
              className="rounded bg-slate-950/80 px-2.5 py-1 text-[9px] font-mono text-slate-500 border border-slate-800/50 group-hover:border-slate-700 transition-colors"
            >
              {algo}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`relative flex h-2 w-2`}>
            {isActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-cyan-500' : 'bg-slate-700'}`}
            ></span>
          </span>
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-cyan-500' : 'text-slate-600'}`}
          >
            {category.status}
          </span>
        </div>

        {isActive && (
          <div className="flex items-center gap-2 text-cyan-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <span className="text-[10px] font-bold uppercase tracking-tighter text-cyan-400">
              Initialize
            </span>
            <span className="text-xl">→</span>
          </div>
        )}
      </div>
    </Link>
  );
}
