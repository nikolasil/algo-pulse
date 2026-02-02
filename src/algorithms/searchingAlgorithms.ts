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
  yield { line: 2 };

  while (low <= high) {
    yield { line: 3, range: [low, high] };
    let mid = Math.floor((low + high) / 2);
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
