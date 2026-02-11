'use client';

import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

interface NavHeaderProps {
  title: string;
  subtitle: string;
}

export function NavHeader({ title, subtitle }: NavHeaderProps) {
  return (
    <header className="flex flex-col gap-3 pb-4 border-b border-surface-800">
      <Link
        href="/"
        className="flex items-center gap-2 text-xs text-surface-500 hover:text-primary-400 transition-colors group w-fit"
        aria-label="Return to home"
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="font-medium uppercase tracking-wider">Return to Nexus</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
          <Zap size={18} className="text-primary-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-surface-100">
            <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="text-xs text-surface-500 uppercase tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
