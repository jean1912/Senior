// ================================
//  VisualizerCanvas.jsx — with logs
// ================================
import React, { useState, useEffect, useRef } from "react";
import { Button, ButtonGroup, Spinner, Badge } from "react-bootstrap";
import GraphViewSVG from "./GraphViewSVG";
import MergeSortVisualizer from "./MergeSortVisualizer";
import TreeViewSVG from "./TreeViewSVG";
import ArrayView from "./ArrayView"; // ✅ NEW
import { generateVisualization } from "../../services/VisualizerService";
import { explainAlgorithm } from "../../services/ai"; // ✅ NEW
import "./VisualizerCanvas.css";

/* ------------ helpers ------------ */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateRandomArray = (size = 10, min = 10, max = 90) =>
  Array.from({ length: size }, () => rand(min, max));

const generateRandomGraph = (nodeCount = 6) => {
  const nodes = Array.from({ length: nodeCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const edges = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < 0.35) edges.push([nodes[i], nodes[j]]);
    }
  }
  const graph = {};
  for (const n of nodes) graph[n] = [];
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  return graph;
};

function arrayDiffIndices(prev = [], curr = []) {
  const hi = [];
  const n = Math.max(prev.length, curr.length);
  for (let i = 0; i < n; i++) if (prev[i] !== curr[i]) hi.push(i);
  return hi;
}

function buildTraceForArrayAlgorithms(algoName, stateJson) {
  const steps = stateJson?.steps || [];
  console.log("[VC] buildTraceForArrayAlgorithms steps:", steps);

  const isLinear = algoName.includes("linear search");
  console.log(
    "[VC] buildTraceForArrayAlgorithms algoName:",
    algoName,
    "isLinear:",
    isLinear
  );

  if (isLinear) {
    return steps.map((s, idx) => ({
      array: s.array?.slice?.() || [],
      highlight: typeof s.index === "number" ? [s.index] : [],
      target: s.target,
      announce:
        typeof s.index === "number"
          ? `Comparing index ${s.index}${
              s.array?.[s.index] === s.target ? " — target found" : ""
            }`
          : `Step ${idx + 1}`,
    }));
  }

  const out = [];
  if (Array.isArray(steps) && steps.length && Array.isArray(steps[0])) {
    out.push({
      array: steps[0].slice(),
      highlight: [],
      announce: "Initial array",
    });

    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1];
      const curr = steps[i];

      if (!Array.isArray(prev) || !Array.isArray(curr)) continue;

      out.push({
        array: curr.slice(),
        highlight: arrayDiffIndices(prev, curr),
        announce: `Step ${i + 1}`,
      });
    }

    out.push({
      array: steps[steps.length - 1].slice(),
      highlight: [],
      announce: "Completed.",
    });
  }

  console.log("[VC] buildTraceForArrayAlgorithms trace out:", out);
  return out;
}

// ✅ Simple inline styles for the AI modal (so we don't touch CSS files)
const aiOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const aiModalStyle = {
  width: "480px",
  maxWidth: "90vw",
  maxHeight: "80vh",
  background: "#0f172a",
  borderRadius: "12px",
  padding: "16px 18px",
  boxShadow: "0 18px 45px rgba(0,0,0,0.4)",
  color: "#e5e7eb",
  display: "flex",
  flexDirection: "column",
};

const aiHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
};

const aiBodyStyle = {
  flex: 1,
  overflowY: "auto",
  borderRadius: "8px",
  background: "#020617",
  padding: "10px 12px",
  fontSize: "0.9rem",
  whiteSpace: "pre-wrap",
};

/* ------------ component ------------ */
const VisualizerCanvas = ({ visualization, onBack }) => {
  const [loading, setLoading] = useState(true);

  const [generatedData, setGeneratedData] = useState(null);
  const [lastState, setLastState] = useState(null);

  const [trace, setTrace] = useState([]);
  const [arr, setArr] = useState([]);
  const [hi, setHi] = useState([]);

  const [step, setStep] = useState(0); // used for array + ArrayView
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const timerRef = useRef(null);

  const [bsStepIndex, setBsStepIndex] = useState(0); // for graph/tree/binary
  const [bsPlaying, setBsPlaying] = useState(false);

  const [binaryTarget, setBinaryTarget] = useState(null);

  // ✅ AI modal state (NEW)
  const [aiModal, setAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");

  // =============================
  //   ALGORITHM TYPE DETECTION
  // =============================

  const algoName = (visualization.algorithm?.name || "").toLowerCase();
  console.log("[VC] algoName:", algoName);

  const isRedBlack = algoName.includes("red-black");

const isTree =
    !isRedBlack && (
        visualization.structureType === "Tree" ||
        algoName.includes("tree") ||
        algoName.includes("in-order")
    );


  const isBinarySearch =
    algoName.includes("binary search") ||
    (algoName.includes("binary") && !isTree);

  const isMerge = algoName.includes("merge");
  const isGraph = visualization.structureType === "Graph";

  // New: algorithms that should use ArrayView (1D sequence window-style)
  const isFactorialAlgo = algoName.includes("factorial");
  const isUglyAlgo = algoName.includes("ugly");
  const isKadaneAlgo =
    algoName.includes("max subarray") || algoName.includes("kadane");

  const isArrayViewAlgo = isFactorialAlgo || isUglyAlgo || isKadaneAlgo;

  // array = anything that isn't tree, binary-search, merge, or graph
  const isArrayAlgo = !isBinarySearch && !isGraph && !isMerge && !isTree;

  console.log("[VC] mode flags:", {
    isTree,
    isBinarySearch,
    isMerge,
    isGraph,
    isArrayAlgo,
    isArrayViewAlgo,
    structureType: visualization.structureType,
  });

  useEffect(() => {
    console.log("[VC] useEffect visualization changed:", visualization);
    fetchGenerated();
    return () => {
      console.log("[VC] clearing timerRef on unmount/visualization change");
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualization]);

  async function fetchGenerated() {
    try {
      setLoading(true);
      console.log("[VC] fetchGenerated start", {
        algoName,
        isTree,
        isBinarySearch,
        isGraph,
        isMerge,
        isArrayAlgo,
        isArrayViewAlgo,
      });

      let payload;

      if (isTree) {
        payload = generateRandomArray(7, 1, 99);
      } else if (isBinarySearch) {
        const array = generateRandomArray(10, 10, 90).sort((a, b) => a - b);
        const target = array[rand(0, array.length - 1)];
        payload = { array, target };
        setBinaryTarget(target);
      } else if (isGraph) {
        payload = generateRandomGraph(6);
      } else if (isKadaneAlgo) {
        // Generate mixed values to show proper Kadane behavior
        payload = generateRandomArray(10, -10, 10);
      } else {
        payload = generateRandomArray(10, 10, 90);
      }

      console.log("[VC] payload for generateVisualization:", payload);

      const res = await generateVisualization(
        visualization.algorithm?.id,
        payload
      );

      console.log("[VC] backend response:", res);
      console.log("[VC] backend stateJson:", res?.stateJson);

      setGeneratedData(res.stateJson || {});
      setLastState(res.stateJson || {});
      console.log(
        "[VC] generatedData set, isTree/isGraph/isBinarySearch/isArrayAlgo/isArrayViewAlgo:",
        {
          isTree,
          isGraph,
          isBinarySearch,
          isArrayAlgo,
          isArrayViewAlgo,
        }
      );

      // Tree / Graph — handled by SVG components
      if (isTree || isGraph) {
        console.log("[VC] Tree/Graph mode — skipping array trace setup");
        setBsStepIndex(0);
        setBsPlaying(false);
        setStep(0);
        setPlaying(false);
        return;
      }

      // Binary Search — bar view with low/high/mid
      if (isBinarySearch) {
        console.log(
          "[VC] BinarySearch mode — using steps in bsStepIndex animation"
        );
        setBsStepIndex(0);
        setBsPlaying(false);
        setStep(0);
        setPlaying(false);
        return;
      }

      // Merge sort uses dedicated component
      if (isMerge) {
        setStep(0);
        setPlaying(false);
        return;
      }

      // ARRAY algorithms
      if (isArrayAlgo) {
        if (isArrayViewAlgo) {
          // Factorial / Ugly / Kadane → we just drive step index; ArrayView reads raw steps
          console.log("[VC] ArrayView algorithm — using raw steps only");
          setTrace([]);
          setArr([]);
          setHi([]);
          setStep(0);
          setPlaying(false);
        } else {
          // Bubble / Selection / Linear
          console.log("[VC] Array algorithm mode — building trace");
          const t = buildTraceForArrayAlgorithms(algoName, res.stateJson || {});
          console.log("[VC] trace built:", t);
          setTrace(t);
          setStep(0);
          setPlaying(false);
          setArr(t[0]?.array || []);
          setHi([]);
        }
      }
    } catch (e) {
      console.error("❌ Visualization generation failed:", e);
    } finally {
      setLoading(false);
      console.log("[VC] fetchGenerated finished, loading set to false");
    }
  }

  function replayLast() {
    console.log("[VC] replayLast called. hasLastState:", !!lastState, {
      isArrayAlgo,
      isArrayViewAlgo,
    });
    if (!lastState) return;
    setGeneratedData(lastState);

    if (isArrayAlgo && !isArrayViewAlgo) {
      console.log("[VC] replayLast building trace from lastState");
      const t = buildTraceForArrayAlgorithms(algoName, lastState);
      setTrace(t);
      setStep(0);
      setPlaying(false);
      setArr(t[0]?.array || []);
      setHi([]);
    } else {
      console.log("[VC] replayLast resetting bsStepIndex/bsPlaying/step");
      setBsStepIndex(0);
      setBsPlaying(false);
      setStep(0);
      setPlaying(false);
    }
  }

  // ARRAY ANIMATION LOOP (for bar arrays + ArrayView)
  useEffect(() => {
    console.log("[VC] array animation effect:", {
      playing,
      speed,
      traceLen: trace.length,
      isArrayAlgo,
      isArrayViewAlgo,
      stepsLen: generatedData?.steps?.length,
    });

    if (!isArrayAlgo) return;

    const totalSteps = isArrayViewAlgo
      ? (generatedData?.steps?.length || 0)
      : trace.length;

    if (!totalSteps) return;

    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s + 1 >= totalSteps) {
            console.log("[VC] array/ArrayView animation reached end, stopping");
            clearInterval(timerRef.current);
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [playing, speed, trace.length, isArrayAlgo, isArrayViewAlgo, generatedData]);

  // Sync array + highlight to current step (ONLY for bar-style arrays)
  useEffect(() => {
    console.log("[VC] sync array to step:", {
      step,
      traceLen: trace.length,
      isArrayAlgo,
      isArrayViewAlgo,
    });
    if (!isArrayAlgo || isArrayViewAlgo) return; // ❗ don't touch for ArrayView algo
    const snap = trace[Math.max(0, Math.min(step, trace.length - 1))];
    console.log("[VC] current snap:", snap);
    if (!snap) return;
    setArr(snap.array.slice());
    setHi(snap.highlight || []);
  }, [step, trace, isArrayAlgo, isArrayViewAlgo]);

  // extra debug on states
  useEffect(() => {
    console.log("[VC] playing/step changed:", { playing, step });
  }, [playing, step]);

  useEffect(() => {
    console.log("[VC] bsPlaying/bsStepIndex changed:", {
      bsPlaying,
      bsStepIndex,
    });
  }, [bsPlaying, bsStepIndex]);

  const steps = generatedData?.steps || [];
  const currentStep = steps[bsStepIndex] || {};

  // GRAPH / TREE / BINARY animation loop
  useEffect(() => {
    console.log("[VC] graph/tree/binary animation effect:", {
      bsPlaying,
      bsStepIndex,
      stepsLen: steps.length,
      isArrayAlgo,
      isMerge,
    });

    // only skip array + merge; allow TREE + BINARY SEARCH + GRAPH
    if (isArrayAlgo || isMerge) return;
    if (!bsPlaying) return;

    if (bsStepIndex >= steps.length - 1) {
      console.log("[VC] graph/tree/binary reached last step, stopping");
      setBsPlaying(false);
      return;
    }

    const t = setTimeout(() => {
      console.log(
        "[VC] graph/tree/binary advancing step to:",
        bsStepIndex + 1
      );
      setBsStepIndex((i) => i + 1);
    }, 1200);
    return () => clearTimeout(t);
  }, [bsPlaying, bsStepIndex, steps.length, isArrayAlgo, isMerge]);

  // ✅ "Explain Algorithm" handler (does NOT touch animations)
  async function handleExplainAlgo() {
    if (!visualization?.algorithm?.id) return;
    setAiModal(true);
    setAiLoading(true);
    setAiText("");

    try {
      const text = await explainAlgorithm(
        visualization.algorithm.id,
        "Explain this algorithm in a simple way for a beginner."
      );
      setAiText(text || "No explanation returned.");
    } catch (err) {
      console.error("AI explain error:", err);
      setAiText("❌ Could not load explanation. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  // ============================================
  // R E N D E R
  // ============================================
  console.log("[VC] render, loading:", loading, {
    isTree,
    isBinarySearch,
    isGraph,
    isMerge,
    isArrayAlgo,
    isArrayViewAlgo,
    stepsLen: steps.length,
    bsStepIndex,
    step,
  });

  if (loading) {
    return (
      <div className="vc-wrapper">
        <div className="vc-card center">
          <Spinner animation="border" />{" "}
          <p className="mt-3 mb-0">Generating visualization…</p>
        </div>
      </div>
    );
  }

  const { name, category, complexity, description, pseudocode, code } =
    visualization.algorithm || {};

  const metrics = generatedData?.metrics || {};
  console.log("[VC] metrics:", metrics);

  // Total step count for array/ArrayView, used by "Step →" button
  const arrayStepsTotal = isArrayViewAlgo
    ? (generatedData?.steps?.length || 0)
    : trace.length;
  const lastArrayStepIndex = Math.max(0, arrayStepsTotal - 1);

  return (
    <div className="vc-page">
      <header className="vc-header">
        <div className="vc-header-row">
          <div className="d-flex align-items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onBack}>
              ← Back
            </Button>
            <h1 className="vc-title">{name || visualization.title}</h1>
          </div>

          {/* ✅ New Explain Algorithm button */}
          <Button
            size="sm"
            variant="info"
            onClick={handleExplainAlgo}
          >
            🤖 Explain Algorithm
          </Button>
        </div>
        <p className="vc-desc">{description}</p>
      </header>

      <main className="vc-main">
        <section className="vc-card visual">
          <div className="vc-toolbar d-flex justify-content-between align-items-center">
            {/* playback controls */}
            <div className="vc-toolbar-right">
              {/* ARRAY + MERGE SORT CONTROLS */}
              {(isArrayAlgo || isMerge) && (
                <>
                  <Button
                    size="sm"
                    className="me-2"
                    onClick={() => setPlaying((p) => !p)}
                  >
                    {playing ? "Pause" : "Play"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={() =>
                      setStep((s) =>
                        Math.min(s + 1, lastArrayStepIndex)
                      )
                    }
                    disabled={arrayStepsTotal === 0}
                  >
                    Step →
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="me-2"
                    onClick={fetchGenerated}
                  >
                    Reset
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-info"
                    onClick={replayLast}
                  >
                    🔁 Replay
                  </Button>
                </>
              )}

              {/* GRAPH + TREE + BINARY SEARCH CONTROLS */}
              {!isArrayAlgo && !isMerge && (
                <>
                  <ButtonGroup size="sm" className="me-2">
                    <Button
                      variant="outline-light"
                      onClick={() =>
                        setBsStepIndex((i) => Math.max(0, i - 1))
                      }
                    >
                      ← Prev
                    </Button>

                    <Button
                      variant="warning"
                      onClick={() => setBsPlaying((p) => !p)}
                    >
                      {bsPlaying ? "⏸ Pause" : "▶️ Play"}
                    </Button>

                    <Button
                      variant="outline-light"
                      onClick={() =>
                        setBsStepIndex((i) =>
                          Math.min(steps.length - 1, i + 1)
                        )
                      }
                    >
                      Next →
                    </Button>
                  </ButtonGroup>

                  <Button
                    size="sm"
                    className="me-2"
                    variant="info"
                    onClick={fetchGenerated}
                  >
                    🔄 Reset
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-info"
                    onClick={replayLast}
                  >
                    🔁 Replay
                  </Button>
                </>
              )}
            </div>

            {/* METRICS */}
            <div className="metrics-badges">
              {metrics.comparisons !== undefined && (
                <Badge bg="info" text="dark" className="me-1">
                  🔢 Comparisons: {metrics.comparisons}
                </Badge>
              )}
              {metrics.swaps !== undefined && (
                <Badge bg="warning" text="dark" className="me-1">
                  🔄 Swaps: {metrics.swaps}
                </Badge>
              )}
              {metrics.recursionDepth !== undefined && (
                <Badge bg="secondary" className="me-1">
                  🌀 Depth: {metrics.recursionDepth}
                </Badge>
              )}
              {metrics.maxSubarraySum !== undefined && (
                <Badge bg="success" className="me-1">
                  💰 Max Sum: {metrics.maxSubarraySum}
                </Badge>
              )}
            </div>
          </div>

          {/* VISUALIZATION AREA */}
          <div
            className={`bars ${
              algoName.includes("bubble") ? "bubble-sort" : ""
            }`}
          >
            {/* 🌳 TREE VIEW (Binary Tree + Red-Black Tree) */}
{isTree || isRedBlack ? (
  <>
    {console.log("[VC] Rendering TreeViewSVG with data:", {
      nodes: generatedData.nodes,
      edges: generatedData.edges,
      steps: generatedData.steps,
      bsStepIndex,
    })}

    <TreeViewSVG
      nodes={generatedData.nodes || []}
  edges={generatedData.edges || []}
  steps={generatedData.steps || []}
  stepIndex={bsStepIndex}
  width={800}
  height={450}
    />
  </>

            ) : /* GRAPH VIEW */ isGraph ? (
              <>
                {console.log("[VC] Rendering GraphViewSVG with data:", {
                  nodes: generatedData?.nodes,
                  edges: generatedData?.edges,
                  visitedOrder:
                    generatedData?.visitedOrder ||
                    generatedData?.steps?.flat() ||
                    [],
                  bsStepIndex,
                })}
                <GraphViewSVG
                  nodes={generatedData?.nodes || []}
                  edges={generatedData?.edges || []}
                  treeEdges={generatedData?.treeEdges || []}
                  visitedOrder={
                    generatedData?.visitedOrder ||
                    generatedData?.steps?.flat() ||
                    []
                  }
                  stepIndex={bsStepIndex}
                  startNode={generatedData?.startNode || null}
                  targetNode={generatedData?.targetNode || null}
                    shortestPath={generatedData?.shortestPath || []}

                  width={820}
                  height={460}
                />
              </>
            ) : /* BINARY SEARCH */ isBinarySearch ? (
              <>
                {console.log(
                  "[VC] Rendering Binary Search bars with step:",
                  {
                    currentStep,
                    bsStepIndex,
                    binaryTarget,
                  }
                )}
                <p className="text-warning mb-3 fw-bold">
                  🎯 Target: {binaryTarget}
                </p>

                <div className="bars">
                  {currentStep.array?.map((num, i) => {
                    const { low, high, mid, target } = currentStep;

                    let bg = "#fbbf24";
                    if (i === mid) bg = "#22c55e";
                    if (i < low || i > high) bg = "#475569";
                    if (num === target && i === mid) bg = "#ef4444";

                    return (
                      <div
                        key={i}
                        className="bar"
                        style={{
                          background: bg,
                          height: `${num * 5.5}px`,
                          opacity: i < low || i > high ? 0.5 : 1,
                        }}
                        title={`Index ${i} • ${num}`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : /* MERGE SORT */ isMerge ? (
              <>
                {console.log(
                  "[VC] Rendering MergeSortVisualizer with steps:",
                  generatedData?.steps
                )}
                <MergeSortVisualizer
                  steps={generatedData?.steps || []}
                  playing={playing}
                  speed={speed}
                />
              </>
            ) : (
              /* ARRAY (bubble, selection, linear, factorial, ugly, kadane) */
              <>
                {isArrayViewAlgo ? (
                  <>
                    {console.log(
                      "[VC] Rendering ArrayView with steps:",
                      generatedData?.steps,
                      "step:",
                      step
                    )}
                    <ArrayView
                      algorithmName={algoName}
                      steps={generatedData?.steps || []}
                      stepIndex={step}
                    />
                  </>
                ) : (
                  <>
                    {console.log(
                      "[VC] Rendering array bars with arr/hi:",
                      {
                        arr,
                        hi,
                        step,
                        traceLen: trace.length,
                      }
                    )}
                    {arr.map((v, i) => {
                      const isHi = hi.includes(i);
                      const currentStep = trace[step] || {};
                      const target = currentStep.target;
                      const isTarget = v === target;

                      return (
                        <div
                          key={i}
                          className={`bar ${
                            isTarget
                              ? "found"
                              : isHi
                              ? "highlight"
                              : "normal"
                          }`}
                          style={{ height: `${v * 5.5}px` }}
                          title={`Index ${i} • ${v}`}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* -----------------------
           Info Panel
        ------------------------*/}
        <aside className="vc-card info">
          <div className="info-head">
            <div className="pill">{category}</div>
            <div className="pill alt">{complexity}</div>
          </div>

          {metrics && Object.keys(metrics).length > 0 && (
            <div className="info-section">
              <h3 className="info-title">Metrics</h3>
              <ul className="metrics-list">
                {Object.entries(metrics).map(([k, v]) => (
                  <li key={k}>
                    <strong>{k}:</strong> {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="info-section">
            <h3 className="info-title">Pseudocode</h3>
            <pre className="code-block pseudo">{pseudocode || "N/A"}</pre>
          </div>

          <div className="info-section">
            <h3 className="info-title">JavaScript Code</h3>
            <pre className="code-block code">{code || "N/A"}</pre>
          </div>
        </aside>
      </main>

      {/* ✅ AI Explanation Modal */}
      {aiModal && (
        <div
          style={aiOverlayStyle}
          onClick={() => setAiModal(false)}
        >
          <div
            style={aiModalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={aiHeaderStyle}>
              <h5 className="mb-0">🤖 Algorithm Explanation</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={() => setAiModal(false)}
              ></button>
            </div>
            <div style={aiBodyStyle}>
              {aiLoading ? (
                <p>Thinking about this algorithm…</p>
              ) : (
                <pre style={{ margin: 0 }}>{aiText || "No explanation."}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizerCanvas;
