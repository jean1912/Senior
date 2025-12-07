// src/components/AlgorithmBuilder/visualizers/SearchingVisualizer.jsx
import React from "react";

const SearchingVisualizer = ({ step }) => {
  if (!step) return null;
  const { arr = [], target, index, foundAt } = step;

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
};

export default SearchingVisualizer;
