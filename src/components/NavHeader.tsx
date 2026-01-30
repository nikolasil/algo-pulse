'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; // Make sure lucide-react is installed

interface NavHeaderProps {
  title: string;
  subtitle: string;
}

export function NavHeader({ title, subtitle }: NavHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] group"
      >
        <ArrowLeft
          size={12}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Return to Nexus
      </Link>

      <div>
        <h1 className="text-2xl font-black bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent italic uppercase">
          {title}
        </h1>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
