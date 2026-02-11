'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number | ReactNode;
  highlight?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  trend?: 'up' | 'down' | 'stable';
}

export function StatCard({
  label,
  value,
  highlight = false,
  icon: Icon,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-300
        ${
          highlight
            ? 'bg-success-500/10 border-success-500/30'
            : 'bg-surface-800/50 border-surface-700/50'
        }
        hover:border-surface-600
      `}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {Icon && (
                <Icon
                  size={14}
                  className={highlight ? 'text-success-400' : 'text-surface-500'}
                />
              )}
              <span className="text-xs font-medium text-surface-500 uppercase tracking-wide truncate">
                {label}
              </span>
            </div>
            <div
              className={`
                text-lg font-bold truncate transition-colors duration-300
                ${highlight ? 'text-success-400' : 'text-surface-100'}
              `}
            >
              {value}
            </div>
          </div>
          {highlight && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0 w-2 h-2 rounded-full bg-success-500 shadow-lg shadow-success-500/50"
            />
          )}
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div
        className={`absolute inset-0 opacity-5 transition-opacity duration-300 ${
          highlight ? 'bg-success-500' : 'bg-surface-100'
        }`}
      />
    </motion.div>
  );
}

interface StatDashboardProps {
  children: ReactNode;
  className?: string;
}

export function StatDashboard({ children, className = '' }: StatDashboardProps) {
  return (
    <div
      className={`
        grid gap-3
        grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}
