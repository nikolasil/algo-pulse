'use client';

import Link from 'next/link';

// --- Types ---
interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  status: 'ACTIVE' | 'DEVELOPMENT';
  algos: string[];
}

// --- Updated Constants based on /algorithms vs /structures ---
const ALGO_MODULES: Category[] = [
  {
    id: 'sorting',
    title: 'Sorting Logic',
    description:
      'Visualize the physical movement and comparison of linear data sets.',
    icon: '📊',
    path: '/algorithms/sorting',
    status: 'ACTIVE',
    algos: ['Bubble Sort', 'Quick Sort', 'Merge Sort'],
  },
  {
    id: 'searching',
    title: 'Search Patterns',
    description:
      'Efficiently locate specific data points within optimized sets.',
    icon: '🔍',
    path: '/algorithms/searching',
    status: 'ACTIVE',
    algos: ['Linear Search', 'Binary Search', 'Jump Search'],
  },
  {
    id: 'pathfinding',
    title: 'Pathfinding',
    description:
      '2D grid navigation using heuristic and shortest-path engines.',
    icon: '🗺️',
    path: '/algorithms/pathfinding',
    status: 'ACTIVE',
    algos: ["Dijkstra's", 'A* Search', 'Greedy Best-First'],
  },
];

const STRUCTURE_MODULES: Category[] = [
  {
    id: 'trees',
    title: 'Tree Systems',
    description: 'Hierarchical data structures and recursive traversal logic.',
    icon: '🌳',
    path: '/structures/trees',
    status: 'DEVELOPMENT',
    algos: ['Traversals', 'BST Operations', 'AVL Balancing'],
  },
  {
    id: 'graphs',
    title: 'Graph Theory',
    description:
      'Modeling relationships and connectivity between complex nodes.',
    icon: '🕸️',
    path: '/structures/graphs',
    status: 'DEVELOPMENT',
    algos: ["Prim's", 'Kruskal', 'Topological Sort'],
  },
  {
    id: 'linked-list',
    title: 'Linked Structures',
    description: 'Sequential data containers managed via pointer references.',
    icon: '🔗',
    path: '/structures/linked-list',
    status: 'DEVELOPMENT',
    algos: ['Reversal', 'Cycle Detection', 'Doubly Linked'],
  },
];

export default function HomePage() {
  const scrollToContent = () => {
    const element = document.getElementById('core-algorithms');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Animated Hero Section */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-slate-900 bg-slate-950 px-6 py-32 sm:py-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[100px] w-full animate-scanline opacity-20" />

        <div className="relative mx-auto max-w-5xl text-center">
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
            &gt; Visualizing computational complexity across algorithms &
            structures.
          </p>

          {/* Clickable Scroll Indicator */}
          <button
            onClick={scrollToContent}
            className="group mt-16 flex flex-col items-center gap-4 mx-auto cursor-pointer transition-all duration-300"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all">
              View Modules
            </span>
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-slate-800 p-1 group-hover:border-cyan-500/50 transition-colors">
              <div className="h-2 w-1 rounded-full bg-cyan-500 animate-scroll-dot" />
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-slate-600 animate-bounce group-hover:text-cyan-500 transition-colors"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid Selection */}
      <div className="mx-auto max-w-7xl px-6 py-20 space-y-20">
        <section id="core-algorithms">
          <div className="mb-10 flex items-center gap-4">
            <h2 className="text-sm font-black tracking-[0.4em] uppercase text-cyan-500">
              Core Algorithms
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ALGO_MODULES.map((cat) => (
              <AlgorithmCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-10 flex items-center gap-4">
            <h2 className="text-sm font-black tracking-[0.4em] uppercase text-indigo-500">
              Data Structures
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {STRUCTURE_MODULES.map((cat) => (
              <AlgorithmCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer omitted for brevity but remains the same in your build */}
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
              <p className="text-sm text-slate-500 font-mono max-w-xs">
                Visualizing logic through refined architecture.
              </p>
            </div>

            <div className="flex gap-16">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Engineer
                </p>
                <Link
                  href="https://iliopoulos.work"
                  className="text-sm font-bold text-white hover:text-cyan-400 transition-colors"
                >
                  ILIOPOULOS NIKOLAS
                </Link>
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
        @keyframes scroll-dot {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(20px);
            opacity: 0;
          }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        .animate-scroll-dot {
          animation: scroll-dot 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

function AlgorithmCard({ category }: { category: Category }) {
  const isActive = category.status === 'ACTIVE';

  return (
    <Link
      href={isActive ? category.path : '#'}
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-8 transition-all duration-300 
        ${
          isActive
            ? 'hover:border-cyan-500/50 hover:bg-slate-900/60 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)] cursor-pointer'
            : 'cursor-not-allowed opacity-40 grayscale'
        }`}
    >
      <div>
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-3xl group-hover:border-cyan-500/30 transition-all duration-500">
          {category.icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            {category.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500 group-hover:text-slate-400">
            {category.description}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-1.5">
          {category.algos.map((algo) => (
            <span
              key={algo}
              className="rounded bg-slate-950/80 px-2.5 py-1 text-[9px] font-mono text-slate-500 border border-slate-800/50"
            >
              {algo}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-slate-800/50 pt-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
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
          <div className="flex items-center gap-2 text-cyan-500 transition-all duration-300 group-hover:translate-x-1">
            <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}
