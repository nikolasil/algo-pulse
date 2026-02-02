'use client';
import { useState, ReactNode } from 'react';

interface ExpandableSidebarProps {
  children: ReactNode;
}

export function ExpandableSidebar({ children }: ExpandableSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* 2. Sidebar Container */}
      <aside
        className={`fixed lg:relative flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out z-40 h-screen
          ${
            isSidebarOpen
              ? 'w-[85vw] md:w-[420px] shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]'
              : 'w-0'
          }`}
      >
        <div
          className={`w-[85vw] md:w-[420px] flex flex-col gap-6 p-6 h-full overflow-y-auto custom-scrollbar transition-opacity duration-200 
          ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {children}
        </div>
      </aside>

      {/* 3. Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-1/2 z-[60] flex items-center justify-center w-8 h-12 bg-slate-800 border-y border-r border-slate-700 rounded-r-xl hover:bg-cyan-600 transition-all duration-300 group shadow-2xl text-slate-400 hover:text-white pointer-events-auto"
        style={{
          // Use dynamic calc to handle the 85vw on mobile vs 420px on desktop
          left: isSidebarOpen ? 'min(85vw, 420px)' : '0px',
          transform: 'translateY(-50%)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </>
  );
}
