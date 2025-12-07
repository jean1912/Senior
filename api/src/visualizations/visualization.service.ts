import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visualization } from './visualization.entity';
import { Algorithm } from '../algorithms/algorithm.entity';
import { Users } from '../user/users.entity';
import { CreateVisualizationDto } from './dto/create-visualization.dto';
import { UpdateVisualizationDto } from './dto/update-visualization.dto';

@Injectable()
export class VisualizationService {
  constructor(
    @InjectRepository(Visualization)
    private readonly visRepo: Repository<Visualization>,
    @InjectRepository(Algorithm)
    private readonly algoRepo: Repository<Algorithm>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  // 🧩 Create a visualization
  async create(dto: CreateVisualizationDto, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const algo = await this.algoRepo.findOne({ where: { id: dto.algorithmId } });

    if (!algo || !user)
      throw new BadRequestException('Invalid algorithm or user.');

    const vis = this.visRepo.create({
      ...dto,
      algorithm: algo,
      user,
    });

    return this.visRepo.save(vis);
  }

  // 🧩 Find all visualizations
  findAll() {
    return this.visRepo.find({
      relations: ['algorithm', 'user'],
    });
  }

  // 🧩 Find one visualization by ID
  findOne(id: number) {
    return this.visRepo.findOne({
      where: { id },
      relations: ['algorithm', 'user'],
    });
  }

  // 🧩 Update a visualization
  async update(id: number, dto: UpdateVisualizationDto) {
    await this.visRepo.update(id, dto);
    return this.findOne(id);
  }

  // 🧩 Delete a visualization
  async remove(id: number) {
    return this.visRepo.delete(id);
  }

  // ⚙️ Dynamic algorithm visualization generation (with metrics)
  async generateDynamic(algorithmId: number, input: any) {
    const algo = await this.algoRepo.findOne({ where: { id: algorithmId } });
    if (!algo)
      throw new BadRequestException('Algorithm not found for visualization.');

    let result: any = {};

    try {
      const name = algo.name.toLowerCase();
      console.log(`▶️ Generating visualization for: ${algo.name} Input:`, input);

      // 🫧 Bubble Sort
      if (name.includes('bubble')) {
        const arr = [...input];
        const steps: number[][] = [];
        let comparisons = 0;
        let swaps = 0;

        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            comparisons++;
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              swaps++;
              steps.push([...arr]);
            }
          }
        }
        result = { steps, metrics: { comparisons, swaps } };
      }

      // 🔀 Merge Sort
      else if (name.includes('merge')) {
        const steps: any[] = [];
        let comparisons = 0;
        let maxDepth = 0;

        function mergeSort(arr: number[], depth = 1): number[] {
          maxDepth = Math.max(maxDepth, depth);
          if (steps.length === 0) steps.push({ initial: [...arr] });
          if (arr.length <= 1) return arr;

          const mid = Math.floor(arr.length / 2);
          const left = arr.slice(0, mid);
          const right = arr.slice(mid);

          const sortedLeft = mergeSort(left, depth + 1);
          const sortedRight = mergeSort(right, depth + 1);

          steps.push({ left: [...sortedLeft], right: [...sortedRight], merged: [] });

          const merged: number[] = [];
          let i = 0,
            j = 0;
          while (i < sortedLeft.length && j < sortedRight.length) {
            comparisons++;
            if (sortedLeft[i] < sortedRight[j]) merged.push(sortedLeft[i++]);
            else merged.push(sortedRight[j++]);
          }
          while (i < sortedLeft.length) merged.push(sortedLeft[i++]);
          while (j < sortedRight.length) merged.push(sortedRight[j++]);
          steps.push({ merged: [...merged] });
          return merged;
        }

        mergeSort([...input]);
        result = { steps, metrics: { comparisons, recursionDepth: maxDepth } };
      }

      // 🔎 Linear Search
      else if (name.includes('linear')) {
        const arr = Array.isArray(input) ? input : input.array || [];
        const target = input.target ?? arr[Math.floor(arr.length / 2)];
        const steps: { index: number; array: number[]; target: number }[] = [];
        let comparisons = 0;

        for (let i = 0; i < arr.length; i++) {
          comparisons++;
          steps.push({ index: i, array: [...arr], target });
          if (arr[i] === target) break;
        }
        result = { steps, metrics: { comparisons } };
      }      // 🧮 Factorial Sequence (1D array)
      else if (name.includes('factorial')) {
        // input can be: number n, or { n: number }
        const rawN =
          typeof input === 'number'
            ? input
            : typeof input?.n === 'number'
            ? input.n
            : 7; // default

        const n = Math.max(1, Math.floor(rawN));
        const steps: number[][] = [];
        const seq: number[] = [];
        let curr = 1;

        for (let i = 1; i <= n; i++) {
          curr *= i;
          seq.push(curr);
          steps.push([...seq]); // prefix at each step
        }

        result = {
          steps,
          metrics: {
            n,
            multiplications: Math.max(0, n - 1),
          },
        };
      }

      // 🟣 Maximum Subarray (Kadane) – 1D DP view
     else if (name.includes('max subarray') || name.includes('kadane')) {
        const arr: number[] = Array.isArray(input)
          ? [...input]
          : Array.isArray(input?.array)
          ? [...input.array]
          : [];

        if (!arr.length) {
          throw new BadRequestException(
            'Maximum Subarray visualization requires an input array.',
          );
        }

        const steps: {
          array: number[];
          index: number;
          range: { start: number; end: number };
          bestRange: { start: number; end: number };
          currentSum: number;
          bestSum: number;
        }[] = [];

        let maxSoFar = -Infinity;
        let maxEndingHere = 0;
        let start = 0;       // current window start
        let bestStart = 0;   // best window so far
        let bestEnd = 0;
        let comparisons = 0;

        for (let i = 0; i < arr.length; i++) {
          const x = arr[i];
          const extend = maxEndingHere + x;
          comparisons += 2;

          if (x > extend) {
            // start new window at i
            maxEndingHere = x;
            start = i;
          } else {
            // extend existing window
            maxEndingHere = extend;
          }

          if (maxEndingHere > maxSoFar) {
            maxSoFar = maxEndingHere;
            bestStart = start;
            bestEnd = i;
          }

          steps.push({
            array: [...arr],
            index: i,
            range: { start, end: i },
            bestRange: { start: bestStart, end: bestEnd },
            currentSum: maxEndingHere,
            bestSum: maxSoFar,
          });
        }

        result = {
          steps,
          metrics: {
            length: arr.length,
            maxSubarraySum: maxSoFar,
            comparisons,
          },
        };
      }

      // 🧷 Ugly Numbers Sequence (1D DP)
      else if (name.includes('ugly')) {
        // input can be: number n, or { n: number }
        const rawN =
          typeof input === 'number'
            ? input
            : typeof input?.n === 'number'
            ? input.n
            : 10; // default length

        const n = Math.max(1, Math.floor(rawN));
        const steps: number[][] = [];

        const ugly: number[] = [1];
        let i2 = 0,
          i3 = 0,
          i5 = 0;
        let next2 = 2,
          next3 = 3,
          next5 = 5;

        steps.push([...ugly]); // first step with [1]

        for (let i = 1; i < n; i++) {
          const next = Math.min(next2, next3, next5);
          ugly.push(next);
          steps.push([...ugly]);

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

        result = {
          steps,
          metrics: {
            length: n,
          },
        };
      }


      // 🌳 Binary Tree In-order Traversal (Tree category / name)
      else if (
        algo.category === 'Tree' ||
        name.includes('binary tree') ||
        name.includes('in-order')
      ) {
        // Expect input to be an array representing a complete binary tree (level order)
        const values: number[] = Array.isArray(input)
          ? [...input]
          : Array.isArray(input?.array)
          ? [...input.array]
          : [];

        type TreeNode = {
          value: number;
          left: TreeNode | null;
          right: TreeNode | null;
        };

        function buildTreeFromArray(vals: number[]): TreeNode | null {
          if (!vals.length) return null;
          const nodes: (TreeNode | null)[] = vals.map((v) =>
            v === null || v === undefined
              ? null
              : { value: v, left: null, right: null },
          );

          for (let i = 0; i < nodes.length; i++) {
            if (!nodes[i]) continue;
            const li = 2 * i + 1;
            const ri = 2 * i + 2;
            if (li < nodes.length) nodes[i]!.left = nodes[li];
            if (ri < nodes.length) nodes[i]!.right = nodes[ri];
          }
          return nodes[0];
        }

        // Collect nodes + edges in a graph-like format (values as ids)
        const nodesVals: number[] = [];
        const edges: [number, number][] = [];

        function collectGraphData(root: TreeNode | null) {
          if (!root) return;
          const queue: TreeNode[] = [root];
          const seen = new Set<number>();

          while (queue.length) {
            const node = queue.shift()!;
            if (!seen.has(node.value)) {
              seen.add(node.value);
              nodesVals.push(node.value);
            }
            if (node.left) {
              edges.push([node.value, node.left.value]);
              queue.push(node.left);
            }
            if (node.right) {
              edges.push([node.value, node.right.value]);
              queue.push(node.right);
            }
          }
        }

        const steps: {
          type: 'visit' | 'output' | 'backtrack';
          node: number | null;
          parent?: number | null;
          depth?: number;
        }[] = [];
        let maxDepth = 0;

        function inorderTraversal(
          node: TreeNode | null,
          parent: TreeNode | null = null,
          depth = 1,
        ) {
          if (!node) {
            steps.push({
              type: 'backtrack',
              node: parent ? parent.value : null,
              parent: parent ? parent.value : null,
              depth: depth - 1,
            });
            return;
          }

          maxDepth = Math.max(maxDepth, depth);

          // "visit" when we arrive at node
          steps.push({
            type: 'visit',
            node: node.value,
            parent: parent ? parent.value : null,
            depth,
          });

          inorderTraversal(node.left, node, depth + 1);

          // "output" when we conceptually print the node in in-order sequence
          steps.push({
            type: 'output',
            node: node.value,
            parent: parent ? parent.value : null,
            depth,
          });

          inorderTraversal(node.right, node, depth + 1);
        }

        const root = buildTreeFromArray(values);
        collectGraphData(root);
        inorderTraversal(root, null, 1);

        result = {
          nodes: nodesVals,
          edges,
          steps,
          metrics: {
            recursionDepth: maxDepth,
            nodeCount: nodesVals.length,
          },
        };
      }

      // ⚡ Binary Search (Searching only)
      else if (name.includes('binary search') || algo.category === 'Searching') {
        const arr = Array.isArray(input.array)
          ? [...input.array].sort((a, b) => a - b)
          : Array.isArray(input)
          ? [...input].sort((a, b) => a - b)
          : [];
        const target = input.target ?? arr[Math.floor(arr.length / 2)];

        const steps: {
          low: number;
          high: number;
          mid: number;
          array: number[];
          target: number;
        }[] = [];

        let low = 0,
          high = arr.length - 1,
          comparisons = 0;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          comparisons++;
          steps.push({ low, high, mid, array: [...arr], target });
          if (arr[mid] === target) break;
          if (arr[mid] < target) low = mid + 1;
          else high = mid - 1;
        }
        result = { steps, metrics: { comparisons } };
      }
      // 🌐 Breadth-First Search (BFS)
else if (name.includes('bfs')) {
  const nodes = Object.keys(input);
  const edges: [string, string][] = [];
  for (const [u, neighbors] of Object.entries(input)) {
    for (const v of neighbors as string[]) edges.push([u, v]);
  }

  const visitedSet = new Set<string>();
  const visitedOrder: string[] = [];
  const treeEdges: [string, string][] = [];

  const startNode = nodes[0];
  const targetNode = nodes[nodes.length - 1];
  const queue: string[] = [];

  if (startNode) {
    visitedSet.add(startNode);
    queue.push(startNode);
    visitedOrder.push(startNode);
  }

  const steps: string[][] = [];
  steps.push([...visitedOrder]);

  while (queue.length) {
    const node = queue.shift()!;
    if (node === targetNode) break;

    for (const next of (input[node] as string[]) || []) {
      if (!visitedSet.has(next)) {
        visitedSet.add(next);
        queue.push(next);
        treeEdges.push([node, next]);       // BFS tree edge
        visitedOrder.push(next);
        steps.push([...visitedOrder]);
      }
    }
  }

  result = {
    nodes,
    edges,
    treeEdges,
    visitedOrder,
    steps,
    startNode,
    targetNode,
    metrics: { queueOps: visitedOrder.length }
  };
}   
      // 🌲 Red-Black Tree Insertion (visualized)
      else if (name.includes('red-black') || name.includes('red black')) {
        if (!Array.isArray(input)) {
          throw new BadRequestException(
            'Red-Black Tree visualization requires an array of inserted keys.',
          );
        }

        // We execute the stored algorithm code safely
        const steps: any[] = [];

        try {
          // Create a function from stored "code" string
          const fn = new Function('input', 'steps', algo.code?? '');

          // Run algorithm
          fn(input, steps);

          result = {
            steps,
            metrics: {
              inserts: input.length,
              rotations: steps.filter(s => s.rotation).length,
            },
          };
        } catch (err) {
          console.error('❌ RBT execution failed:', err);
          throw new BadRequestException('Red-Black Tree execution error.');
        }
      }

   // 🌐 Dijkstra Shortest Path (weighted graph)
      else if (name.includes('dijkstra')) {
        const nodes = Object.keys(input || {});
        if (!nodes.length) {
          throw new BadRequestException(
            'Dijkstra visualization requires a graph adjacency list.',
          );
        }

        type EdgeTriple = [string, string, number];
        const edges: EdgeTriple[] = [];
        const adj: Record<string, { node: string; weight: number }[]> = {};

        for (const [u, neighbors] of Object.entries(input)) {
          adj[u] = [];
          for (const v of (neighbors as string[]) || []) {
            const w = Math.floor(Math.random() * 9) + 1; // random weight 1..9
            edges.push([u, v, w]);
            adj[u].push({ node: v, weight: w });
          }
        }

        const startNode = nodes[0] ?? null;
        const targetNode = nodes[nodes.length - 1] ?? null;

        const dist: Record<string, number> = {};
        const prev: Record<string, string | null> = {};
        const visitedSet = new Set<string>();
        const visitedOrder: string[] = [];
        const treeEdges: [string, string][] = [];

        nodes.forEach((n) => {
          dist[n] = Infinity;
          prev[n] = null;
        });
        if (startNode) dist[startNode] = 0;

        type PQEntry = { node: string; dist: number };
        const pq: PQEntry[] = [];
        if (startNode) pq.push({ node: startNode, dist: 0 });

        let relaxations = 0;
        let maxFrontierSize = 0;

        type DijkstraStep = {
          nodes: string[];
          edges: EdgeTriple[];
          treeEdges: [string, string][];
          visitedOrder: string[];
          startNode: string | null;
          targetNode: string | null;
          current?: string | null;
          relaxing?: [string, string] | null;
          shortestPath?: string[];
          vars: {
            dist: Record<string, number>;
            visited: string[];
            frontier: string[];
          };
        };

        const steps: DijkstraStep[] = [];

        function emitStep(extra: Partial<DijkstraStep> = {}) {
          const frontierStrings = pq.map((e) => `${e.node}(${e.dist})`);
          maxFrontierSize = Math.max(maxFrontierSize, frontierStrings.length);

          steps.push({
            nodes: [...nodes],
            edges: edges.map(([u, v, w]) => [u, v, w]),
            treeEdges: [...treeEdges],
            visitedOrder: [...visitedOrder],
            startNode,
            targetNode,
            current: null,
            relaxing: null,
            shortestPath: [],
            ...extra,
            vars: {
              dist: { ...dist },
              visited: [...visitedOrder],
              frontier: frontierStrings,
            },
          });
        }

        if (startNode) {
          emitStep({ current: startNode });
        }

        while (pq.length) {
          pq.sort((a, b) => a.dist - b.dist);
          const { node } = pq.shift()!;
          if (visitedSet.has(node)) continue;

          visitedSet.add(node);
          visitedOrder.push(node);
          emitStep({ current: node });

          if (node === targetNode) break;

          for (const { node: neigh, weight } of adj[node] || []) {
            if (visitedSet.has(neigh)) continue;
            const alt = dist[node] + weight;
            if (alt < dist[neigh]) {
              dist[neigh] = alt;
              prev[neigh] = node;
              treeEdges.push([node, neigh]);
              relaxations++;
              pq.push({ node: neigh, dist: alt });
              emitStep({
                current: node,
                relaxing: [node, neigh],
              });
            }
          }
        }

        // Reconstruct shortest path from start to target
        const shortestPath: string[] = [];
        if (targetNode && dist[targetNode] < Infinity) {
          let cur: string | null = targetNode;
          while (cur) {
            shortestPath.unshift(cur);
            cur = prev[cur];
          }
        }

        // Final summary step with shortest path
        emitStep({ shortestPath });

        result = {
          nodes,
          edges,
          treeEdges,
          visitedOrder,
          steps,
          startNode,
          targetNode,
          shortestPath,
          metrics: {
            relaxations,
            frontierMaxSize: maxFrontierSize,
          },
        };
      }


      // 🌐 Depth-First Search
      else if (name.includes('dfs')) {
        const nodes = Object.keys(input);
        const edges: [string, string][] = [];
        for (const [u, neighbors] of Object.entries(input)) {
          for (const v of neighbors as string[]) edges.push([u, v]);
        }

        const visited: string[] = [];
        const steps: string[][] = [];
        const visitedSet = new Set<string>();
        const startNode = nodes[0];
        const targetNode = nodes[nodes.length - 1];
        const treeEdges: [string, string][] = [];
        let maxDepth = 0;

        function dfs(node: string, depth = 1): boolean {
          maxDepth = Math.max(maxDepth, depth);
          visitedSet.add(node);
          visited.push(node);
          steps.push([...visited]);

          if (node === targetNode) return true;

          for (const next of (input[node] as string[]) || []) {
            if (!visitedSet.has(next)) {
              treeEdges.push([node, next]);
              if (dfs(next, depth + 1)) {
                return true; // target found in subtree
              }
            }
          }

          return false; // continue exploring siblings
        }

        if (startNode) dfs(startNode);
        result = {
          nodes,
          edges,
          treeEdges,
          visitedOrder: visited,
          steps,
          startNode,
          targetNode,
          metrics: { recursionDepth: maxDepth },
        };
      }

      // Default fallback
      else {
        result = { steps: [[1, 3, 2, 4], [1, 2, 3, 4]], metrics: {} };
      }
    } catch (err) {
      console.error('❌ Algorithm execution error:', err);
      throw new BadRequestException('Algorithm execution failed.');
    }

    return {
      algorithm: { id: algo.id, name: algo.name },
      stateJson: result,
    };
  }
}
