'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

export const CodeViewer = ({ data, activeLine, variables }: Props) => {
  const hasVariables = Object.keys(variables).length > 0;

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs shadow-2xl sm:p-4 lg:flex-row lg:overflow-hidden">
      {/* LEFT SIDE: Code Trace */}
      <div className="flex flex-[2] flex-col min-h-0 min-w-0 gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]">
              Source Trace
            </span>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-auto rounded-md bg-slate-900/20 scrollbar-hide">
          <SyntaxHighlighter
            language="javascript"
            style={atomDark}
            customStyle={{
              background: 'transparent',
              padding: '12px 0',
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
      </div>

      {/* RIGHT SIDE: Debugger / Variables */}
      <div className="flex flex-1 flex-col gap-3 lg:border-l lg:border-slate-800 lg:pl-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-500">
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            Variables
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
          {hasVariables ? (
            Object.entries(variables).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/30 p-2"
              >
                <span className="text-[10px] font-bold text-pink-400">
                  {key}
                </span>
                <span className="text-[11px] font-bold text-cyan-300">
                  {typeof value === 'boolean'
                    ? value
                      ? 'true'
                      : 'false'
                    : value}
                </span>
              </div>
            ))
          ) : (
            <div className="flex h-20 items-center justify-center rounded border border-dashed border-slate-800 text-[10px] text-slate-600 italic">
              No active variables
            </div>
          )}
        </div>

        {/* Complexity Footer */}
        {data.complexity && (
          <div className="mt-auto flex flex-col gap-2 border-t border-slate-800 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase text-slate-500">
                Complexity
              </span>
              <span className="text-[10px] text-cyan-500/80">
                {data.complexity.average}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-bold uppercase text-slate-500">
                Space
              </span>
              <span className="text-[10px] text-slate-400">
                {data.complexity.space}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
