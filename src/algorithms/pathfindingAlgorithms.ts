export type Node = {
  row: number;
  col: number;
  isWall: boolean;
  isMud: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  heuristic: number;
  totalCost: number;
  previousNode: Node | null;
};

export type HeuristicType = 'Manhattan' | 'Euclidean';

const getDistance = (node: Node, endNode: Node, type: HeuristicType) => {
  const d1 = Math.abs(node.row - endNode.row);
  const d2 = Math.abs(node.col - endNode.col);
  return type === 'Manhattan' ? d1 + d2 : Math.sqrt(d1 * d1 + d2 * d2);
};

const cloneGrid = (grid: Node[][]) =>
  grid.map((row) => row.map((node) => ({ ...node })));

function getNeighbors(node: Node, grid: Node[][]) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((n) => !n.isWall);
}

export const createNode = (row: number, col: number): Node => ({
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

async function* reconstructPath(grid: Node[][], endNode: Node, line: number) {
  let current: Node | null = endNode;
  while (current !== null) {
    current.isPath = true;
    current = current.previousNode;
    // Visually update the path
    yield { grid: cloneGrid(grid), line };
  }
}

// --- DIJKSTRA ---
export async function* dijkstra(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
) {
  startNode.distance = 0;
  const unvisited = grid.flat();

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => a.distance - b.distance);
    yield { line: 4 }; // Highlight Sort (Fast: No clone)

    const curr = unvisited.shift();
    if (!curr || curr.isWall || curr.distance === Infinity) continue;

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 8);
      return;
    }

    curr.isVisited = true;
    yield { grid: cloneGrid(grid), line: 7 }; // Highlight Visited (Visual change: Clone)

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      const moveCost = neighbor.isMud ? 5 : 1;
      const newDistance = curr.distance + moveCost;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.previousNode = curr;
      }
    }
    yield { line: 9 }; // Highlight Neighbors update (Fast: No clone)
  }
}

// --- A* ---
export async function* aStar(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
  heuristic: HeuristicType = 'Manhattan',
) {
  startNode.distance = 0;
  startNode.heuristic = getDistance(startNode, endNode, heuristic);
  startNode.totalCost = startNode.distance + startNode.heuristic;
  const openSet = [startNode];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.totalCost - b.totalCost);
    yield { line: 3 }; // Highlight getLowestTotalCost

    const curr = openSet.shift();
    if (!curr || curr.isWall) continue;

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4);
      return;
    }

    curr.isVisited = true;
    yield { grid: cloneGrid(grid), line: 5 }; // Highlight Visited (Visual change)

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
    yield { line: 6 }; // Highlight Neighbors update
  }
}

// --- BFS ---
export async function* bfs(grid: Node[][], startNode: Node, endNode: Node) {
  const queue: Node[] = [startNode];
  startNode.isVisited = true;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    yield { line: 3 }; // Highlight shift

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4);
      return;
    }

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.previousNode = curr;
        queue.push(neighbor);
      }
    }
    yield { grid: cloneGrid(grid), line: 5 }; // Highlight Neighbors (Visual change)
  }
}

// --- DFS ---
export async function* dfs(grid: Node[][], startNode: Node, endNode: Node) {
  const stack: Node[] = [startNode];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    yield { line: 3 }; // Highlight pop

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4);
      return;
    }

    if (!curr.isVisited) {
      curr.isVisited = true;
      yield { grid: cloneGrid(grid), line: 6 }; // Highlight Visited (Visual change)

      const neighbors = getNeighbors(curr, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.previousNode = curr;
          stack.push(neighbor);
        }
      }
      yield { line: 7 }; // Highlight Neighbors update
    }
  }
}

// --- GREEDY BEST-FIRST ---
export async function* greedyBestFirst(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
  heuristic: HeuristicType = 'Manhattan',
) {
  startNode.heuristic = getDistance(startNode, endNode, heuristic);
  const openSet = [startNode];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.heuristic - b.heuristic);
    yield { line: 3 }; // Highlight getLowestHeuristic

    const curr = openSet.shift();
    if (!curr || curr.isWall || curr.isVisited) continue;

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4);
      return;
    }

    curr.isVisited = true;
    yield { grid: cloneGrid(grid), line: 5 }; // Highlight Visited

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = curr;
        neighbor.heuristic = getDistance(neighbor, endNode, heuristic);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
    yield { line: 6 }; // Highlight Neighbors update
  }
}

// --- DISPLAY STRINGS (Kept as provided) ---
export const dijkstraCode = `function dijkstra(grid, start, end) {
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

export const aStarCode = `function aStar(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestTotalCost(openSet); 
    if (curr === end) return getPath(end); 
    curr.isVisited = true; 
    updateAStarNeighbors(curr, end); 
  }
}`;

export const greedyCode = `function greedyBestFirst(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestHeuristic(openSet); 
    if (curr === end) return getPath(end); 
    curr.isVisited = true; 
    updateGreedyNeighbors(curr, end); 
  }
}`;

export const bfsCode = `function bfs(start, end) {
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

export const dfsCode = `function dfs(start, end) {
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
