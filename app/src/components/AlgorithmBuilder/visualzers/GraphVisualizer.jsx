// src/components/AlgorithmBuilder/visualizers/GraphVisualizer.jsx
import React from "react";

const GraphVisualizer = ({ step }) => {
  if (!step || !step.nodes) return <p>No graph data</p>;
  const { nodes = [], visited = [] } = step;
  return (
    <div className="d-flex flex-wrap justify-content-center gap-2">
      {nodes.map((n) => (
        <div
          key={n}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            lineHeight: "50px",
            background: visited.includes(n) ? "#fbbf24" : "#1e293b",
            color: "white",
            textAlign: "center",
          }}
        >
          {n}
        </div>
      ))}
    </div>
  );
};

export default GraphVisualizer;
