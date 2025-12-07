import * as monaco from "monaco-editor";

export function registerAlgorithmAPI() {
  const apiDocs = `
    declare const api: {
      /**
       * Records a visualization step.
       * @param state The state to snapshot (array, object, graph, etc.)
       * @param meta Optional metadata (line numbers, markers, flags)
       */
      step(state?: any, meta?: any): void;

      /**
       * Compares two values and emits a compare step.
       * Returns -1, 0, or 1.
       */
      compare(a: any, b: any, meta?: any): number;

      /**
       * Swaps arr[i] and arr[j] and emits a swap step.
       */
      swap(arr: any[], i: number, j: number, meta?: any): void;

      /**
       * Marks a node as visited (for graph/tree algorithms).
       */
      visit(node: any, meta?: any): void;

      /**
       * Records a recursion step (used for DFS, mergesort…)
       */
      recurse(ctx?: any): void;

      /**
       * Writes values to the runtime log panel.
       */
      log(...args: any[]): void;

      /**
       * Stores a key–value pair (useful for tracking variables).
       */
      setVar(key: string, value: any): void;

      /**
       * Retrieves a previously stored variable.
       */
      getVar(key: string): any;

      /**
       * Injects an entire list of steps (for batch visualization).
       */
      setSteps(steps: any[]): void;
    };
  `;

  monaco.languages.typescript.javascriptDefaults.addExtraLib(apiDocs, "api.d.ts");
}
