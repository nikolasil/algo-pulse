import {
  PathfindingAlgorithmType,
  PathfindingNode,
  PathfindingStep,
} from './pathfindingAlgorithms';
import { SearchAlgorithmType, SearchStep } from './searchingAlgorithms';
import { SortingAlgorithmType, SortStep } from './sortingAlgorithms';

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
}

export interface VisualState {
  line: number;
  // Sorting/Searching
  array?: number[];
  comparing?: number[];
  found?: number;
  // Pathfinding
  grid?: PathfindingNode[][];
  variables: Record<string, number | string | boolean>;
}
export type AllAlgorithmTypes =
  | SortingAlgorithmType
  | SearchAlgorithmType
  | PathfindingAlgorithmType;

export type AllStepTypes = SortStep | SearchStep | PathfindingStep;
