import { Node } from './pathfindingAlgorithms';

/**
 * BREADTH-FIRST SEARCH (BFS)
 * Explores layer by layer. Guaranteed shortest path on unweighted grids.
 */
export async function* bfs(grid: Node[][], startNode: Node, endNode: Node) {
  const queue: Node[] = [startNode];
  startNode.isVisited = true;
  const exploredNodes: Node[] = [];

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    exploredNodes.push(currentNode);

    // Yield current state for visualization
    yield { grid: [...grid], activeNode: currentNode };

    if (currentNode === endNode) {
      return yield* reconstructPath(grid, endNode);
    }

    const neighbors = getNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        neighbor.isVisited = true;
        neighbor.previousNode = currentNode; // Track the path!
        queue.push(neighbor);
      }
    }
  }
}

/**
 * DEPTH-FIRST SEARCH (DFS)
 * Explores as deep as possible. Path is usually non-optimal.
 */
export async function* dfs(grid: Node[][], startNode: Node, endNode: Node) {
  const stack: Node[] = [startNode];
  const exploredNodes: Node[] = [];

  while (stack.length > 0) {
    const currentNode = stack.pop()!;

    if (!currentNode.isVisited) {
      currentNode.isVisited = true;
      exploredNodes.push(currentNode);

      yield { grid: [...grid], activeNode: currentNode };

      if (currentNode === endNode) {
        return yield* reconstructPath(grid, endNode);
      }

      const neighbors = getNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          neighbor.previousNode = currentNode; // Track the path!
          stack.push(neighbor);
        }
      }
    }
  }
}

/**
 * Helper: Reconstructs the path by following previousNode pointers
 */
async function* reconstructPath(grid: Node[][], endNode: Node) {
  let current: Node | null = endNode;
  const path: Node[] = [];
  
  while (current !== null) {
    path.unshift(current);
    current.isPath = true;
    current = current.previousNode;
    // Animate the path drawing
    yield { grid: [...grid] };
  }
}

/**
 * Helper: Gets valid 4-way neighbors
 */
function getNeighbors(node: Node, grid: Node[][]) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}

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
    // ... mark visited and push neighbors
  }
}`;