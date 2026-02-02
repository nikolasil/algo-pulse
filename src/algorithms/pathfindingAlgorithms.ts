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
    yield { grid: cloneGrid(grid), line };
  }
}

// --- ALGORITHMS ---

export async function* dijkstra(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
) {
  startNode.distance = 0;
  const unvisited = grid.flat();

  while (unvisited.length > 0) {
    unvisited.sort((a, b) => a.distance - b.distance); // Line 4
    const curr = unvisited.shift();

    if (!curr || curr.isWall || curr.distance === Infinity) continue;

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 8); // Line 8: getPath
      return;
    }

    curr.isVisited = true; // Line 7

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      const moveCost = neighbor.isMud ? 5 : 1;
      const newDistance = curr.distance + moveCost;
      if (newDistance < neighbor.distance) {
        neighbor.distance = newDistance;
        neighbor.previousNode = curr;
      }
    }
    yield { grid: cloneGrid(grid), line: 9 }; // Line 9: updateNeighbors
  }
}

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
    openSet.sort((a, b) => a.totalCost - b.totalCost); // Line 3
    const curr = openSet.shift();

    if (!curr || curr.isWall) continue;

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4); // Line 4: getPath
      return;
    }

    curr.isVisited = true; // Line 5

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
    yield { grid: cloneGrid(grid), line: 6 }; // Line 6: updateAStarNeighbors
  }
}

export async function* bfs(grid: Node[][], startNode: Node, endNode: Node) {
  const queue: Node[] = [startNode];
  startNode.isVisited = true;

  while (queue.length > 0) {
    const curr = queue.shift()!; // Line 3

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4); // Line 4: backtrace
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
    yield { grid: cloneGrid(grid), line: 5 }; // Line 5: for (neighbor...)
  }
}

export async function* dfs(grid: Node[][], startNode: Node, endNode: Node) {
  const stack: Node[] = [startNode];

  while (stack.length > 0) {
    const curr = stack.pop()!; // Line 3

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4); // Line 4: backtrace
      return;
    }

    if (!curr.isVisited) {
      curr.isVisited = true; // Line 6
      const neighbors = getNeighbors(curr, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.previousNode = curr;
          stack.push(neighbor);
        }
      }
      yield { grid: cloneGrid(grid), line: 7 }; // Line 7: stack.push
    }
  }
}

export async function* greedyBestFirst(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
  heuristic: HeuristicType = 'Manhattan',
) {
  startNode.heuristic = getDistance(startNode, endNode, heuristic);
  const openSet = [startNode];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.heuristic - b.heuristic); // Line 3
    const curr = openSet.shift();

    if (!curr || curr.isWall || curr.isVisited) continue;

    if (curr.row === endNode.row && curr.col === endNode.col) {
      yield* reconstructPath(grid, curr, 4); // Line 4: getPath
      return;
    }

    curr.isVisited = true; // Line 5

    const neighbors = getNeighbors(curr, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.previousNode = curr;
        neighbor.heuristic = getDistance(neighbor, endNode, heuristic);
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
    yield { grid: cloneGrid(grid), line: 6 }; // Line 6: updateGreedy
  }
}

// --- DISPLAY STRINGS ---

export const dijkstraCode = `function dijkstra(grid, start, end) {
  start.distance = 0;
  const unvisited = grid.flat();
  while (unvisited.length) {
    sortNodesByDistance(unvisited); // Line 4
    const curr = unvisited.shift();
    if (curr.isWall) continue;
    curr.isVisited = true; // Line 7
    if (curr === end) return getPath(end); // Line 8
    updateNeighbors(curr, grid); // Line 9
  }
}`;

export const aStarCode = `function aStar(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestTotalCost(openSet); // Line 3
    if (curr === end) return getPath(end); // Line 4
    curr.isVisited = true; // Line 5
    updateAStarNeighbors(curr, end); // Line 6
  }
}`;

export const greedyCode = `function greedyBestFirst(grid, start, end) {
  openSet.push(start);
  while (openSet.length) {
    const curr = getLowestHeuristic(openSet); // Line 3
    if (curr === end) return getPath(end); // Line 4
    curr.isVisited = true; // Line 5
    updateGreedyNeighbors(curr, end); // Line 6
  }
}`;

export const bfsCode = `function bfs(start, end) {
  const queue = [start];
  while (queue.length > 0) {
    const curr = queue.shift(); // Line 3
    if (curr === end) return backtrace(end); // Line 4
    for (const neighbor of getNeighbors(curr)) { // Line 5
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
    const curr = stack.pop(); // Line 3
    if (curr === end) return backtrace(end); // Line 4
    if (!curr.visited) {
      curr.visited = true; // Line 6
      stack.push(...neighbors); // Line 7
    }
  }
}`;
