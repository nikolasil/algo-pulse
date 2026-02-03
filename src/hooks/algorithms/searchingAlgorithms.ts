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
    // Highlight the loop iteration
    yield { line: 2, comparing: [i] };

    // Highlight the comparison and return if found
    if (array[i] === target) {
      yield { line: 3, found: i };
      return;
    }
  }
  // Highlight the final return if not found
  yield { line: 5 };
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
  yield { line: 2 };

  while (low <= high) {
    yield { line: 3, range: [low, high] };
    const mid = Math.floor((low + high) / 2);
    yield { line: 4, comparing: [mid] };

    if (array[mid] === target) {
      yield { line: 5, found: mid };
      return;
    }

    if (array[mid] < target) {
      yield { line: 6 };
      low = mid + 1;
    } else {
      yield { line: 7 };
      high = mid - 1;
    }
  }
  yield { line: 9 };
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
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;

  yield { line: 2 };
  yield { line: 3 };
  yield { line: 4 };

  // Jumping phase
  while (array[Math.min(step, n) - 1] < target) {
    yield {
      line: 5,
      comparing: [Math.min(step, n) - 1],
      range: [prev, Math.min(step, n) - 1],
    };
    prev = step;
    yield { line: 6 };
    step += Math.floor(Math.sqrt(n));
    yield { line: 7 };
    if (prev >= n) {
      yield { line: 8 };
      return;
    }
  }

  // Linear phase within the block
  yield { line: 10, range: [prev, Math.min(step, n) - 1] };
  while (array[prev] < target) {
    yield { line: 11, comparing: [prev] };
    prev++;
    if (prev === Math.min(step, n)) {
      yield { line: 12 };
      return;
    }
  }

  // Final check
  yield { line: 14, comparing: [prev] };
  if (array[prev] === target) {
    yield { line: 14, found: prev };
  } else {
    yield { line: 15 };
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
    // Probing the position
    let pos = low + Math.floor(
      ((target - arr[low]) * (high - low)) / 
      (arr[high] - arr[low])
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

  yield { line: 2 }; // Init low/high

  while (
    low <= high &&
    target >= array[low] &&
    target <= array[high]
  ) {
    yield { line: 3, range: [low, high] };

    // Check if range is a single element
    if (low === array.length - 1 || low === high) { // Safety check for division by zero
        yield { line: 4 };
        if (array[low] === target) {
            yield { line: 5, found: low };
            return;
        }
        yield { line: 6 };
        return;
    }

    // Calculate position
    const numerator = (target - array[low]) * (high - low);
    const denominator = array[high] - array[low];
    const pos = low + Math.floor(numerator / denominator);

    yield { line: 9, comparing: [pos] }; // Highlight calculated pos

    if (array[pos] === target) {
      yield { line: 13, found: pos };
      return;
    }

    if (array[pos] < target) {
      yield { line: 14 };
      low = pos + 1;
    } else {
      yield { line: 15 };
      high = pos - 1;
    }
  }

  yield { line: 17 };
}

// --- EXPONENTIAL SEARCH ---
export const exponentialSearchTraceCode = `function exponentialSearch(arr, target) {
  if (arr[0] === target) return 0;
  let i = 1;
  while (i < arr.length && arr[i] <= target) {
    i = i * 2;
  }
  
  // Binary Search in range [i/2, min(i, n-1)]
  let low = i / 2;
  let high = Math.min(i, arr.length - 1);
  
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

  // 1. Check first element
  yield { line: 2, comparing: [0] };
  if (array[0] === target) {
    yield { line: 2, found: 0 };
    return;
  }

  // 2. Exponential Range Finding
  let i = 1;
  yield { line: 3 };
  
  while (i < n && array[i] <= target) {
    yield { line: 4, comparing: [i] }; // checking boundary
    // If we found it exactly at the boundary during doubling
    if (array[i] === target) {
         // Optimization: usually exponential search continues to binary search, 
         // but if we hit it exactly, we can return or let the binary search find it.
         // Standard algo continues doubling past it or stops. 
         // Here we follow the logic: arr[i] <= target. 
    }
    i = i * 2;
    yield { line: 5 }; // i doubles
  }

  // 3. Setup Binary Search
  let low = i / 2;
  let high = Math.min(i, n - 1);
  yield { line: 9, range: [low, high] };

  // 4. Run Binary Search Logic
  while (low <= high) {
    yield { line: 12, range: [low, high] };
    
    const mid = Math.floor((low + high) / 2);
    yield { line: 13, comparing: [mid] };

    if (array[mid] === target) {
      yield { line: 14, found: mid };
      return;
    }

    if (array[mid] < target) {
      yield { line: 15 };
      low = mid + 1;
    } else {
      yield { line: 16 };
      high = mid - 1;
    }
  }

  yield { line: 18 };
}