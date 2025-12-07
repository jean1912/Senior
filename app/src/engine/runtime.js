/**
 * Universal, lightweight sandbox runtime for user-provided algorithms.
 * Handles: step snapshots, compare, swap, visit, recurse, logs, vars.
 * Works with transpiled ES5 code from compile.js.
 */

export function runInSandbox(code, input, options = {}) {
  const maxSteps = options.maxSteps ?? 2000;
  const timeLimitMs = options.timeLimitMs ?? 4000;

  const steps = [];
  const logs = [];
  const vars = {};
  let stepsCount = 0;
  let timedOut = false;

  const api = {
    // 🧩 Variable helpers
    setVar: (k, v) => (vars[k] = v),
    getVar: (k) => vars[k],

    // 🧠 Capture full state snapshots
    step: (state = {}, meta = {}) => {
      stepsCount++;
      if (stepsCount > maxSteps)
        throw new Error(`Step limit exceeded (${maxSteps}).`);
      steps.push({ type: "step", state, meta, vars: { ...vars } });
    },

    // 🔁 Array-specific helpers
    compare: (a, b, meta = {}) => {
      const res = a < b ? -1 : a > b ? 1 : 0;
      steps.push({ type: "compare", a, b, res, meta, vars: { ...vars } });
      return res;
    },

    swap: (arr, i, j, meta = {}) => {
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      steps.push({ type: "swap", i, j, arr: [...arr], meta, vars: { ...vars } });
    },

    visit: (node, meta = {}) => {
      steps.push({ type: "visit", node, meta, vars: { ...vars } });
    },

    recurse: (context = {}) => {
      steps.push({ type: "recursion", context, vars: { ...vars } });
    },

    // 🧾 Debug logging
    log: (...args) => {
      try {
        logs.push(args.map(String).join(" "));
      } catch {
        logs.push("[unserializable log]");
      }
    },

    // 🚀 NEW: Bulk step setter — allows api.setSteps([...])
    setSteps: (stepsArray) => {
      if (!Array.isArray(stepsArray)) return;
      for (const s of stepsArray) {
        // If it's an array, wrap it as { state: array }
        if (Array.isArray(s)) {
          api.step(s);
        } else if (typeof s === "object" && s !== null) {
          api.step(s.state ?? s, s.meta ?? {});
        } else {
          // Fallback for primitive states
          api.step({ value: s });
        }
      }
    },
  };

  // ⏱ Execution guard
  const start = performance.now();
  const guard = () => {
    if (performance.now() - start > timeLimitMs) {
      timedOut = true;
      throw new Error(`Execution time limit exceeded (${timeLimitMs} ms).`);
    }
  };

  // 🧩 Wrap user code into isolated function
  const wrapped = `
    "use strict";
    const __guard__ = ${guard.toString()};
    let __maybeMain__;
    try {
      ${code}
      __maybeMain__ = (typeof main === "function") ? main : undefined;
    } catch (e) { throw e; }
    if (__maybeMain__) { return __maybeMain__(input, api); }
    return undefined;
  `;

  try {
    const fn = new Function("input", "api", wrapped);

    // Clone input to avoid mutation of external state
    const safeInput =
      typeof structuredClone === "function"
        ? structuredClone(input)
        : JSON.parse(JSON.stringify(input));

    const result = fn(safeInput, api);

    if (steps.length === 0)
      api.step(result ?? safeInput, { note: "No steps emitted; showing result." });

    return { steps, logs, error: undefined };
  } catch (err) {
    if (!timedOut) logs.push(`Runtime error: ${String(err?.message ?? err)}`);
    return { steps: [], logs, error: String(err?.message ?? err) };
  }
}
