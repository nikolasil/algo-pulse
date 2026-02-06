import { Complexity } from './general';

export const pathfindingAlgorithms: PathfindingAlgorithmType[] = [
  'Dijkstra',
  'A*',
  'Greedy',
  'BFS',
  'DFS',
];

export const pathfindingAlgorithmsWithHeuristic: PathfindingAlgorithmType[] = [
  'A*',
  'Greedy',
];

export type PathfindingAlgorithmType =
  | 'Dijkstra'
  | 'A*'
  | 'Greedy'
  | 'BFS'
  | 'DFS';

export const PathfindingComplexities: Record<
  PathfindingAlgorithmType,
  Complexity
> = {
  Dijkstra: {
    best: 'O(E+V\\log V)',
    average: 'O(E+V\\log V)',
    worst: 'O(E+V\\log V)',
    space: 'O(V)',
  },
  'A*': {
    best: 'O(E)',
    average: 'O(E)',
    worst: 'O(b^d)',
    space: 'O(V)',
  },
  Greedy: {
    best: 'O(E)',
    average: 'O(b^d)',
    worst: 'O(b^d)',
    space: 'O(V)',
  },
  BFS: {
    best: 'O(V+E)',
    average: 'O(V+E)',
    worst: 'O(V+E)',
    space: 'O(V)',
  },
  DFS: {
    best: 'O(V+E)',
    average: 'O(V+E)',
    worst: 'O(V+E)',
    space: 'O(V)',
  },
};

// 1. Define the possible extra settings
export interface PathfindingOptions {
  heuristic?: PathfindingHeuristicType;
}

// 2. The Universal Input
export interface PathfindingInput<T = PathfindingOptions> {
  grid: PathfindingNode[][];
  startNode: PathfindingNode;
  endNode: PathfindingNode;
  options: T;
}

export type PathfindingNode = {
  row: number;
  col: number;
  isWall: boolean;
  isMud: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  heuristic: number;
  totalCost: number;
  previousNode: PathfindingNode | null;
};

export const pathfindingHeuristics: PathfindingHeuristicType[] = [
  'Manhattan',
  'Euclidean',
];
export type PathfindingHeuristicType = 'Manhattan' | 'Euclidean';

export interface PathfindingStep {
  line: number;
  grid?: {
    row: number;
    col: number;
    isWall: boolean;
    isMud: boolean;
    isVisited: boolean;
    isPath: boolean;
    distance: number;
    heuristic: number;
    totalCost: number;
    previousNode: PathfindingNode | null;
  }[][];
  variables: Record<string, number | string | boolean>;
}

const getDistance = (
  node: PathfindingNode,
  endNode: PathfindingNode,
  type: PathfindingHeuristicType,
) => {
  const d1 = Math.abs(node.row - endNode.row);
  const d2 = Math.abs(node.col - endNode.col);
  return type === 'Manhattan' ? d1 + d2 : Math.sqrt(d1 * d1 + d2 * d2);
};

const cloneGrid = (grid: PathfindingNode[][]) =>
  grid.map((row) => row.map((node) => ({ ...node })));

function getNeighbors(node: PathfindingNode, grid: PathfindingNode[][]) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((n) => !n.isWall);
}

export const createPathfindingNode = (
  row: number,
  col: number,
): PathfindingNode => ({
  row,
  col,
  isWall: false,
  isMud: false,
  isVisited: false,
  isPath: false,
  distance: Infinity,
  heuristic: Infinity,
  totalCost: Infinity,
  previousNode: null,
});

async function* reconstructPath(
  grid: PathfindingNode[][],
  endNode: PathfindingNode,
  line: number,
  finalVars: Record<string, number | string | boolean>,
) {
  let current: PathfindingNode | null = endNode;
  let pathLength = 0;

  while (current !== null) {
    current.isPath = true;
    pathLength++;
    current = current.previousNode;

    // Yield the grid and the variables at every step of the path animation
    yield {
      grid: cloneGrid(grid),
      line,
      variables: { ...finalVars, pathLength },
    };
  }
}
// --- DIJKSTRA ---
export const dijkstraTraceCode = `function dijkstra(grid, start, end) {
  start.distance = 0;
  const unvisited = grid.flat();
  while (unvisited.length) {
    sortNodesByDistance(unvisited); 
    const curr = unvisited.shift();
    if (curr.isWall) continue;
    curr.isVisited = true; 
    if (curr === end) return getPath(end); 
    updateNeighbors(curr, grid); 
  }
}`;

export async function* dijkstra(
  input: PathfindingInput,
): AsyncGenerator<PathfindingStep> {
  const { grid, startNode, endNode } = input;
  startNode.distance = 0;
  const unvisited = grid.flat();

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => a.distance - b.distance);
    yield {
      line: 4,
      variables: { unvisitedLeft: unvisited.length, sorting: true },
    };

    const curr = unvisited.shift();
    if (!curr || curr.isWall || curr.distance === Infinity) continue;
    yield {
      line: 5,
      variables: { row: curr.row, col: curr.col, dist: curr.distance },
    };

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 7, {
        row: curr.row,
        col: curr.col,
        found: 'Success!',
        totalDistance: curr.distance,
      });
      return;
    }

    curr.isVisited = true;
    yield {
      grid: cloneGrid(grid),
      line: 6,
      variables: { row: curr.row, col: curr.col, status: 'Visiting' },
    };

    const neighbors = getNeighbors(curr, grid);
    let updatedCount = 0;
    for (const neighbor of neighbors) {
      const moveCost = neighbor.isMud ? 5 : 1;
      const newDistance = curr.distance + moveCost;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.previousNode = curr;
        updatedCount++;
      }
    }
    yield {
      line: 8,
      variables: { neighborsChecked: neighbors.length, updated: updatedCount },
    };
  }
}

// --- A* ---
export const aStarTraceCode = `function aStar(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestTotalCost(openSet); 
    if (curr === end) return getPath(end); 
    curr.isVisited = true; 
    updateAStarNeighbors(curr, end); 
  }
}`;

export async function* aStar(
  input: PathfindingInput<{ heuristic: PathfindingHeuristicType }>,
) {
  const { grid, startNode, endNode } = input;
  const { heuristic } = input.options;

  startNode.distance = 0;
  startNode.heuristic = getDistance(startNode, endNode, heuristic);
  startNode.totalCost = startNode.distance + startNode.heuristic;
  const openSet = [startNode];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.totalCost - b.totalCost);
    const curr = openSet.shift();
    if (!curr || curr.isWall) continue;

    yield {
      line: 3,
      variables: {
        openSetSize: openSet.length + 1,
        row: curr.row,
        col: curr.col,
        fScore: curr.totalCost,
      },
    };

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield *
        reconstructPath(grid, curr, 4, {
          row: curr.row,
          col: curr.col,
          found: 'Success!',
          totalDistance: curr.distance,
        });
      return;
    }

    curr.isVisited = true;
    yield {
      grid: cloneGrid(grid),
      line: 5,
      variables: {
        row: curr.row,
        col: curr.col,
        gScore: curr.distance,
        hScore: curr.heuristic,
      },
    };

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      const moveCost = neighbor.isMud ? 5 : 1;
      const gScore = curr.distance + moveCost;
      if (gScore < neighbor.distance) {
        neighbor.previousNode = curr;
        neighbor.distance = gScore;
        neighbor.heuristic = getDistance(neighbor, endNode, heuristic);
        neighbor.totalCost = neighbor.distance + neighbor.heuristic;
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
    yield {
      line: 6,
      variables: {
        neighborsAdded: neighbors.length,
        currentOpenSet: openSet.length,
      },
    };
  }
}

// --- BFS ---
export const bfsTraceCode = `function bfs(start, end) {
  const queue = [start];
  while (queue.length > 0) {
    const curr = queue.shift(); 
    if (curr === end) return backtrace(end); 
    for (const neighbor of getNeighbors(curr)) { 
      if (!neighbor.visited) {
        neighbor.parent = curr;
        queue.push(neighbor);
      }
    }
  }
}`;

export async function* bfs(input: PathfindingInput) {
  const { grid, startNode, endNode } = input;
  const queue: PathfindingNode[] = [startNode];
  startNode.isVisited = true;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    yield {
      line: 4,
      variables: { queueSize: queue.length + 1, row: curr.row, col: curr.col },
    };

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield *
        reconstructPath(grid, curr, 5, {
          row: curr.row,
          col: curr.col,
          found: 'Success!',
          totalDistance: curr.distance,
        });
      return;
    }

    const neighbors = getNeighbors(curr, grid);
    let added = 0;
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.previousNode = curr;
        queue.push(neighbor);
        added++;
      }
    }
    yield {
      grid: cloneGrid(grid),
      line: 6,
      variables: { row: curr.row, col: curr.col, neighborsEnqueued: added },
    };
  }
}

// --- DFS ---
export const dfsTraceCode = `function dfs(start, end) {
  const stack = [start];
  while (stack.length > 0) {
    const curr = stack.pop(); 
    if (curr === end) return backtrace(end); 
    if (!curr.visited) {
      curr.visited = true; 
      stack.push(...neighbors); 
    }
  }
}`;

export async function* dfs(input: PathfindingInput) {
  const { grid, startNode, endNode } = input;
  const stack: PathfindingNode[] = [startNode];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    yield {
      line: 4,
      variables: { stackSize: stack.length + 1, row: curr.row, col: curr.col },
    };

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield *
        reconstructPath(grid, curr, 5, {
          row: curr.row,
          col: curr.col,
          found: 'Success!',
          totalDistance: curr.distance,
        });
      return;
    }

    if (!curr.isVisited) {
      curr.isVisited = true;
      yield {
        grid: cloneGrid(grid),
        line: 7,
        variables: { row: curr.row, col: curr.col, status: 'Exploring Depth' },
      };

      const neighbors = getNeighbors(curr, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.previousNode = curr;
          stack.push(neighbor);
        }
      }
      yield { line: 8, variables: { stackSize: stack.length } };
    }
  }
}

// --- GREEDY BEST-FIRST ---
export const greedyTraceCode = `function greedyBestFirst(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestHeuristic(openSet); 
    if (curr === end) return getPath(end); 
    curr.isVisited = true; 
    updateGreedyNeighbors(curr, end); 
  }
}`;

export async function* greedyBestFirst(
  input: PathfindingInput<{ heuristic: PathfindingHeuristicType }>,
) {
  const { grid, startNode, endNode } = input;
  const { heuristic } = input.options;

  startNode.heuristic = getDistance(startNode, endNode, heuristic);
  const openSet = [startNode];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.heuristic - b.heuristic);
    const curr = openSet.shift();
    if (!curr || curr.isWall || curr.isVisited) continue;

    yield {
      line: 4,
      variables: {
        openSetSize: openSet.length + 1,
        hScore: curr.heuristic,
        row: curr.row,
        col: curr.col,
      },
    };

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield *
        reconstructPath(grid, curr, 5, {
          row: curr.row,
          col: curr.col,
          found: 'Success!',
          totalDistance: curr.distance,
        });
      return;
    }

    curr.isVisited = true;
    yield {
      grid: cloneGrid(grid),
      line: 6,
      variables: { row: curr.row, col: curr.col, status: 'Visiting' },
    };

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = curr;
        neighbor.heuristic = getDistance(neighbor, endNode, heuristic);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
    yield {
      line: 7,
      variables: {
        neighborsAdded: neighbors.length,
        currentOpenSet: openSet.length,
      },
    };
  }
}
