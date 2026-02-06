import { Complexity } from './general';

// Update the list of algorithms
export const searchAlgorithms: SearchAlgorithmType[] = [
  'Linear',
  'Binary',
  'Jump',
  'Interpolation',
  'Exponential',
];

// Update the Type Definition
export type SearchAlgorithmType =
  | 'Linear'
  | 'Binary'
  | 'Jump'
  | 'Interpolation'
  | 'Exponential';

// Update Complexities
export const searchComplexities: Record<SearchAlgorithmType, Complexity> = {
  Linear: { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' },
  Binary: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
  },
  Jump: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)', space: 'O(1)' },
  Interpolation: {
    best: 'O(1)',
    average: 'O(log(log n))',
    worst: 'O(n)',
    space: 'O(1)',
  },
  Exponential: {
    best: 'O(1)',
    average: 'O(log i)',
    worst: 'O(log i)',
    space: 'O(1)',
  },
};

// ... keep SearchInput and SearchStep interfaces as they are ...
export interface SearchInput {
  array: number[];
  target: number;
}

export interface SearchStep {
  line: number;
  comparing?: number[];
  range?: [number, number];
  found?: number;
  variables: Record<string, number | string | boolean>;
}

// --- LINEAR SEARCH ---
export const linearSearchTraceCode = `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`;

export async function* linearSearch(
  input: SearchInput,
): AsyncGenerator<SearchStep> {
  const { array, target } = input;
  for (let i = 0; i < array.length; i++) {
    yield {
      line: 2,
      comparing: [i],
      variables: { i, current: array[i], target },
    };
    if (array[i] === target) {
      yield { line: 3, found: i, variables: { i, found: true } };
      return;
    }
  }
  yield { line: 5, variables: { found: false } };
}

// --- BINARY SEARCH ---
export const binarySearchTraceCode = `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`;

export async function* binarySearch(
  input: SearchInput,
): AsyncGenerator<SearchStep> {
  const { array, target } = input;
  let low = 0,
    high = array.length - 1;
  yield { line: 2, variables: { low, high } };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    yield { line: 3, range: [low, high], variables: { low, high, mid } };
    yield {
      line: 4,
      comparing: [mid],
      variables: { low, high, mid, val: array[mid] },
    };

    if (array[mid] === target) {
      yield { line: 5, found: mid, variables: { mid, found: true } };
      return;
    }

    if (array[mid] < target) {
      low = mid + 1;
      yield { line: 6, variables: { low, high, mid, action: 'Move Low' } };
    } else {
      high = mid - 1;
      yield { line: 7, variables: { low, high, mid, action: 'Move High' } };
    }
  }
  yield { line: 9, variables: { found: false } };
}

// --- JUMP SEARCH ---
export const jumpSearchTraceCode = `function jumpSearch(arr, target) {
  let n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(step, n)-1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev == Math.min(step, n)) return -1;
  }
  if (arr[prev] == target) return prev;
  return -1;
}`;

export async function* jumpSearch(
  input: SearchInput,
): AsyncGenerator<SearchStep> {
  const { array, target } = input;
  const n = array.length;
  const jumpSize = Math.floor(Math.sqrt(n));
  let step = jumpSize;
  let prev = 0;

  yield { line: 2, variables: { n } };
  yield { line: 3, variables: { jumpSize, step } };
  yield { line: 4, variables: { prev } };

  while (array[Math.min(step, n) - 1] < target) {
    yield {
      line: 5,
      comparing: [Math.min(step, n) - 1],
      variables: {
        prev,
        step,
        checkIdx: Math.min(step, n) - 1,
        val: array[Math.min(step, n) - 1],
      },
    };
    prev = step;
    yield { line: 6, variables: { prev, step } };
    step += jumpSize;
    yield { line: 7, variables: { prev, step } };
    if (prev >= n) {
      yield { line: 8, variables: { prev, status: 'Out of bounds' } };
      return;
    }
  }

  yield {
    line: 10,
    range: [prev, Math.min(step, n) - 1],
    variables: { prev, step, phase: 'Linear' },
  };
  while (array[prev] < target) {
    yield {
      line: 11,
      comparing: [prev],
      variables: { prev, val: array[prev] },
    };
    prev++;
    if (prev === Math.min(step, n)) {
      yield { line: 12, variables: { prev, status: 'Not in block' } };
      return;
    }
  }

  yield {
    line: 14,
    comparing: [prev],
    variables: { prev, finalVal: array[prev] },
  };
  if (array[prev] === target) {
    yield { line: 14, found: prev, variables: { prev, found: true } };
  } else {
    yield { line: 15, variables: { found: false } };
  }
}

// --- INTERPOLATION SEARCH ---
export const interpolationSearchTraceCode = `function interpolationSearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      if (arr[low] === target) return low;
      return -1;
    }
    let pos = low + Math.floor(
      ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])
    );
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`;

export async function* interpolationSearch(
  input: SearchInput,
): AsyncGenerator<SearchStep> {
  const { array, target } = input;
  let low = 0;
  let high = array.length - 1;

  yield { line: 2, variables: { low, high } };

  while (low <= high && target >= array[low] && target <= array[high]) {
    yield { line: 3, range: [low, high], variables: { low, high, target } };

    if (low === high) {
      yield { line: 4, variables: { low, high, single: true } };
      if (array[low] === target) {
        yield { line: 5, found: low, variables: { low, found: true } };
        return;
      }
      yield { line: 6, variables: { found: false } };
      return;
    }

    const pos =
      low +
      Math.floor(
        ((target - array[low]) * (high - low)) / (array[high] - array[low]),
      );

    yield {
      line: 9,
      comparing: [pos],
      variables: { low, high, pos, val: array[pos] },
    };

    if (array[pos] === target) {
      yield { line: 13, found: pos, variables: { pos, found: true } };
      return;
    }

    if (array[pos] < target) {
      low = pos + 1;
      yield { line: 14, variables: { low, high, pos, action: 'Move Low' } };
    } else {
      high = pos - 1;
      yield { line: 15, variables: { low, high, pos, action: 'Move High' } };
    }
  }
  yield { line: 18, variables: { found: false } };
}

// --- EXPONENTIAL SEARCH ---
export const exponentialSearchTraceCode = `function exponentialSearch(arr, target) {
  if (arr[0] === target) return 0;
  let i = 1;
  while (i < arr.length && arr[i] <= target) {
    i = i * 2;
  }
  let low = i / 2, high = Math.min(i, arr.length - 1);
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`;

export async function* exponentialSearch(
  input: SearchInput,
): AsyncGenerator<SearchStep> {
  const { array, target } = input;
  const n = array.length;

  yield { line: 2, comparing: [0], variables: { i: 0, val: array[0], target } };
  if (array[0] === target) {
    yield { line: 2, found: 0, variables: { found: true } };
    return;
  }

  let i = 1;
  yield { line: 3, variables: { i } };

  while (i < n && array[i] <= target) {
    yield {
      line: 4,
      comparing: [i],
      variables: { i, val: array[i], status: 'Doubling' },
    };
    i = i * 2;
    yield { line: 5, variables: { i } };
  }

  let low = Math.floor(i / 2);
  let high = Math.min(i, n - 1);
  yield {
    line: 8,
    range: [low, high],
    variables: { low, high, i, phase: 'Binary Search' },
  };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    yield { line: 10, range: [low, high], variables: { low, high, mid } };
    yield { line: 11, comparing: [mid], variables: { mid, val: array[mid] } };

    if (array[mid] === target) {
      yield { line: 12, found: mid, variables: { mid, found: true } };
      return;
    }

    if (array[mid] < target) {
      low = mid + 1;
      yield { line: 13, variables: { low, high, mid } };
    } else {
      high = mid - 1;
      yield { line: 14, variables: { low, high, mid } };
    }
  }
  yield { line: 17, variables: { found: false } };
}
