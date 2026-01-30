/**
 * Bubble Sort Algorithm Generator
 * Yields the current state of the array and the indices being compared
 */
export async function* bubbleSort(array: number[]) {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Yield the current indices being compared for visualization (red bars)
      yield { comparing: [j, j + 1] };

      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        // Yield the new array state to update the UI
        yield { array: [...arr], comparing: [j, j + 1] };
      }
    }
  }
}
