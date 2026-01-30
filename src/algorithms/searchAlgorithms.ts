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
    yield { line: 2, comparing: [i] }; // for (let i = 0; i < arr.length; i++)
    if (array[i] === target) {
      yield { line: 3, found: i }; // if (arr[i] === target) return i;
      return;
    }
  }
  yield { line: 5 }; // return -1;
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
  yield { line: 2 }; // let low = 0, high = arr.length - 1;

  while (low <= high) {
    yield { line: 3, range: [low, high] }; // while (low <= high)
    let mid = Math.floor((low + high) / 2);
    yield { line: 4, comparing: [mid] }; // let mid = Math.floor...

    if (array[mid] === target) {
      yield { line: 5, found: mid }; // if (arr[mid] === target) return mid;
      return;
    }

    if (array[mid] < target) {
      yield { line: 6 }; // if (arr[mid] < target) low = mid + 1;
      low = mid + 1;
    } else {
      yield { line: 7 }; // else high = mid - 1;
      high = mid - 1;
    }
  }
  yield { line: 9 }; // return -1;
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

  yield { line: 2 }; // let n = arr.length;
  yield { line: 3 }; // let step = ...
  yield { line: 4 }; // let prev = 0;

  // Jumping phase
  while (array[Math.min(step, n) - 1] < target) {
    yield { line: 5, comparing: [Math.min(step, n) - 1] }; // while loop check
    prev = step;
    yield { line: 6 }; // prev = step;
    step += Math.floor(Math.sqrt(n));
    yield { line: 7 }; // step += ...
    if (prev >= n) {
      yield { line: 8 }; // if (prev >= n) return -1;
      return;
    }
  }

  // Linear phase within the block
  yield { line: 10 }; // while (arr[prev] < target)
  while (array[prev] < target) {
    yield { line: 11, comparing: [prev] }; // prev++;
    prev++;
    if (prev === Math.min(step, n)) {
      yield { line: 12 }; // if (prev == ...) return -1;
      return;
    }
  }

  yield { line: 14 }; // if (arr[prev] == target)
  if (array[prev] === target) {
    yield { line: 14, found: prev }; // return prev;
  } else {
    yield { line: 15 }; // return -1;
  }
}
