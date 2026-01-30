'use client';
import Link from 'next/link';
import { ALGO_CATEGORIES } from '@/constants/algorithms';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-900 bg-slate-950 px-6 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-5xl font-black tracking-tighter sm:text-7xl">
            ALGO{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent underline decoration-cyan-500/30 underline-offset-8">
              PULSE
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 font-mono">
            Interactive visual terminal for modern computational logic. Choose a
            module to begin simulation.
          </p>
        </div>
      </div>

      {/* Grid Selection */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ALGO_CATEGORIES.map((cat) => (
            <AlgorithmCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      <footer className="border-t border-slate-900 py-10 text-center">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.5em]">
          System Status: Multi-Module Support Enabled
        </p>
      </footer>
    </main>
  );
}

function AlgorithmCard({ category }: { category: any }) {
  const isActive = category.status === 'ACTIVE';

  return (
    <Link
      href={isActive ? category.path : '#'}
      className={`group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-900/10 ${!isActive && 'cursor-not-allowed grayscale opacity-60'}`}
    >
      <div>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl shadow-inner group-hover:scale-110 transition-transform">
          {category.icon}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
          {category.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {category.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {category.algos.map((algo: string) => (
            <span
              key={algo}
              className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-mono text-slate-500 border border-slate-800"
            >
              {algo}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span
          className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-cyan-500' : 'text-slate-600'}`}
        >
          {category.status}
        </span>
        {isActive && (
          <div className="text-cyan-500 group-hover:translate-x-1 transition-transform">
            →
          </div>
        )}
      </div>
    </Link>
  );
}
