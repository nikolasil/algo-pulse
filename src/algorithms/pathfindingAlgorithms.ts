export type Node = {
  row: number;
  col: number;
  isWall: boolean;
  isMud: boolean; // New: Weighted node
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
  if (type === 'Manhattan') return d1 + d2;
  return Math.sqrt(d1 * d1 + d2 * d2);
};

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
    yield { grid: [...grid.map((row) => [...row])], line };
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
    const curr = unvisited.shift();

    if (!curr || curr.isWall || curr.distance === Infinity) continue;
    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 10);
      return;
    }

    curr.isVisited = true;
    yield { grid: [...grid.map((row) => [...row])], line: 9 };

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      // Logic: distance + weight (1 or 5)
      const moveCost = neighbor.isMud ? 5 : 1;
      const newDistance = curr.distance + moveCost;

      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.previousNode = curr;
      }
    }
    yield { grid: [...grid.map((row) => [...row])], line: 11 };
  }
}

// --- A* SEARCH ---
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
    const curr = openSet.shift();

    if (!curr || curr.isWall) continue;
    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 5);
      return;
    }

    curr.isVisited = true;
    yield { grid: [...grid.map((row) => [...row])], line: 6 };

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
    yield { grid: [...grid.map((row) => [...row])], line: 7 };
  }
}

// --- GREEDY BEST-FIRST ---
export async function* greedyBestFirst(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
  heuristic: HeuristicType = 'Manhattan',
) {
  const openSet = [startNode];
  while (openSet.length > 0) {
    openSet.sort((a, b) => a.heuristic - b.heuristic);
    const curr = openSet.shift();
    if (!curr || curr.isWall || curr.isVisited) continue;
    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 5);
      return;
    }
    curr.isVisited = true;
    yield { grid: [...grid.map((row) => [...row])], line: 6 };
    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = curr;
        neighbor.heuristic = getDistance(neighbor, endNode, heuristic);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
    yield { grid: [...grid.map((row) => [...row])], line: 7 };
  }
}

function getNeighbors(node: Node, grid: Node[][]) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((n) => !n.isWall);
}

// Code strings (same as before)
export const dijkstraCode = `function dijkstra(grid, start, end) {
  start.distance = 0;
  const unvisited = grid.flat();
  while (unvisited.length) {
    sortNodesByDistance(unvisited);
    const curr = unvisited.shift();
    if (curr.isWall) continue;
    curr.isVisited = true;
    if (curr === end) return getPath(end);
    updateNeighbors(curr, grid); // Cost = distance + weight
  }
}`;

export const aStarCode = `function aStar(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestTotalCost(openSet);
    if (curr === end) return getPath(end);
    curr.isVisited = true;
    updateAStarNeighbors(curr, end); // Cost = distance + weight + heuristic
  }
}`;

export const greedyCode = `function greedyBestFirst(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestHeuristic(openSet);
    if (curr === end) return getPath(end);
    curr.isVisited = true;
    updateGreedyNeighbors(curr, end); // Only cares about heuristic
  }
}`;
