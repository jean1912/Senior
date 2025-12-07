// src/components/AlgorithmBuilder/RuntimePanel.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GraphViewSVG from "../Visualizer/GraphViewSVG"; // reuse your existing graph component

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

export default function RuntimePanel({ category, pseudocode, runResult }) {
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(700);

  const steps = runResult?.steps ?? [];
  const step = steps[idx] ?? null;

  useEffect(() => {
    setIdx(0);
    setIsPlaying(false);
  }, [runResult]);

  useEffect(() => {
    if (!isPlaying) return;
    if (idx >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), speedMs);
    return () => clearTimeout(t);
  }, [isPlaying, idx, steps.length, speedMs]);

  const next = () => setIdx((i) => clamp(i + 1, 0, steps.length - 1));
  const prev = () => setIdx((i) => clamp(i - 1, 0, steps.length - 1));

  const lines = (pseudocode || "").split("\n");

  // ------------------ 🧠 Smart Visualization ------------------
  const renderState = () => {
    if (!step) return <p className="text-white-50">No steps yet.</p>;
    const state = step.state || step;

    // 🟡 SORTING
    if (category === "Sorting" && (Array.isArray(state.arr) || Array.isArray(state))) {
      const arr = state.arr || state;
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            height: 240,
            gap: 6,
          }}
        >
          <AnimatePresence>
            {arr.map((num, i) => (
              <motion.div
                key={`${i}:${num}`}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
                style={{
                  width: 26,
                  height: `${Number(num) * 5 || 5}px`,
                  background: "#fbbf24",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "center",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                {num}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      );
    }

    // 🟩 SEARCHING
    if (category === "Searching" && state?.arr) {
      const { arr, index, target, foundAt } = state;
      return (
        <div className="d-flex justify-content-center gap-2" style={{ fontSize: 16 }}>
          {arr.map((v, i) => {
            const isCurrent = i === index;
            const isFound = i === foundAt;
            return (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  lineHeight: "40px",
                  borderRadius: 6,
                  background: isFound
                    ? "#22c55e"
                    : isCurrent
                    ? "#facc15"
                    : "#1e293b",
                  color: "white",
                  textAlign: "center",
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
      );
    }

    // 🌐 GRAPH
    if (category === "Graph" && state?.nodes && state?.edges) {
      return (
        <GraphViewSVG
          nodes={state.nodes || []}
          edges={state.edges || []}
          treeEdges={state.treeEdges || []}

          visitedOrder={state.visitedOrder || []}
          stepIndex={idx}
          startNode={state.startNode || null}
          targetNode={state.targetNode || null}
          width={720}
          height={360}
        />
      );
    }

    // 🌳 TREE
    if (category === "Tree" && state?.tree) {
      const renderNode = (node) => {
        if (!node) return null;
        return (
          <div style={{ textAlign: "center", margin: "8px" }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 8,
                background: "#fbbf24",
                color: "#111",
                fontWeight: "bold",
              }}
            >
              {node.value}
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {node.left && renderNode(node.left)}
              {node.right && renderNode(node.right)}
            </div>
          </div>
        );
      };
      return <div className="tree-container">{renderNode(state.tree)}</div>;
    }

    // 🧩 Fallback JSON
    return (
      <pre
        style={{
          background: "#494b59ff",
          color: "#f3f4f6",
          padding: 12,
          borderRadius: 8,
          maxHeight: 260,
          overflow: "auto",
          textAlign: "left",
          fontSize: 13,
        }}
      >
        {JSON.stringify(state, null, 2)}
      </pre>
    );
  };
  // ------------------------------------------------------------

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 16,
        width: "100%",
      }}
    >
      {/* ---------- Left: Visualization + Controls ---------- */}
      <div
        style={{
          background: "  #cfd1ffff",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <h5 className="text-warning mb-3">⚡ Live Visualization</h5>
        {renderState()}

        <div className="d-flex align-items-center gap-2 mt-3">
          <button className="btn btn-outline-light" onClick={prev} disabled={idx === 0}>
            ← Prev
          </button>
          <button
            className="btn btn-warning"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={steps.length <= 1}
          >
            {isPlaying ? "⏸ Pause" : "▶️ Play"}
          </button>
          <button
            className="btn btn-outline-light"
            onClick={next}
            disabled={idx >= steps.length - 1}
          >
            Next →
          </button>

          <div className="ms-3">
            <label className="me-2">Speed</label>
            <input
              type="range"
              min="150"
              max="1500"
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
            />
          </div>

          <div className="ms-auto text-white-50">
            Step {steps.length ? idx + 1 : 0} / {steps.length || 0}
          </div>
        </div>

        {/* 🔍 Variables */}
        <div className="mt-3 p-2" style={{ background: "#1B245A", borderRadius: 6 }}>
          <h6 className="text-info">Variables</h6>
          <pre style={{ color: "#A7F3D0", marginBottom: 0, fontSize: 12 }}>
            {JSON.stringify(step?.vars ?? {}, null, 2)}
          </pre>
        </div>

        {/* 📜 Logs */}
        {runResult?.logs?.length > 0 && (
          <div className="mt-3 p-2" style={{ background: "#494b59ff", borderRadius: 6 }}>
            <h6 className="text-info">Logs</h6>
            <pre style={{ color: "#FDE68A", marginBottom: 0, fontSize: 12 }}>
              {runResult.logs.join("\n")}
            </pre>
          </div>
        )}

        {/* ❌ Error */}
        {runResult?.error && (
          <div className="mt-3 alert alert-danger">{String(runResult.error)}</div>
        )}
      </div>

      {/* ---------- Right: Pseudocode ---------- */}
      <div
        style={{
          background: "#494b59ff",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: 16,
          maxHeight: 560,
          overflow: "auto",
          textAlign: "left",
        }}
      >
        <h5 className="text-warning mb-3">Pseudocode</h5>
        <code style={{ whiteSpace: "pre-wrap" }}>
          {lines.map((ln, i) => {
            const active = Number(step?.meta?.line) === i + 1;
            return (
              <div
                key={i}
                style={{
                  background: active ? "#1B245A" : "transparent",
                  borderLeft: active ? "4px solid #facc15" : "4px solid transparent",
                  padding: "2px 8px",
                  borderRadius: 4,
                  marginBottom: 2,
                }}
              >
                <span style={{ opacity: 0.5, marginRight: 8 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{ln}</span>
              </div>
            );
          })}
        </code>
      </div>
    </div>
  );
}
