export type Node = {
  row: number;
  col: number;
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  previousNode: Node | null;
};

export const createNode = (row: number, col: number): Node => ({
  row,
  col,
  isWall: false,
  isVisited: false,
  isPath: false,
  distance: Infinity,
  previousNode: null,
});

export async function* dijkstra(
  grid: Node[][],
  startNode: Node,
  endNode: Node,
) {
  startNode.distance = 0;
  const unvisitedNodes = grid.flat();

  while (unvisitedNodes.length > 0) {
    // Line 5: Sort
    unvisitedNodes.sort((a, b) => a.distance - b.distance);

    // Line 6: Shift
    const closestNode = unvisitedNodes.shift();

    if (!closestNode || closestNode.isWall) continue;
    if (closestNode.distance === Infinity) break;

    closestNode.isVisited = true;

    // YIELD: Highlight 'curr.isVisited = true' (Line 9)
    yield { grid: [...grid.map((row) => [...row])], line: 9 };

    if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
      let current: Node | null = closestNode;
      while (current !== null) {
        current.isPath = true;
        current = current.previousNode;
        // YIELD: Highlight 'return getPath(end)' (Line 10)
        yield { grid: [...grid.map((row) => [...row])], line: 10 };
      }
      return;
    }

    const neighbors = getNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
      neighbor.distance = closestNode.distance + 1;
      neighbor.previousNode = closestNode;
    }

    // YIELD: Highlight 'updateNeighbors' (Line 11)
    yield { grid: [...grid.map((row) => [...row])], line: 11 };
  }
}

function getNeighbors(node: Node, grid: Node[][]) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((n) => !n.isVisited && !n.isWall);
}

export const dijkstraCode = `function dijkstra(grid, start, end) {
  start.distance = 0;
  const unvisited = grid.flat();
  while (unvisited.length) {
    sortNodesByDistance(unvisited);
    const curr = unvisited.shift();
    if (curr.isWall) continue;
    if (curr.distance === Infinity) break;
    curr.isVisited = true;
    if (curr === end) return getPath(end);
    updateNeighbors(curr, grid);
  }
}`;
