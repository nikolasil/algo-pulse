export const ALGO_CATEGORIES = [
  {
    id: 'sorting',
    title: 'Sorting Algorithms',
    description:
      'Visualize how data is organized using different computational strategies.',
    icon: '📊',
    path: '/sorting',
    status: 'ACTIVE',
    algos: ['Bubble Sort', 'Quick Sort', 'Merge Sort'],
  },
  {
    id: 'pathfinding',
    title: 'Pathfinding & Tree Traversal',
    description:
      'Find the shortest path between nodes in a complex grid system.',
    icon: '🗺️',
    path: '/pathfinding',
    status: 'ACTIVE',
    algos: [
      "Dijkstra's",
      'A* Search (Manhattan, Euclidean)',
      'Greedy Best-First Search (Manhattan, Euclidean)',
      'BFS',
      'DFS',
      'In-Order',
      'Pre-Order',
      'Post-Order',
    ],
  },
  {
    id: 'searching',
    title: 'Search Patterns',
    description:
      'Efficiently locate specific data points within structured sets.',
    icon: '🔍',
    path: '/searching',
    status: 'ACTIVE',
    algos: ['Linear Search', 'Binary Search', 'Jump Search'],
  },
];
