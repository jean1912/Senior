// src/components/Visualizer/GraphViewSVG.jsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GraphViewSVG = ({
  nodes = [],
  edges = [],
  visitedOrder = [],
  stepIndex = 0,
  startNode = null,
  targetNode = null,
  width = 720,
  height = 420,
}) => {
  // Layout nodes in a circle
  const { positions, nodeIndex } = useMemo(() => {
    const R = Math.min(width, height) * 0.35;
    const cx = width / 2;
    const cy = height / 2;
    const idxMap = new Map(nodes.map((n, i) => [n, i]));
    const pos = new Map(
      nodes.map((n, i) => {
        const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1);
        return [
          n,
          {
            x: cx + R * Math.cos(angle),
            y: cy + R * Math.sin(angle),
          },
        ];
      })
    );
    return { positions: pos, nodeIndex: idxMap };
  }, [nodes, width, height]);

  // Keep track of traversed edges
  const traversedEdges = useMemo(() => {
    const set = new Set();
    for (let i = 1; i <= stepIndex && i < visitedOrder.length; i++) {
      const a = visitedOrder[i - 1];
      const b = visitedOrder[i];
      set.add(`${a}__${b}`);
      set.add(`${b}__${a}`);
    }
    return set;
  }, [visitedOrder, stepIndex]);

  const edgeKey = (u, v) => `${u}__${v}`;

  return (
    <div style={{ textAlign: "center" }}>
      {/* Display DFS status info */}
      <div className="mb-3 text-white">
        <h5>
          🧭 DFS Starting at:{" "}
          <span style={{ color: "#34D399" }}>{startNode || "?"}</span>{" "}
          &nbsp; | &nbsp; 🎯 Target:{" "}
          <span style={{ color: "#F87171" }}>{targetNode || "?"}</span>
        </h5>
      </div>

      {/* Graph visualization */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        {/* Subtle background */}
        <defs>
          <pattern
            id="grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Edges */}
        {edges.map(([u, v], i) => {
          const pu = positions.get(u);
          const pv = positions.get(v);
          if (!pu || !pv) return null;

          const isActive = traversedEdges.has(edgeKey(u, v));

          return (
            <g key={`edge-${u}-${v}-${i}`}>
              {/* Base line */}
              <motion.line
                x1={pu.x}
                y1={pu.y}
                x2={pv.x}
                y2={pv.y}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              {/* Animated active edge */}
              <AnimatePresence>
                {isActive && (
                  <motion.line
                    key={`active-${u}-${v}`}
                    x1={pu.x}
                    y1={pu.y}
                    x2={pv.x}
                    y2={pv.y}
                    stroke="#facc15"
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    filter="url(#glow)"
                  />
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* Glow effect */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Nodes */}
        {nodes.map((n) => {
          const p = positions.get(n);
          if (!p) return null;

          const visitedUpTo = visitedOrder.slice(0, stepIndex + 1);
          const isVisited = visitedUpTo.includes(n);
          const isCurrent = visitedOrder[stepIndex] === n;
          const isTarget = n === targetNode;
          const isStart = n === startNode;

          // Node color logic
          let fillColor = "#fff";
          if (isCurrent) fillColor = "#fbbf24"; // active
          else if (isTarget) fillColor = "#ef4444"; // red
          else if (isVisited) fillColor = "#34D399"; // green
          else if (isStart) fillColor = "#60A5FA"; // blue (start)

          return (
            <g key={`node-${n}`}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isCurrent ? 22 : 16}
                fill={fillColor}
                stroke={isCurrent ? "#FDE68A" : "rgba(0,0,0,0.25)"}
                strokeWidth={isCurrent ? 3 : 1}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 140, damping: 12 }}
                filter={isCurrent || isTarget ? "url(#glow)" : "none"}
              />
              <motion.text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                fill="#111827"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {n}
              </motion.text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default GraphViewSVG;
