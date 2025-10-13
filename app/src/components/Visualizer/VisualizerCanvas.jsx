// src/components/Visualizer/VisualizerCanvas.jsx
import React, { useState, useEffect } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import GraphViewSVG from "./GraphViewSVG";

// Utility: random integer in range
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Utility: generate random array
const generateRandomArray = (size = 10, min = 1, max = 50) =>
  Array.from({ length: size }, () => rand(min, max));

// 🧠 Generate a random graph + true DFS traversal + target node
const generateRandomGraphWithDFS = (nodeCount = 6) => {
  const nodes = Array.from({ length: nodeCount }, (_, i) =>
    String.fromCharCode(65 + i)
  ); // ["A", "B", "C", ...]

  // Random undirected edges
  const edges = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < 0.35) edges.push([nodes[i], nodes[j]]);
    }
  }

  // Convert edges into adjacency list
  const adjList = new Map(nodes.map((n) => [n, []]));
  edges.forEach(([u, v]) => {
    adjList.get(u).push(v);
    adjList.get(v).push(u);
  });

  // DFS traversal
  const visitedOrder = [];
  const visited = new Set();

  const dfs = (node) => {
    visited.add(node);
    visitedOrder.push(node);
    const neighbors = adjList.get(node).sort();
    for (const next of neighbors) {
      if (!visited.has(next)) dfs(next);
    }
  };

  const startNode = nodes[rand(0, nodes.length - 1)];
  const targetNode = nodes[rand(0, nodes.length - 1)];
  dfs(startNode);

  return { nodes, edges, visitedOrder, startNode, targetNode };
};

// Utility: simulate sorting/search steps
const simulateArraySteps = (arr, algoName) => {
  const steps = [];
  let copy = [...arr];

  if (algoName.toLowerCase().includes("bubble")) {
    for (let i = 0; i < copy.length - 1; i++) {
      for (let j = 0; j < copy.length - i - 1; j++) {
        if (copy[j] > copy[j + 1]) {
          [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
          steps.push([...copy]);
        }
      }
    }
  } else if (algoName.toLowerCase().includes("binary")) {
    copy.sort((a, b) => a - b);
    let low = 0;
    let high = copy.length - 1;
    const target = copy[rand(0, copy.length - 1)];
    steps.push([...copy]);
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      steps.push({ low, high, mid, target, array: [...copy] });
      if (copy[mid] === target) break;
      if (copy[mid] < target) low = mid + 1;
      else high = mid - 1;
    }
  }

  return steps;
};

const VisualizerCanvas = ({ visualization, onBack }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [randomData, setRandomData] = useState(null);

  // Generate random dataset based on visualization type
  useEffect(() => {
    randomizeExample();
  }, [visualization]);

  const randomizeExample = () => {
    if (visualization.structureType === "Array") {
      const arr = generateRandomArray(12, 1, 40);
      const steps = simulateArraySteps(arr, visualization.name);
      setRandomData({ steps });
      setStepIndex(0);
      setIsPlaying(false);
    } else if (visualization.structureType === "Graph") {
      const graph = generateRandomGraphWithDFS(6);
      setRandomData(graph);
      setStepIndex(0);
      setIsPlaying(false);
    }
  };

  // Determine steps
  const steps =
    randomData?.steps ||
    visualization.stateJson?.steps ||
    visualization.stateJson?.visitedOrder ||
    [];

  const currentStep =
    steps[stepIndex] ||
    randomData?.initial ||
    visualization.stateJson.initial ||
    visualization.stateJson.arr ||
    [];

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 700);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, steps.length]);

  const nextStep = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };
  const prevStep = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };
  const togglePlay = () => setIsPlaying((p) => !p);

  return (
    <div className="text-center">
      <Button variant="secondary" className="mb-3" onClick={onBack}>
        ← Back
      </Button>

      <h3 className="fw-bold">{visualization.title}</h3>
      <p className="text-muted">{visualization.description}</p>

      <div
        className="mx-auto my-4 p-4 border rounded shadow-sm"
        style={{
          width: "80%",
          minHeight: "260px",
          background: "#1A1F71",
          color: "white",
          position: "relative",
        }}
      >
        {(() => {
          // 🟦 ARRAY visualization
          if (visualization.structureType === "Array") {
            if (Array.isArray(currentStep)) {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    height: "200px",
                    gap: "6px",
                  }}
                >
                  <AnimatePresence>
                    {currentStep.map((num, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 12,
                        }}
                        style={{
                          width: "25px",
                          height: `${num * 5}px`,
                          background:
                            i === stepIndex % currentStep.length
                              ? "#facc15"
                              : "#fbbf24",
                          borderRadius: "4px",
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
            } else if (currentStep && typeof currentStep === "object") {
              return (
                <pre
                  style={{
                    color: "#fbbf24",
                    textAlign: "left",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                >
                  {JSON.stringify(currentStep, null, 2)}
                </pre>
              );
            }
            return <p>No valid array data to render.</p>;
          }

          // 🟩 GRAPH visualization (real DFS traversal)
          if (visualization.structureType === "Graph") {
            const nodes =
              randomData?.nodes || visualization.stateJson?.nodes || [];
            const edges =
              randomData?.edges || visualization.stateJson?.edges || [];
            const visitedOrder =
              randomData?.visitedOrder ||
              visualization.stateJson?.visitedOrder ||
              [];

            return (
              <div style={{ width: "100%", height: 360 }}>
                <GraphViewSVG
                  nodes={nodes}
                  edges={edges}
                  visitedOrder={visitedOrder}
                  startNode={randomData?.startNode}
                  targetNode={randomData?.targetNode}
                  stepIndex={stepIndex}
                  width={720}
                  height={360}
                />
              </div>
            );
          }

          return (
            <p style={{ color: "#fbbf24" }}>
              ❓ Unknown visualization type: {visualization.structureType}
            </p>
          );
        })()}
      </div>

      {/* Controls */}
      <ButtonGroup className="mt-3">
        <Button
          variant="outline-light"
          onClick={prevStep}
          disabled={stepIndex === 0}
        >
          ← Prev
        </Button>
        <Button variant="warning" onClick={togglePlay}>
          {isPlaying ? "⏸ Pause" : "▶️ Play"}
        </Button>
        <Button
          variant="outline-light"
          onClick={nextStep}
          disabled={stepIndex >= steps.length - 1}
        >
          Next →
        </Button>
      </ButtonGroup>

      {/* Randomizer */}
      <div className="mt-3">
        <Button variant="info" onClick={randomizeExample}>
          🔀 Randomize Data
        </Button>
      </div>

      <p className="mt-2 text-white-50">
        Step {stepIndex + 1} / {steps.length || 1}
      </p>
    </div>
  );
};

export default VisualizerCanvas;
