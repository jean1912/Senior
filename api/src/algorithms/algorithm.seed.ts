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
        'Repeatedly swaps adjacent elements if they are in the wrong order.',
      pseudocode: `
for i in 0..n-1:
  for j in 0..n-i-2:
    if a[j] > a[j+1]:
      swap(a[j], a[j+1])
      `,
      code: `
function bubbleSort(input, steps) {
  let arr = [...input];
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push([...arr]);
      }
    }
  }
  return arr;
}
      `,
    },
    {
      name: 'Merge Sort',
      category: 'Sorting',
      complexity: 'O(n log n)',
      description:
        'Divides array into halves, recursively sorts, and merges them.',
      pseudocode: `
mergeSort(arr):
  if len(arr) <= 1: return arr
  mid = len(arr)/2
  left = mergeSort(arr[:mid])
  right = mergeSort(arr[mid:])
  return merge(left, right)
      `,
      code: `
function mergeSort(input, steps) {
  function merge(left, right) {
    const result = [];
    while (left.length && right.length) {
      if (left[0] < right[0]) result.push(left.shift());
      else result.push(right.shift());
      steps.push([...result, ...left, ...right]);
    }
    return [...result, ...left, ...right];
  }

  function sort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));
    const right = sort(arr.slice(mid));
    return merge(left, right);
  }

  const arr = [...input];
  const res = sort(arr);
  steps.push([...res]);
  return res;
}
      `,
    },
    {
      name: 'Binary Search',
      category: 'Searching',
      complexity: 'O(log n)',
      description:
        'Searches a sorted array by repeatedly dividing the search interval in half.',
      pseudocode: `
while low <= high:
  mid = (low + high) // 2
  if a[mid] == x: return mid
  elif a[mid] < x: low = mid + 1
  else: high = mid - 1
      `,
      code: `
function binarySearch(input, steps) {
  const arr = [...input].sort((a,b)=>a-b);
  const target = arr[Math.floor(Math.random()*arr.length)];
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({low, high, mid, array:[...arr], target});
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
      `,
    },
    {
      name: 'Depth-First Search (DFS)',
      category: 'Graph',
      complexity: 'O(V + E)',
      description:
        'Explores graph nodes by going as deep as possible before backtracking.',
      pseudocode: `
procedure DFS(G, v):
  mark v as visited
  for each neighbor w of v:
    if w not visited:
      DFS(G, w)
      `,
      code: `
function depthFirstSearch(input, steps) {
  const visited = new Set();
  const order = [];
  const nodes = Object.keys(input);
  const start = nodes[0];

  function dfs(node) {
    visited.add(node);
    order.push(node);
    steps.push([...order]);
    for (const neighbor of input[node] || []) {
      if (!visited.has(neighbor)) dfs(neighbor);
    }
  }

  if (start) dfs(start);
  return order;
}
      `,
    },
  ];

  await repo.save(defaults);
  console.log('🌱 Seeded algorithms successfully!');
}
