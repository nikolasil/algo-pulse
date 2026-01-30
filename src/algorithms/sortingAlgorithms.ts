// --- BUBBLE SORT ---
export const bubbleSortCode = `for (let i = 0; i < n; i++) {
  for (let j = 0; j < n - i - 1; j++) {
    if (array[j] > array[j + 1]) {
      // Swap elements
      [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
    }
  }
}`;

export async function* bubbleSort(array: number[]): AsyncGenerator<any> {
  const n = array.length;
  for (let i = 0; i < n; i++) {
    yield { line: 1 };
    for (let j = 0; j < n - i - 1; j++) {
      yield { line: 2, comparing: [j, j + 1] };
      if (array[j] > array[j + 1]) {
        yield { line: 3 };
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield { line: 4, array: [...array] };
      }
    }
  }
}

// --- QUICK SORT ---
export const quickSortCode = `function quickSort(arr, start, end) {
  if (start >= end) return;
  let index = partition(arr, start, end);
  quickSort(arr, start, index - 1);
  quickSort(arr, index + 1, end);
}`;

export async function* quickSort(
  array: number[],
  start: number = 0,
  end: number = array.length - 1,
): AsyncGenerator<any> {
  yield { line: 1 };
  if (start >= end) return;

  yield { line: 2 };
  let pivotValue = array[end];
  let pivotIndex = start;

  for (let i = start; i < end; i++) {
    yield { comparing: [i, end] };
    if (array[i] < pivotValue) {
      [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
      yield { array: [...array], comparing: [i, pivotIndex] };
      pivotIndex++;
    }
  }
  [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];
  yield { array: [...array] };

  yield { line: 3 };
  yield* quickSort(array, start, pivotIndex - 1);
  yield { line: 4 };
  yield* quickSort(array, pivotIndex + 1, end);
}

// --- MERGE SORT ---
export const mergeSortCode = `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`;

export async function* mergeSort(
  array: number[],
  start: number = 0,
  end: number = array.length - 1,
): AsyncGenerator<any> {
  if (start >= end) {
    yield { line: 1 };
    return;
  }
  const mid = Math.floor((start + end) / 2);
  yield { line: 2 };
  yield { line: 3 };
  yield* mergeSort(array, start, mid);
  yield { line: 4 };
  yield* mergeSort(array, mid + 1, end);
  yield { line: 5 };
  yield* merge(array, start, mid, end);
}

async function* merge(arr: number[], start: number, mid: number, end: number) {
  let left = arr.slice(start, mid + 1);
  let right = arr.slice(mid + 1, end + 1);
  let i = 0,
    j = 0,
    k = start;
  while (i < left.length && j < right.length) {
    yield { comparing: [start + i, mid + 1 + j] };
    if (left[i] <= right[j]) {
      arr[k] = left[i++];
    } else {
      arr[k] = right[j++];
    }
    yield { array: [...arr] };
    k++;
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
  yield { array: [...arr] };
}
