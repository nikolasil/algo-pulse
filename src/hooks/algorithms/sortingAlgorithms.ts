import { Complexity } from './general';

export const sortingAlgorithms: SortingAlgorithmType[] = [
  'Bubble',
  'Quick',
  'Merge',
  'Selection',
  'Insertion',
  'Heap',
  'Shell',
  'Cocktail',
  'Gnome',
  'Comb',
  'Counting',
];

export type SortingAlgorithmType =
  | 'Bubble'
  | 'Quick'
  | 'Merge'
  | 'Selection'
  | 'Insertion'
  | 'Heap'
  | 'Shell'
  | 'Cocktail'
  | 'Gnome'
  | 'Comb'
  | 'Counting';

export const sortingComplexities: Record<SortingAlgorithmType, Complexity> = {
  Bubble: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  Quick: {
    best: 'O(nlogn)',
    average: 'O(nlogn)',
    worst: 'O(n²)',
    space: 'O(logn)',
  },
  Merge: {
    best: 'O(nlogn)',
    average: 'O(nlogn)',
    worst: 'O(nlogn)',
    space: 'O(n)',
  },
  Selection: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  Insertion: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  Heap: {
    best: 'O(nlogn)',
    average: 'O(nlogn)',
    worst: 'O(nlogn)',
    space: 'O(1)',
  },
  Shell: {
    best: 'O(nlogn)',
    average: 'O(n¹·⁵)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
  Cocktail: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  Gnome: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  Comb: { best: 'O(nlogn)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  Counting: {
    best: 'O(n+k)',
    average: 'O(n+k)',
    worst: 'O(n+k)',
    space: 'O(k)',
  },
};

export interface SortInput {
  array: number[];
}

export interface SortStep {
  line?: number;
  comparing?: number[];
  array?: number[];
  pivot?: number;
  range?: [number, number];
  variables: Record<string, number | string | boolean>;
}

// --- BUBBLE SORT ---
export const bubbleSortTraceCode = `function bubbleSort(arr) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
      }
    }
  }
}`;

export async function* bubbleSort(input: SortInput): AsyncGenerator<SortStep> {
  const array = input.array;
  const n = array.length;
  for (let i = 0; i < n; i++) {
    yield { line: 2, variables: { i, n } };
    for (let j = 0; j < n - i - 1; j++) {
      yield { line: 3, comparing: [j, j + 1], variables: { i, j, n } };
      if (array[j] > array[j + 1]) {
        yield { line: 4, comparing: [j, j + 1], variables: { i, j, n } };
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield {
          line: 5,
          array: [...array],
          comparing: [j, j + 1],
          variables: { i, j, n },
        };
      }
    }
  }
}

// --- QUICK SORT ---
export const quickSortTraceCode = `function quickSort(arr, start, end) {
  if (start >= end) return;
  let pivotValue = arr[end];
  let pivotIndex = start;
  for (let i = start; i < end; i++) {
    if (arr[i] < pivotValue) {
      swap(arr, i, pivotIndex);
      pivotIndex++;
    }
  }
  swap(arr, pivotIndex, end);
  quickSort(arr, start, pivotIndex - 1);
  quickSort(arr, pivotIndex + 1, end);
}`;

export async function* quickSort(
  input: SortInput,
  start: number = 0,
  end: number = input.array.length - 1,
): AsyncGenerator<SortStep> {
  const array = input.array;
  yield { line: 2, range: [start, end], variables: { start, end } };
  if (start >= end) return;

  yield { line: 3, variables: { start, end } };
  const pivotValue = array[end];
  let pivotIndex = start;

  for (let i = start; i < end; i++) {
    yield {
      line: 6,
      comparing: [i, end],
      pivot: end,
      variables: { start, end, pivotIndex, pivotValue, i },
    };
    if (array[i] < pivotValue) {
      [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
      yield {
        line: 7,
        array: [...array],
        comparing: [i, pivotIndex],
        variables: { start, end, pivotIndex, pivotValue, i },
      };
      pivotIndex++;
    }
  }

  [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];
  yield {
    line: 11,
    array: [...array],
    pivot: pivotIndex,
    variables: { start, end, pivotIndex, pivotValue },
  };

  yield {
    line: 12,
    variables: { start, end, pivotIndex, newEnd: pivotIndex - 1 },
  };
  yield* quickSort(input, start, pivotIndex - 1);

  yield {
    line: 13,
    variables: { start, end, pivotIndex, newStart: pivotIndex + 1 },
  };
  yield* quickSort(input, pivotIndex + 1, end);
}

// --- MERGE SORT ---
export const mergeSortTraceCode = `function mergeSort(arr, start, end) {
  if (start >= end) return;
  const mid = Math.floor((start + end) / 2);
  mergeSort(arr, start, mid);
  mergeSort(arr, mid + 1, end);
  merge(arr, start, mid, end);
}

function merge(arr, start, mid, end) {
  const left = arr.slice(start, mid + 1);
  const right = arr.slice(mid + 1, end + 1);
  let i = 0, j = 0, k = start;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) arr[k++] = left[i++];
    else arr[k++] = right[j++];
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}`;

export async function* mergeSort(
  input: SortInput,
  start: number = 0,
  end: number = input.array.length - 1,
): AsyncGenerator<SortStep> {
  const array = input.array;
  yield { line: 2, range: [start, end], variables: { start, end } };
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);
  yield { line: 3, variables: { start, end, mid } };

  yield { line: 4, variables: { start, end, mid } };
  yield* mergeSort(input, start, mid);

  yield { line: 5, variables: { start, end, mid } };
  yield* mergeSort(input, mid + 1, end);

  yield { line: 6, variables: { start, end, mid } };
  yield* merge(array, start, mid, end);
}

async function* merge(
  arr: number[],
  start: number,
  mid: number,
  end: number,
): AsyncGenerator<SortStep> {
  const left = arr.slice(start, mid + 1);
  const right = arr.slice(mid + 1, end + 1);
  let i = 0,
    j = 0,
    k = start;

  while (i < left.length && j < right.length) {
    yield {
      line: 13,
      comparing: [start + i, mid + 1 + j],
      variables: { i, j, k, leftVal: left[i], rightVal: right[j] },
    };
    if (left[i] <= right[j]) {
      arr[k] = left[i++];
      yield {
        line: 14,
        array: [...arr],
        variables: { i, j, k, leftVal: left[i - 1] },
      };
    } else {
      arr[k] = right[j++];
      yield {
        line: 15,
        array: [...arr],
        variables: { i, j, k, rightVal: right[j - 1] },
      };
    }
    k++;
  }

  while (i < left.length) {
    arr[k] = left[i++];
    yield {
      line: 17,
      array: [...arr],
      comparing: [k],
      variables: { i, j, k },
    };
    k++;
  }

  while (j < right.length) {
    arr[k] = right[j++];
    yield {
      line: 18,
      array: [...arr],
      comparing: [k],
      variables: { i, j, k },
    };
    k++;
  }
}

// --- SELECTION SORT ---
export const selectionSortTraceCode = `function selectionSort(arr) {
  for (let i = 0; i < n; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[min]) {
        min = j;
      }
    }
    if (min !== i) swap(arr, i, min);
  }
}`;

export async function* selectionSort(
  input: SortInput,
): AsyncGenerator<SortStep> {
  const array = input.array;
  const n = array.length;
  for (let i = 0; i < n; i++) {
    yield { line: 2, pivot: i, variables: { i, n } };
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      yield {
        line: 4,
        comparing: [j, minIdx],
        pivot: i,
        variables: { i, j, minIdx },
      };

      if (array[j] < array[minIdx]) {
        yield {
          line: 5,
          comparing: [j, minIdx],
          pivot: i,
          variables: { i, j, minIdx },
        };
        minIdx = j;
        yield {
          line: 6,
          comparing: [j],
          pivot: i,
          variables: { i, j, minIdx },
        };
      }
    }

    if (minIdx !== i) {
      yield { line: 9, comparing: [i, minIdx], variables: { i, minIdx } };
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield {
        line: 9,
        array: [...array],
        comparing: [i, minIdx],
        variables: { i, minIdx },
      };
    }
  }
}

// --- INSERTION SORT ---
export const insertionSortTraceCode = `function insertionSort(arr) {
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}`;

export async function* insertionSort(
  input: SortInput,
): AsyncGenerator<SortStep> {
  const array = input.array;
  const n = array.length;
  for (let i = 1; i < n; i++) {
    yield { line: 2, pivot: i, variables: { i, n } };
    const key = array[i];
    let j = i - 1;
    yield {
      line: 3,
      comparing: [i],
      pivot: i,
      variables: { i, j, key },
    };

    while (j >= 0) {
      yield {
        line: 5,
        comparing: [j],
        pivot: i,
        variables: { i, j, key },
      };
      if (array[j] > key) {
        array[j + 1] = array[j];
        yield {
          line: 6,
          array: [...array],
          comparing: [j, j + 1],
          variables: { i, j, key },
        };
        j--;
      } else {
        break;
      }
    }
    array[j + 1] = key;
    yield {
      line: 9,
      array: [...array],
      pivot: j + 1,
      variables: { i, j: j + 1, key },
    };
  }
}

// --- HEAP SORT ---
export const heapSortTraceCode = `function heapSort(arr) {
  const n = arr.length;
  for (let i = n / 2 - 1; i >= 0; i--) 
    heapify(arr, n, i);
  
  for (let i = n - 1; i > 0; i--) {
    swap(arr, 0, i);
    heapify(arr, i, 0);
  }
}

function heapify(arr, n, i) {
  let largest = i;
  let left = 2 * i + 1, right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    swap(arr, i, largest);
    heapify(arr, n, largest);
  }
}`;

export async function* heapSort(input: SortInput): AsyncGenerator<SortStep> {
  const array = input.array;
  const n = array.length;

  yield { line: 3, variables: { n } };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(array, n, i);
  }

  yield { line: 6, variables: { n } };
  for (let i = n - 1; i > 0; i--) {
    yield { line: 7, comparing: [0, i], variables: { i, n } };
    [array[0], array[i]] = [array[i], array[0]];
    yield {
      line: 7,
      array: [...array],
      comparing: [0, i],
      variables: { i, n },
    };

    yield { line: 8, variables: { i, n } };
    yield* heapify(array, i, 0);
  }
}

async function* heapify(
  arr: number[],
  n: number,
  i: number,
): AsyncGenerator<SortStep> {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  yield {
    line: 12,
    variables: { i, n, largest, left, right },
  };

  if (left < n) {
    yield {
      line: 14,
      comparing: [left, largest],
      variables: { i, n, largest, left },
    };
    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  if (right < n) {
    yield {
      line: 15,
      comparing: [right, largest],
      variables: { i, n, largest, right },
    };
    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  if (largest !== i) {
    yield { line: 16, variables: { i, n, largest } };
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    yield {
      line: 17,
      array: [...arr],
      comparing: [i, largest],
      variables: { i, n, largest },
    };

    yield { line: 18, variables: { i, n, largest } };
    yield* heapify(arr, n, largest);
  }
}

// --- SHELL SORT ---
export const shellSortTraceCode = `function shellSort(arr) {
  for (let gap = n/2; gap > 0; gap /= 2) {
    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j;
      for (j = i; j >= gap && arr[j-gap] > temp; j -= gap)
        arr[j] = arr[j-gap];
      arr[j] = temp;
    }
  }
}`;

export async function* shellSort(input: SortInput): AsyncGenerator<SortStep> {
  const array = input.array;
  const n = array.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    yield { line: 2, pivot: gap, variables: { gap, n } };
    for (let i = gap; i < n; i++) {
      const temp = array[i];
      let j = i;
      yield {
        line: 4,
        comparing: [i],
        pivot: gap,
        variables: { gap, i, temp },
      };

      while (j >= gap) {
        yield {
          line: 6,
          comparing: [j - gap, j],
          variables: { gap, i, j, temp },
        };
        if (array[j - gap] > temp) {
          array[j] = array[j - gap];
          yield {
            line: 7,
            array: [...array],
            comparing: [j, j - gap],
            variables: { gap, i, j, temp },
          };
          j -= gap;
        } else {
          break;
        }
      }
      array[j] = temp;
      yield {
        line: 8,
        array: [...array],
        variables: { gap, i, j, temp },
      };
    }
  }
}

// --- COCKTAIL SHAKER SORT ---
export const cocktailSortTraceCode = `function cocktailSort(arr) {
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      if (arr[i] > arr[i+1]) { 
        swap(i, i+1); swapped = true; 
      }
    }
    if (!swapped) break;
    swapped = false;
    for (let i = n - 2; i >= 0; i--) {
      if (arr[i] > arr[i+1]) { 
        swap(i, i+1); swapped = true; 
      }
    }
  }
}`;

export async function* cocktailSort(
  input: SortInput,
): AsyncGenerator<SortStep> {
  const array = input.array;
  let swapped = true;
  let start = 0;
  let end = array.length - 1;

  while (swapped) {
    yield { line: 3, variables: { swapped, start, end } };
    swapped = false;
    for (let i = start; i < end; i++) {
      yield {
        line: 6,
        comparing: [i, i + 1],
        variables: { swapped, start, end, i },
      };
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
        yield {
          line: 7,
          array: [...array],
          comparing: [i, i + 1],
          variables: { swapped, start, end, i },
        };
      }
    }
    if (!swapped) {
      yield { line: 9, variables: { swapped } };
      break;
    }
    swapped = false;
    end--;
    for (let i = end - 1; i >= start; i--) {
      yield {
        line: 12,
        comparing: [i, i + 1],
        variables: { swapped, start, end, i },
      };
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
        yield {
          line: 13,
          array: [...array],
          comparing: [i, i + 1],
          variables: { swapped, start, end, i },
        };
      }
    }
    start++;
  }
}

// --- GNOME SORT ---
export const gnomeSortTraceCode = `function gnomeSort(arr) {
  let index = 0;
  while (index < n) {
    if (index == 0 || arr[index] >= arr[index-1]) {
        index++;
    } else { 
        swap(index, index-1); 
        index--; 
    }
  }
}`;

export async function* gnomeSort(input: SortInput): AsyncGenerator<SortStep> {
  const array = input.array;
  let index = 0;
  const n = array.length;
  while (index < n) {
    yield { line: 3, variables: { index, n } };
    if (index === 0) {
      index++;
    } else {
      yield {
        line: 4,
        comparing: [index, index - 1],
        variables: { index, n },
      };
      if (array[index] >= array[index - 1]) {
        index++;
      } else {
        [array[index], array[index - 1]] = [array[index - 1], array[index]];
        yield {
          line: 7,
          array: [...array],
          comparing: [index, index - 1],
          variables: { index, n },
        };
        index--;
      }
    }
  }
}

// --- COMB SORT ---
export const combSortTraceCode = `function combSort(arr) {
  let gap = arr.length;
  let shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) { gap = 1; sorted = true; }
    
    for (let i = 0; i + gap < arr.length; i++) {
      if (arr[i] > arr[i + gap]) {
        swap(arr, i, i + gap);
        sorted = false;
      }
    }
  }
}`;

export async function* combSort(input: SortInput): AsyncGenerator<SortStep> {
  const array = input.array;
  let gap = array.length;
  const shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    yield { line: 6, variables: { gap, sorted } };
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }
    for (let i = 0; i + gap < array.length; i++) {
      yield {
        line: 10,
        comparing: [i, i + gap],
        pivot: gap,
        variables: { gap, sorted, i },
      };
      if (array[i] > array[i + gap]) {
        [array[i], array[i + gap]] = [array[i + gap], array[i]];
        sorted = false;
        yield {
          line: 11,
          array: [...array],
          comparing: [i, i + gap],
          variables: { gap, sorted, i },
        };
      }
    }
  }
}

// --- COUNTING SORT ---
export const countingSortTraceCode = `function countingSort(arr) {
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const count = new Array(max - min + 1).fill(0);

  for (let val of arr) {
    count[val - min]++;
  }

  let z = 0;
  for (let i = min; i <= max; i++) {
    while (count[i - min] > 0) {
      arr[z++] = i;
      count[i - min]--;
    }
  }
}`;

export async function* countingSort(
  input: SortInput,
): AsyncGenerator<SortStep> {
  const array = input.array;
  const max = Math.max(...array);
  const min = Math.min(...array);
  const count = new Array(max - min + 1).fill(0);

  yield { line: 2, variables: { max, min } };

  for (let i = 0; i < array.length; i++) {
    yield {
      line: 6,
      comparing: [i],
      variables: { i, val: array[i], min },
    };
    count[array[i] - min]++;
    yield {
      line: 7,
      variables: { i, val: array[i], count: count[array[i] - min] },
    };
  }

  let z = 0;
  for (let i = min; i <= max; i++) {
    yield { line: 11, variables: { i, z, min, max } };
    while (count[i - min] > 0) {
      yield { line: 12, variables: { i, z, count: count[i - min] } };
      array[z++] = i;
      count[i - min]--;
      yield {
        line: 13,
        array: [...array],
        comparing: [z - 1],
        variables: { i, z, count: count[i - min] },
      };
    }
  }
}
