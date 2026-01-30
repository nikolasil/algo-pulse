/**
 * Quick Sort Algorithm Generator
 * Uses yield* to handle recursion within the generator
 */
export async function* quickSort(
  array: number[],
  start: number = 0,
  end: number = array.length - 1,
): AsyncGenerator<any> {
  if (start >= end) return;

  // Partition logic
  let pivotValue = array[end];
  let pivotIndex = start;

  for (let i = start; i < end; i++) {
    // Highlight the current elements being compared
    yield { comparing: [i, end] };

    if (array[i] < pivotValue) {
      // Swap elements
      [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
      yield { array: [...array], comparing: [i, pivotIndex] };
      pivotIndex++;
    }
  }

  // Move pivot to its final place
  [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];
  yield { array: [...array], comparing: [pivotIndex, end] };

  // Recursively sort the left and right partitions
  // yield* is required to "flatten" the generator steps from recursive calls
  yield* quickSort(array, start, pivotIndex - 1);
  yield* quickSort(array, pivotIndex + 1, end);
}
