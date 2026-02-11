'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Variable, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { SortingAlgoData } from '@/hooks/useSortingLogic';
import { SearchingAlgoData } from '@/hooks/useSearchingLogic';
import { PathfindingAlgoData } from '@/hooks/usePathfindingLogic';
import { PathfindingHeuristicType } from '@/hooks/algorithms/pathfindingAlgorithms';

interface Props {
  data:
    | SortingAlgoData
    | SearchingAlgoData
    | PathfindingAlgoData<{ heuristic: PathfindingHeuristicType }>;
  activeLine: number;
  variables: Record<string, number | string | boolean | undefined>;
}

type SectionKey = 'code' | 'variables' | 'complexity';

interface SectionHeaderProps {
  id: SectionKey;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  count?: number;
  isExpanded: boolean;
  onToggle: (id: SectionKey) => void;
}

function SectionHeader({ id, icon: Icon, title, count, isExpanded, onToggle }: SectionHeaderProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      className="flex items-center gap-2 w-full p-2 hover:bg-surface-800 rounded-lg transition-colors touch-target"
    >
      <Icon size={14} className="text-primary-400" />
      <span className="flex-1 text-left text-xs font-medium text-surface-200">
        {title}
      </span>
      {count !== undefined && (
        <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full">
          {count}
        </span>
      )}
      {isExpanded ? (
        <ChevronUp size={14} className="text-surface-500" />
      ) : (
        <ChevronDown size={14} className="text-surface-500" />
      )}
    </button>
  );
}

export const CodeViewer = ({ data, activeLine, variables }: Props) => {
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
    new Set(['code', 'variables']),
  );
  const hasVariables = Object.keys(variables).length > 0;

  const toggleSection = (section: SectionKey) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-surface-800 bg-surface-900/30 overflow-hidden">
      {/* Code Section */}
      <div className="border-b border-surface-800">
        <SectionHeader
          id="code"
          icon={Code2}
          title="Source Trace"
          isExpanded={expandedSections.has('code')}
          onToggle={toggleSection}
        />
        <AnimatePresence>
          {expandedSections.has('code') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative max-h-64 overflow-auto scrollbar-thin">
                <SyntaxHighlighter
                  language="javascript"
                  style={atomDark}
                  customStyle={{
                    background: 'transparent',
                    padding: '12px 16px',
                    margin: 0,
                    fontSize: '11px',
                    lineHeight: '1.6',
                    minWidth: '100%',
                  }}
                  showLineNumbers={true}
                  wrapLines={true}
                  lineProps={(lineNumber: number) => {
                    const isCurrent = lineNumber === activeLine;
                    return {
                      style: {
                        display: 'block',
                        width: '100%',
                        backgroundColor: isCurrent
                          ? 'rgba(6, 182, 212, 0.15)'
                          : 'transparent',
                        borderLeft: isCurrent
                          ? '2px solid #06b6d4'
                          : '2px solid transparent',
                        paddingLeft: '8px',
                        transition: 'all 0.15s ease',
                      },
                    };
                  }}
                >
                  {data.algorithmTraceCode}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Variables Section */}
      <div className="border-b border-surface-800">
        <SectionHeader
          id="variables"
          icon={Variable}
          title="Variables"
          count={Object.keys(variables).length}
          isExpanded={expandedSections.has('variables')}
          onToggle={toggleSection}
        />
        <AnimatePresence>
          {expandedSections.has('variables') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-2 max-h-48 overflow-auto">
                {hasVariables ? (
                  Object.entries(variables).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-800/50 border border-surface-700/50"
                    >
                      <span className="text-xs font-medium text-pink-400">
                        {key}
                      </span>
                      <span className="text-xs font-mono text-primary-300">
                        {typeof value === 'boolean'
                          ? value
                            ? 'true'
                            : 'false'
                          : String(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-4 text-xs text-surface-500 italic">
                    No active variables
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complexity Section */}
      {data.complexity && (
        <div>
          <SectionHeader
            id="complexity"
            icon={Activity}
            title="Complexity"
            isExpanded={expandedSections.has('complexity')}
            onToggle={toggleSection}
          />
          <AnimatePresence>
            {expandedSections.has('complexity') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-800/30">
                    <span className="text-xs text-surface-500">Time</span>
                    <span className="text-xs font-medium text-primary-400">
                      {data.complexity.average}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-surface-800/30">
                    <span className="text-xs text-surface-500">Space</span>
                    <span className="text-xs font-medium text-surface-300">
                      {data.complexity.space}
                    </span>
                  </div>
                  {data.complexity.best && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-800/30">
                      <span className="text-xs text-surface-500">Best</span>
                      <span className="text-xs font-medium text-success-400">
                        {data.complexity.best}
                      </span>
                    </div>
                  )}
                  {data.complexity.worst && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-800/30">
                      <span className="text-xs text-surface-500">Worst</span>
                      <span className="text-xs font-medium text-error-400">
                        {data.complexity.worst}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
