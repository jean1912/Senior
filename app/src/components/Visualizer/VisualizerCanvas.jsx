import React, { useState, useEffect } from "react";
import { Button, ButtonGroup, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import GraphViewSVG from "./GraphViewSVG";
import { generateVisualization } from "../../services/VisualizerService";

// Utility: random generators
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateRandomArray = (size = 10, min = 1, max = 50) =>
  Array.from({ length: size }, () => rand(min, max));
const generateRandomGraph = (nodeCount = 5) => {
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

const VisualizerCanvas = ({ visualization, onBack }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputData, setInputData] = useState(null);

  // Fetch backend-generated steps
  useEffect(() => {
    fetchGenerated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualization]);

  const fetchGenerated = async () => {
    try {
      setLoading(true);
      let input;
      if (visualization.structureType === "Array")
        input = generateRandomArray(10, 1, 50);
      else if (visualization.structureType === "Graph")
        input = generateRandomGraph(6);
      else input = {};

      setInputData(input);

      const response = await generateVisualization(
        visualization.algorithm?.id,
        input
      );

      setGeneratedData(response.stateJson);
      setStepIndex(0);
      setIsPlaying(false);
    } catch (err) {
      console.error("❌ Visualization generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const steps = generatedData?.steps || [];
  const currentStep = steps[stepIndex] || [];

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
  const randomizeExample = async () => {
    await fetchGenerated();
  };

  if (loading)
    return (
      <div className="text-center my-5 text-white">
        <Spinner animation="border" /> <p>Generating visualization...</p>
      </div>
    );

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
        {steps.length === 0 ? (
          <p style={{ color: "#fbbf24" }}>No steps generated.</p>
        ) : visualization.structureType === "Array" ? (
          /* 🔢 Bubble / Merge Sort visualization */
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
              {Array.isArray(currentStep) &&
                currentStep.map((num, i) => (
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
        ) : (
          /* 🧠 Graph (DFS) visualization */
          <GraphViewSVG
            nodes={
              generatedData?.nodes ||
              Object.keys(generatedData?.input || inputData || {}) ||
              []
            }
            edges={generatedData?.edges || []}
            visitedOrder={
              Array.isArray(generatedData?.steps)
                ? generatedData.steps[stepIndex] || []
                : []
            }
            stepIndex={stepIndex}
            width={720}
            height={360}
          />
        )}
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
