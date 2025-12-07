import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlgorithmTemplate } from './algorithm-template.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(AlgorithmTemplate)
    private readonly tplRepo: Repository<AlgorithmTemplate>,
  ) {}

  async onModuleInit() {
    const count = await this.tplRepo.count();
    if (count === 0) {
      console.log('🌱 Seeding default algorithm templates...');

      await this.tplRepo.save([


                          {
                    title: 'Universal Algorithm Template',
                    category: 'Other',
                    description: 'General starter template with API rules and basic structure.',
                    pseudocode: `for each element in input:
                    do comparison
                    emit state snapshot
                    return result`,
                    starterCode: `/** 
                  * ALGORITHM BUILDER RULES
                  *
                  * 1. ALWAYS use api.step({ ... }) to animate steps.
                  * 2. ALWAYS clone arrays: arr: [...arr].
                  * 3. ALWAYS wrap metadata in vars: { ... }.
                  * 4. Use highlight: [i] for bar glow.
                  * 5. Use api.compare(a, b) for comparisons.
                  * 6. Use api.swap(arr, i, j) for visible swaps.
                  * 7. Searching MUST: api.setVar("target", value).
                  * 8. Binary Search MUST include { low, high, mid }.
                  * 9. Graph algorithms MUST use api.visit(node).
                  * 10. Recursive algorithms SHOULD use api.recurse(ctx).
                  *
                  * Delete these notes when ready.
                  */

                  function main(input, api) {
                    const arr = Array.isArray(input) ? [...input] : [input];

                    for (let i = 0; i < arr.length; i++) {
                      // Example compare (replace with your logic)
                      api.compare(arr[i], arr[0], { i });

                      // Emit animation step
                      api.step({
                        arr: [...arr],
                        vars: { i },
                        highlight: [i]
                      });
                    }

                    return arr;
                  }
                  `,
                    visualFlow: {
                      nodes: [{ id: 'start', label: 'Start', type: 'start' }],
                      edges: [],
                    },
                  },

        // ✅ Bubble Sort — fully compatible
        {
          title: 'Bubble Sort Template',
          category: 'Sorting',
          description: 'Classic Bubble Sort demonstration template.',
          pseudocode: `for i in 0..n-1:
  for j in 0..n-i-2:
    if a[j] > a[j+1]:
      swap(a[j], a[j+1])`,
          starterCode: `function main(input, api) {
  let arr = Array.isArray(input) ? [...input] : [input];
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      api.compare(arr[j], arr[j + 1], { i, j });
      if (arr[j] > arr[j + 1]) {
        api.swap(arr, j, j + 1, { i, j });
      }
      api.step({ arr: [...arr], vars: { i, j } });
    }
  }
  return arr;
}`,
          visualFlow: {
            nodes: [{ id: 'start', label: 'Start', type: 'start' }],
            edges: [],
          },
        },

        // ✅ Merge Sort — step snapshots + comparisons
        {
          title: 'Merge Sort Template',
          category: 'Sorting',
          description: 'Divide-and-conquer merge sort demonstration.',
          pseudocode: `mergeSort(arr):
  if len(arr) <= 1: return arr
  mid = len(arr)/2
  left = mergeSort(arr[:mid])
  right = mergeSort(arr[mid:])
  return merge(left, right)`,
          starterCode: `function main(input, api) {
  function merge(left, right) {
    const result = [];
    while (left.length && right.length) {
      api.compare(left[0], right[0]);
      if (left[0] < right[0]) result.push(left.shift());
      else result.push(right.shift());
      api.step({ arr: [...result, ...left, ...right] });
    }
    return [...result, ...left, ...right];
  }

  function sort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));
    const right = sort(arr.slice(mid));
    const merged = merge(left, right);
    api.step({ arr: [...merged] });
    return merged;
  }

  const arr = Array.isArray(input) ? [...input] : [input];
  const res = sort(arr);
  api.setSteps([{ arr: res }]);
  return res;
}`,
          visualFlow: {
            nodes: [{ id: 'root', label: 'Merge Sort Start', type: 'process' }],
            edges: [],
          },
        },

        // ✅ Quick Sort — fully sandbox-safe and recursive
        {
          title: 'Quick Sort Template',
          category: 'Sorting',
          description: 'Divide-and-conquer quicksort algorithm.',
          pseudocode: `procedure quicksort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quicksort(arr, low, pi-1)
    quicksort(arr, pi+1, high)`,
          starterCode: `function main(input, api) {
  let arr = Array.isArray(input) ? [...input] : [input];
  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      api.compare(arr[j], pivot, { i, j, pivot });
      if (arr[j] < pivot) {
        i++;
        api.swap(arr, i, j, { i, j });
      }
      api.step({ arr: [...arr] });
    }
    api.swap(arr, i + 1, high, { pivot });
    api.step({ arr: [...arr] });
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  quickSort(0, arr.length - 1);
  api.step({ arr: [...arr] });
  return arr;
}`,
        },

        // ✅ Depth First Search
        {
  title: 'DFS Template',
  category: 'Graph',
  description: 'Depth-First Search traversal pattern.',
  pseudocode: `procedure DFS(G, v):
  mark v as visited
  for each neighbor w of v:
    if w not visited:
      DFS(G, w)`,

  starterCode: `function main(graph, api) { 
  if (!graph || typeof graph !== "object") {
    graph = {
      A: ["B", "C"],
      B: ["D"],
      C: ["E"],
      D: [],
      E: []
    };
  }

  const nodes = Object.keys(graph);
  const edges = [];

  for (const [u, list] of Object.entries(graph)) {
    for (const v of list) edges.push([u, v]);
  }

  const visited = new Set();
  const visitedOrder = [];
  const treeEdges = [];   

  function emitStep() {
    api.step({
      nodes,
      edges,
      treeEdges: [...treeEdges], 
      visitedOrder: [...visitedOrder],
      startNode: nodes[0],
      targetNode: nodes[nodes.length - 1]
    });
  }

  function dfs(node) {
    visited.add(node);
    visitedOrder.push(node);
    api.visit(node);

    emitStep();

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        treeEdges.push([node, neighbor]); 
        dfs(neighbor);
      }
    }
  }

  dfs(nodes[0]);
  emitStep();
  return visitedOrder;
}
`,  

  visualFlow: {
    nodes: [{ id: 'dfs', label: 'DFS Start', type: 'process' }],
    edges: [],
  },
},


        
        {
          title: 'Binary Search Template',
          category: 'Searching',
          description: 'Classic binary search on a sorted array.',
          pseudocode: `while low <= high:
  mid = (low + high) // 2
  if a[mid] == x: return mid
  elif a[mid] < x: low = mid + 1
  else: high = mid - 1`,
          starterCode: `function main(input, api) {
  // Ensure array is sorted
  const arr = [...input].sort((a, b) => a - b);

  // Pick a random target
  const target = arr[Math.floor(Math.random() * arr.length)];

  // Let UI display it
  api.setVar("target", target);

  let low = 0;
  let high = arr.length - 1;
  let foundAt = null;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Comparison event (for metrics)
    api.compare(arr[mid], target, { low, high, mid });

    // This snapshot is what powers the visual animation
    api.step({
      arr: [...arr],
      index: mid,      // for highlighting in RuntimePanel
      target,          // show target
      foundAt,         // highlight found index later
      vars: { low, high, mid }
    });

    if (arr[mid] === target) {
      foundAt = mid;
      api.setVar("foundAt", foundAt);

      // Final snapshot where the target is found
      api.step({
        arr: [...arr],
        index: mid,
        target,
        foundAt,
        vars: { low, high, mid }
      });

      return mid;
    }

    if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
`,
        },
      ]);

      console.log('✅ Algorithm templates seeded successfully.');
    }
  }

  findAll() {
    return this.tplRepo.find({ order: { id: 'ASC' } });
  }

  findOne(id: number) {
    return this.tplRepo.findOne({ where: { id } });
  }
}
