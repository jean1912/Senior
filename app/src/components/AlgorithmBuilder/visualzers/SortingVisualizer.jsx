// src/components/AlgorithmBuilder/visualizers/SortingVisualizer.jsx
import React from "react";
import { motion } from "framer-motion";

const SortingVisualizer = ({ step }) => {
  if (!step?.arr && !Array.isArray(step)) return null;
  const arr = step.arr || step;

  const max = Math.max(...arr);
  return (
    <div className="d-flex align-items-end justify-content-center gap-1" style={{ height: 200 }}>
      {arr.map((v, i) => (
        <motion.div
          key={i}
          layout
          initial={{ height: 0 }}
          animate={{ height: (v / max) * 180 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 20,
            backgroundColor: "#fbbf24",
            borderRadius: 4,
          }}
          title={v}
        />
      ))}
    </div>
  );
};

export default SortingVisualizer;
