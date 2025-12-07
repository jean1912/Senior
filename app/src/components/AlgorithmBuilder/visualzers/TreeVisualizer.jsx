// src/components/AlgorithmBuilder/visualizers/TreeVisualizer.jsx
import React from "react";

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

const TreeVisualizer = ({ step }) => {
  if (!step?.tree) return <p>No tree data</p>;
  return <div className="tree-container">{renderNode(step.tree)}</div>;
};

export default TreeVisualizer;
