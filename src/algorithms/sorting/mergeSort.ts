/**
 * Merge Sort Algorithm Generator
 */
export async function* mergeSort(
  array: number[],
  start: number = 0,
  end: number = array.length - 1,
): AsyncGenerator<any> {
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);

  // Divide
  yield* mergeSort(array, start, mid);
  yield* mergeSort(array, mid + 1, end);

  // Conquer (Merge)
  yield* merge(array, start, mid, end);
}

async function* merge(
  arr: number[],
  start: number,
  mid: number,
  end: number,
): AsyncGenerator<any> {
  let left = arr.slice(start, mid + 1);
  let right = arr.slice(mid + 1, end + 1);

  let i = 0,
    j = 0,
    k = start;

  while (i < left.length && j < right.length) {
    yield { comparing: [start + i, mid + 1 + j] };

    if (left[i] <= right[j]) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }
    yield { array: [...arr] };
    k++;
  }

  while (i < left.length) {
    arr[k] = left[i];
    yield { array: [...arr], comparing: [k] };
    i++;
    k++;
  }

  while (j < right.length) {
    arr[k] = right[j];
    yield { array: [...arr], comparing: [k] };
    j++;
    k++;
  }
}
