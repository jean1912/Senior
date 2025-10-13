import { DataSource } from 'typeorm';
import { Algorithm } from './algorithm.entity';

export async function seedAlgorithms(dataSource: DataSource) {
  const repo = dataSource.getRepository(Algorithm);

  const count = await repo.count();
  if (count > 0) {
    console.log('✅ Algorithms already exist — skipping seed.');
    return;
  }

  const defaults: Partial<Algorithm>[] = [
    {
      name: 'Bubble Sort',
      category: 'Sorting',
      complexity: 'O(n^2)',
      description:
        'Simple comparison-based sorting algorithm that repeatedly swaps adjacent elements if they are in the wrong order.',
      pseudocode:
        'for i in 0..n-1:\n  for j in 0..n-i-2:\n    if a[j] > a[j+1]: swap(a[j], a[j+1])',
      code: `
function bubbleSort(arr) {
  let steps = [];
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push([...arr]);
      }
    }
  }
  return steps;
}
      `,
    },
    {
      name: 'Binary Search',
      category: 'Searching',
      complexity: 'O(log n)',
      description:
        'Searches a sorted array by repeatedly dividing the search interval in half.',
      pseudocode:
        'while low <= high:\n  mid = (low + high) // 2\n  if a[mid] == x: return mid\n  elif a[mid] < x: low = mid + 1\n  else: high = mid - 1',
      code: `
function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  let steps = [];
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({low, high, mid});
    if (arr[mid] === target) return { index: mid, steps };
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return { index: -1, steps };
}
      `,
    },
    {
      name: 'Depth-First Search (DFS)',
      category: 'Graph',
      complexity: 'O(V + E)',
      description:
        'DFS explores a graph by going as deep as possible before backtracking.',
      pseudocode:
        'procedure DFS(G, v):\n  label v as discovered\n  for all edges (v, w) in G.adjacentEdges(v) do\n    if w is not labeled as discovered then\n      recursively call DFS(G, w)',
    },
  ];

  await repo.save(defaults);
  console.log('🌱 Seeded default algorithms successfully.');
}
