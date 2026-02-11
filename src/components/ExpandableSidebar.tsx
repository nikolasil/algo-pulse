'use client';

import { ReactNode } from 'react';
import { NavHeader } from './NavHeader';

interface SidebarContentProps {
  children: ReactNode;
}

export function SidebarContent({ children }: SidebarContentProps) {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
      <NavHeader title="Sort Pulse" subtitle="Diagnostic Engine" />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
}

interface ExpandableSidebarProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function ExpandableSidebar({ children, title, subtitle }: ExpandableSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <NavHeader title={title} subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
