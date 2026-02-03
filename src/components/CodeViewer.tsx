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
}

export const CodeViewer = ({ data, activeLine }: Props) => {
  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-2xl">
      <div className="flex items-center gap-2 mb-3 text-slate-500 border-b border-slate-800 pb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        <span className="uppercase tracking-[0.2em] text-[8px]">
          Source Trace
        </span>
      </div>
      <SyntaxHighlighter
        language="javascript"
        style={atomDark}
        customStyle={{
          background: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: '10px',
          lineHeight: '1.5',
        }}
        showLineNumbers={true}
        wrapLines={true}
        // Updated to explicitly return React.HTMLProps<HTMLElement> style
        lineProps={(lineNumber: number) => {
          const isCurrent = lineNumber === activeLine;
          return {
            style: {
              display: 'block',
              width: '100%',
              backgroundColor: isCurrent
                ? 'rgba(6, 182, 212, 0.2)'
                : 'transparent',
              borderLeft: isCurrent
                ? '2px solid #06b6d4'
                : '2px solid transparent',
              paddingLeft: isCurrent ? '4px' : '4px',
              transition: 'all 0.2s ease',
            },
          };
        }}
      >
        {data.algorithmTraceCode}
      </SyntaxHighlighter>
      {data.complexity && (
        <div className="mt-4">
          <div>
            <strong className="text-slate-400">Complexities:</strong>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            <strong>Time:</strong> Avg: {data.complexity.average}, Best:{' '}
            {data.complexity.best}, Worst: {data.complexity.worst}
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            <strong>Space:</strong> {data.complexity.space}
          </div>
        </div>
      )}
    </div>
  );
};
