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
      name: 'Linear Search',
      category: 'Searching',
      complexity: 'O(n)',
      description: 'Scans each element one by one until the target value is found.',
      pseudocode: `
for i in 0..n-1:
  if a[i] == x:
    return i
      `,
      code: `
function linearSearch(input, steps) {
  const arr = [...input];
  const target = arr[Math.floor(Math.random() * arr.length)];
  for (let i = 0; i < arr.length; i++) {
    steps.push({ index: i, array: [...arr], target });
    if (arr[i] === target) break;
  }
  return target;
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
      name: 'Selection Sort',
      category: 'Sorting',
      complexity: 'O(n^2)',
      description:
        'Finds the smallest element in each pass and places it at the beginning.',
      pseudocode: `
for i in 0..n-1:
  min = i
  for j in i+1..n:
    if a[j] < a[min]:
      min = j
  swap(a[i], a[min])
      `,
      code: `
function selectionSort(input, steps) {
  const arr = [...input];
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j;
      steps.push([...arr]);
    }
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      steps.push([...arr]);
    }
  }
  return arr;
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
  const target = nodes[nodes.length - 1];
  let found = false;

  function dfs(node) {
    if (found) return;
    visited.add(node);
    order.push(node);
    steps.push([...order]);
    if (node === target) {
      found = true;
      return;
    }
    for (const neighbor of input[node] || []) {
      if (!visited.has(neighbor)) dfs(neighbor);
      if (found) return;
    }
  }

  if (start) dfs(start);
  return order;
}
      `,
    },

    {
  name: 'Breadth-First Search (BFS)',
  category: 'Graph',
  complexity: 'O(V + E)',
  description:
    'Explores graph nodes level by level using a queue.',
  pseudocode: `
procedure BFS(G, s):
  create empty queue Q
  mark s as visited
  enqueue s onto Q
  while Q is not empty:
    v = dequeue Q
    for each neighbor w of v:
      if w not visited:
        mark w as visited
        enqueue w onto Q
    `,
  code: `
function breadthFirstSearch(input, steps) {
  const visited = new Set();
  const order = [];
  const queue = [];
  const nodes = Object.keys(input);
  const start = nodes[0];
  const target = nodes[nodes.length - 1];

  if (!start) return [];

  visited.add(start);
  queue.push(start);
  order.push(start);
  steps.push([...order]);

  while (queue.length) {
    const node = queue.shift();

    if (node === target) break;

    for (const neighbor of input[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        order.push(neighbor);
        steps.push([...order]);
      }
    }
  }

  return order;
}
    `,
},


   
    {
      name: 'Binary Tree In-order Traversal',
      category: 'Tree',
      complexity: 'O(n)',
      description:
        'Traverses a binary tree in left–root–right order and records the visit steps.',
      pseudocode: `
inorder(node):
  if node is null: return
  inorder(node.left)
  visit(node.value)
  inorder(node.right)
      `,
      code: `

class TreeNode {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}


function buildTreeFromArray(values) {
  if (!values || values.length === 0) return null;
  const nodes = values.map(v => new TreeNode(v));

  for (let i = 0; i < nodes.length; i++) {
    const leftIndex = 2 * i + 1;
    const rightIndex = 2 * i + 2;
    if (leftIndex < nodes.length) nodes[i].left = nodes[leftIndex];
    if (rightIndex < nodes.length) nodes[i].right = nodes[rightIndex];
  }
  return nodes[0];
}


function inorderTraversal(root, steps, parent = null) {
  if (!root) {
    steps.push({ type: "backtrack", from: parent ? parent.value : null });
    return;
  }

 
  steps.push({
    type: "visit",
    node: root.value,
    parent: parent ? parent.value : null
  });

  inorderTraversal(root.left, steps, root);

  
  steps.push({
    type: "output",
    node: root.value,
    parent: parent ? parent.value : null
  });

  
  inorderTraversal(root.right, steps, root);
}


function binaryTreeInorder(input, steps) {
 
  const root = buildTreeFromArray(input);
  inorderTraversal(root, steps, null);
  return true;
}
      `,
    },
        
    {
      name: 'Factorial Sequence',
      category: 'Dynamic',
      complexity: 'O(n)',
      description:
        'Computes the running factorial values 1!, 2!, 3!, ..., n! as a sequence.',
      pseudocode: `
factorialSequence(n):
  result = []
  curr = 1
  for i from 1 to n:
    curr = curr * i
    append curr to result
  return result
      `,
      code: `
function factorialSequence(n, steps) {
  const result = [];
  let curr = 1;
  for (let i = 1; i <= n; i++) {
    curr *= i;
    result.push(curr);
    steps.push([...result]); // record prefix at each step
  }
  return result;
}
      `,
    },

   
    {
      name: 'Maximum Subarray (Kadane)',
      category: 'Dynamic',
      complexity: 'O(n)',
      description:
        'Finds the contiguous subarray with the maximum sum using Kadane’s algorithm.',
      pseudocode: `
kadane(arr):
  maxSoFar = -inf
  maxEndingHere = 0
  for x in arr:
    maxEndingHere = max(x, maxEndingHere + x)
    maxSoFar = max(maxSoFar, maxEndingHere)
  return maxSoFar
      `,
      code: `
function maxSubarrayKadane(input, steps) {
  const arr = [...input];
  const dp = []; // max subarray sum ending at each index
  let maxSoFar = -Infinity;
  let maxEndingHere = 0;

  for (let i = 0; i < arr.length; i++) {
    maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
    dp[i] = maxEndingHere;
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
    steps.push([...dp]); // record DP array as it fills
  }
  return { maxSoFar, dp };
}
      `,
    },


    {
      name: 'Ugly Numbers Sequence',
      category: 'Dynamic',
      complexity: 'O(n)',
      description:
        'Generates the sequence of ugly numbers (whose prime factors are only 2, 3, or 5).',
      pseudocode: `
uglyNumbers(n):
  ugly[0] = 1
  i2 = i3 = i5 = 0
  next2 = 2; next3 = 3; next5 = 5
  for i from 1 to n-1:
    ugly[i] = min(next2, next3, next5)
    if ugly[i] == next2: i2++; next2 = ugly[i2] * 2
    if ugly[i] == next3: i3++; next3 = ugly[i3] * 3
    if ugly[i] == next5: i5++; next5 = ugly[i5] * 5
  return ugly
      `,
      code: `
function uglyNumbersSequence(n, steps) {
  const ugly = [1];
  let i2 = 0, i3 = 0, i5 = 0;
  let next2 = 2, next3 = 3, next5 = 5;

  steps.push([...ugly]);
  for (let i = 1; i < n; i++) {
    const next = Math.min(next2, next3, next5);
    ugly.push(next);
    steps.push([...ugly]); // record prefix

    if (next === next2) {
      i2++;
      next2 = ugly[i2] * 2;
    }
    if (next === next3) {
      i3++;
      next3 = ugly[i3] * 3;
    }
    if (next === next5) {
      i5++;
      next5 = ugly[i5] * 5;
    }
  }
  return ugly;
}
      `,
    },

  ];

  await repo.save(defaults);
  console.log('🌱 Seeded algorithms successfully!');
}
