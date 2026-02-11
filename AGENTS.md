# AGENTS.md

## Overview
Algo Pulse is a diagnostic and visualization engine for pathfinding, sorting, searching, and tree algorithms. Built with Next.js 16 (App Router), React 19, and Tailwind CSS 4.

## 1. Development Commands
- **Start Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Lint Codebase**: `npm run lint`
- **Production Server**: `npm run start`

### Testing
Currently, there is no testing framework configured. If you need to add tests, use **Vitest** or **Jest**. To run a single test (once configured), use:
- `npm test -- <path_to_file>` or `vitest run <path_to_file>`

## 2. Code Style & Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **State Management**: React Hooks (`useState`, `useReducer`, `useRef`, `useCallback`)
- **Animations**: `framer-motion`
- **Icons**: `lucide-react`
- **Styling**: Tailwind CSS 4 (using standard slate/slate-950 theme)
- **Syntax Highlighting**: `react-syntax-highlighter`

### Component Guidelines
- Use **functional components** with arrow function syntax.
- Place `'use client';` at the top of files that use hooks or browser APIs.
- Use **PascalCase** for component files and names (e.g., `GridVisualizer.tsx`).
- Keep components small and focused. Move complex logic to custom hooks in `src/hooks/`.

### TypeScript Usage
- **Strict Mode**: Enabled. Avoid `any`.
- **Imports**: Use `import type` for type-only imports.
- **Interfaces**: Prefer `interface` for object definitions and `type` for unions/primitives.
- **Path Aliases**: Use `@/*` for imports from the `src` directory.
- **Shared Types**: Use `VisualState` and `AllStepTypes` from `@/hooks/algorithms/general.ts` for consistency across different algorithm categories.

### Naming Conventions
- **Variables/Functions**: `camelCase` (e.g., `updateGrid`, `currentStepIdx`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `BUBBLE_SORT_TRACE_CODE`).
- **Hooks**: `use` prefix (e.g., `useAlgorithm`, `usePathfindingLogic`).
- **Types/Interfaces**: `PascalCase` (e.g., `SortStep`, `VisualState`).
- **Component Files**: `PascalCase.tsx` (e.g., `ControlPanel.tsx`).

### Algorithm Implementation Pattern
Algorithms must be implemented as **Async Generators** to support step-by-step visualization and history tracking.
- File location: `src/hooks/algorithms/`
- Pattern:
  ```typescript
  export async function* myAlgorithm(input: InputType): AsyncGenerator<StepType> {
    // 1. Initial yield with starting state
    yield { line: 1, variables: { status: 'starting' } };
    
    // 2. Main loop yielding at each critical step
    for (let i = 0; i < input.length; i++) {
      yield { line: 2, comparing: [i], variables: { i } };
      // logic...
      if (condition) {
        yield { line: 3, array: [...newArray], variables: { i, swapped: true } };
      }
    }
  }
  ```
- **Step Objects**: Should include `line` (matching trace code), `variables` (for the debugger view), and category-specific fields like `comparing`, `pivot`, or `grid`.
- **Trace Code**: Every algorithm should have a corresponding `export const [name]TraceCode = \`...\`` string that provides a simplified JavaScript implementation for the `CodeViewer` component.

### State Management & Hooks
- **useAlgorithm Hook**: Central logic for running, pausing, and stepping through generators. Use its returned values (`array`, `grid`, `comparing`, `activeLine`, `variables`) in visualizer components.
- **Memoization**: Wrap all functions returned from hooks or passed as props in `useCallback` to prevent unnecessary re-renders.
- **Refs**: Use `useRef` for values that need to be accessed inside asynchronous loops without triggering re-renders (like `isRunningRef`, `pauseRef`, `stopRef`).

### UI & Styling
- **Theme**: Dark mode only, using `slate-950` as background and `slate-100` as primary text.
- **Color Palette**:
  - `blue-500`: Neutral/Comparing state.
  - `emerald-500`: Success/Found/Sorted state.
  - `red-500`: Error/Obstacle/Conflict state.
  - `amber-500`: Pivot/Special attention state.
- **Animations**: Use `framer-motion` for all visual updates. Bars in `BarVizualizer` and nodes in `GridVisualizer` should use `layout` prop or `animate` prop for smooth transitions.
- **Responsive Design**: Ensure components like `ControlPanel` and `Sidebar` are usable on different screen sizes.

### Error Handling
- Use standard `try/catch` blocks for asynchronous operations.
- Ensure algorithms check for `undefined` when accessing array indices or grid nodes.
- Log significant errors to the console or the `TelemetryLog` component for diagnostic purposes.
- Gracefully handle algorithm interruptions (e.g., when the user clicks 'Reset' while an algorithm is running).

## 3. Directory Structure
- `src/app/`: App router pages and layouts.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom hooks and algorithm implementations.
- `src/structures/`: Logic for specific data structures (e.g., trees).
- `src/types/`: Global and shared type definitions.

## 4. Cursor & Copilot Rules
(No project-specific rules found in `.cursorrules` or `.github/`. Follow the guidelines above and standard Next.js best practices.)
