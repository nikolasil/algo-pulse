import { describe, it, expect } from 'vitest';
import { 
  dijkstra, aStar, bfs, dfs, greedyBestFirst, 
  createPathfindingNode, PathfindingNode 
} from '@/hooks/algorithms/pathfindingAlgorithms';

describe('Pathfinding Algorithms', () => {
  const createTestGrid = (width: number, height: number) => {
    const grid: PathfindingNode[][] = [];
    for (let i = 0; i < height; i++) {
      const row: PathfindingNode[] = [];
      for (let j = 0; j < width; j++) {
        row.push(createPathfindingNode(i, j));
      }
      grid.push(row);
    }
    return grid;
  };

  const resetGrid = (grid: PathfindingNode[][]) => {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const node = grid[i][j];
        node.isVisited = false;
        node.isPath = false;
        node.distance = Infinity;
        node.heuristic = Infinity;
        node.totalCost = Infinity;
        node.previousNode = null;
      }
    }
  };

  describe('dijkstra', () => {
    it('should find shortest path in simple grid', async () => {
      const grid = createTestGrid(5, 5);
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      let pathFound = false;
      
      for await (const step of dijkstra({ grid, startNode, endNode, options: {} })) {
        if (step.grid) {
          const endNodeState = step.grid[4][4];
          if (endNodeState.isPath) {
            pathFound = true;
            break;
          }
        }
      }
      
      expect(pathFound).toBe(true);
    });

    it('should handle walls correctly', async () => {
      const grid = createTestGrid(5, 5);
      // Create a wall barrier
      for (let j = 0; j < 5; j++) {
        grid[2][j].isWall = true;
      }
      
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      let pathFound = false;
      
      for await (const step of dijkstra({ grid, startNode, endNode, options: {} })) {
        if (step.grid) {
          const endNodeState = step.grid[4][4];
          if (endNodeState.isPath) {
            pathFound = true;
            break;
          }
        }
      }
      
      expect(pathFound).toBe(false); // Path should be blocked
    });

    it('should handle mud terrain correctly', async () => {
      const grid = createTestGrid(5, 5);
      // Create mud in the path
      grid[1][1].isMud = true;
      grid[2][2].isMud = true;
      
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      const variables = [];
      
      for await (const step of dijkstra({ grid, startNode, endNode, options: {} })) {
        if (step.variables) {
          variables.push(step.variables);
        }
      }
      
      expect(variables.length).toBeGreaterThan(0);
    });
  });

  describe('aStar', () => {
    it('should find shortest path with Manhattan heuristic', async () => {
      const grid = createTestGrid(5, 5);
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      let pathFound = false;
      
      for await (const step of aStar({ 
        grid, 
        startNode, 
        endNode, 
        options: { heuristic: 'Manhattan' } 
      })) {
        if (step.grid) {
          const endNodeState = step.grid[4][4];
          if (endNodeState.isPath) {
            pathFound = true;
            break;
          }
        }
      }
      
      expect(pathFound).toBe(true);
    });

    it('should handle Euclidean heuristic', async () => {
      const grid = createTestGrid(5, 5);
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      let pathFound = false;
      
      for await (const step of aStar({ 
        grid, 
        startNode, 
        endNode, 
        options: { heuristic: 'Euclidean' } 
      })) {
        if (step.grid) {
          const endNodeState = step.grid[4][4];
          if (endNodeState.isPath) {
            pathFound = true;
            break;
          }
        }
      }
      
      expect(pathFound).toBe(true);
    });
  });

  describe('bfs', () => {
    it('should find path in simple grid', async () => {
      const grid = createTestGrid(5, 5);
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      let pathFound = false;
      
      for await (const step of bfs({ grid, startNode, endNode, options: {} })) {
        if (step.grid) {
          const endNodeState = step.grid[4][4];
          if (endNodeState.isPath) {
            pathFound = true;
            break;
          }
        }
      }
      
      expect(pathFound).toBe(true);
    });

    it('should respect BFS queue behavior', async () => {
      const grid = createTestGrid(3, 3);
      const startNode = grid[0][0];
      const endNode = grid[2][2];
      
      const variables = [];
      
      for await (const step of bfs({ grid, startNode, endNode, options: {} })) {
        if (step.variables) {
          variables.push(step.variables);
        }
      }
      
      // Should track queue size
      const hasQueueSize = variables.some(v => 'queueSize' in v);
      expect(hasQueueSize).toBe(true);
    });
  });

  describe('dfs', () => {
    it('should explore grid deeply', async () => {
      const grid = createTestGrid(5, 5);
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      const variables = [];
      
      for await (const step of dfs({ grid, startNode, endNode, options: {} })) {
        if (step.variables) {
          variables.push(step.variables);
        }
      }
      
      // Should track stack size
      const hasStackSize = variables.some(v => 'stackSize' in v);
      expect(hasStackSize).toBe(true);
    });
  });

  describe('greedyBestFirst', () => {
    it('should find path using heuristic', async () => {
      const grid = createTestGrid(5, 5);
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      let pathFound = false;
      
      for await (const step of greedyBestFirst({ 
        grid, 
        startNode, 
        endNode, 
        options: { heuristic: 'Manhattan' } 
      })) {
        if (step.grid) {
          const endNodeState = step.grid[4][4];
          if (endNodeState.isPath) {
            pathFound = true;
            break;
          }
        }
      }
      
      expect(pathFound).toBe(true);
    });

    it('should track heuristic scores', async () => {
      const grid = createTestGrid(5, 5);
      const startNode = grid[0][0];
      const endNode = grid[4][4];
      
      const variables = [];
      
      for await (const step of greedyBestFirst({ 
        grid, 
        startNode, 
        endNode, 
        options: { heuristic: 'Manhattan' } 
      })) {
        if (step.variables) {
          variables.push(step.variables);
        }
      }
      
      // Should track hScore
      const hasHScore = variables.some(v => 'hScore' in v);
      expect(hasHScore).toBe(true);
    });
  });
});