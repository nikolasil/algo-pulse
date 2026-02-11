'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface LayoutWrapperProps {
  title: string;
  subtitle: string;
  sidebar: ReactNode;
  main: ReactNode;
  children?: ReactNode;
}

export function LayoutWrapper({ title, subtitle, sidebar, main, children }: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  return (
    <main className="flex min-h-screen bg-surface-950 text-surface-100">
      <AnimatePresence>
        {isMobileSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileSheetOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileSheetOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-surface-900 border-r border-surface-800 z-50 lg:hidden"
          >
            <div className="flex flex-col h-full p-4">
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="self-end p-2 text-surface-400 hover:text-surface-100 touch-target"
              >
                <X size={20} />
              </button>
              <div className="flex-1 overflow-y-auto">
                {sidebar}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <aside
        className={`
          hidden lg:flex flex-col bg-surface-900/50 border-r border-surface-800 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}
        `}
      >
        <div className={`w-80 flex flex-col h-full overflow-y-auto custom-scrollbar ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
          {sidebar}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-surface-800 bg-surface-950/80 backdrop-blur">
          <button
            onClick={() => setIsMobileSheetOpen(true)}
            className="p-2 text-surface-400 hover:text-surface-100 touch-target rounded-lg hover:bg-surface-800 transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-surface-100">{title}</h1>
            <p className="text-xs text-surface-500 uppercase tracking-wider">{subtitle}</p>
          </div>
        </header>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`
            hidden lg:flex absolute top-4 z-10 items-center justify-center w-8 h-12
            bg-surface-800 border-y border-r border-surface-700 rounded-r-xl
            text-surface-400 hover:text-surface-100 hover:bg-surface-700
            transition-all duration-300
            ${isSidebarOpen ? 'left-80' : 'left-0'}
          `}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft size={16} className={`transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
        </button>

        <div className="flex-1 flex flex-col overflow-hidden">
          {main}
        </div>
      </div>

      {children}
    </main>
  );
}
