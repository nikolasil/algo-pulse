// --- LINEAR SEARCH ---
export const linearSearchCode = `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`;

export async function* linearSearch(
  array: number[],
  target: number,
): AsyncGenerator<any> {
  for (let i = 0; i < array.length; i++) {
    yield { line: 1, comparing: [i] };
    if (array[i] === target) {
      yield { line: 2, found: i };
      return;
    }
  }
}

// --- BINARY SEARCH ---
export const binarySearchCode = `function binarySearch(arr, target) {
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
  array: number[],
  target: number,
): AsyncGenerator<any> {
  let low = 0,
    high = array.length - 1;
  yield { line: 1 };
  while (low <= high) {
    yield { line: 2, range: [low, high] };
    let mid = Math.floor((low + high) / 2);
    yield { line: 3, comparing: [mid] };
    if (array[mid] === target) {
      yield { line: 4, found: mid };
      return;
    }
    if (array[mid] < target) {
      yield { line: 5 };
      low = mid + 1;
    } else {
      yield { line: 6 };
      high = mid - 1;
    }
  }
}

// --- JUMP SEARCH ---
export const jumpSearchCode = `function jumpSearch(arr, target) {
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
  array: number[],
  target: number,
): AsyncGenerator<any> {
  let n = array.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;

  yield { line: 1 };
  yield { line: 2 };

  // Jumping phase
  while (array[Math.min(step, n) - 1] < target) {
    yield { line: 4, comparing: [Math.min(step, n) - 1] };
    prev = step;
    step += Math.floor(Math.sqrt(n));
    yield { line: 5, range: [prev, Math.min(step, n) - 1] };
    if (prev >= n) return;
  }

  // Linear phase within the block
  yield { line: 8 };
  while (array[prev] < target) {
    yield { line: 9, comparing: [prev] };
    prev++;
    if (prev === Math.min(step, n)) return;
  }

  yield { line: 12 };
  if (array[prev] === target) {
    yield { line: 13, found: prev };
  }
}
