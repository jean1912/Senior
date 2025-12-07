// ================================
//  TreeViewSVG.jsx (UPDATED FOR RB + ROTATION)
// ================================
import React, { useMemo } from "react";
import { motion } from "framer-motion";

const TreeViewSVG = ({
  nodes = [],
  edges = [],
  steps = [],
  stepIndex = 0,
  width = 800,
  height = 450,
}) => {
  // --------- derive visited & current from steps ----------
  const { visitedSet, currentNode } = useMemo(() => {
    const v = new Set();
    let current = null;

    if (Array.isArray(steps) && steps.length > 0) {
      const idx = Math.min(stepIndex, steps.length - 1);

      for (let i = 0; i <= idx; i++) {
        const s = steps[i];
        if (!s) continue;

        // mark visited
        if (s.type === "visit" || s.type === "output") {
          if (s.node !== null && s.node !== undefined) {
            v.add(s.node);
          }
        }

        // mark current
        if (s.node !== null && s.node !== undefined) {
          current = s.node;
        }
      }
    }

    return { visitedSet: v, currentNode: current };
  }, [steps, stepIndex]);

  const isRBTree =
    Array.isArray(steps) &&
    steps.length > 0 &&
    steps[0].nodes &&
    Array.isArray(steps[0].nodes);

  const rotation = steps[stepIndex]?.rotation ?? null;
  const rotationNodeRaw = steps[stepIndex]?.current ?? null;
  const rotationNode =
    isRBTree && rotationNodeRaw != null
      ? String(rotationNodeRaw)
      : rotationNodeRaw;

  // 🧩 Use real nodes/edges from RB steps (for display only)
  let displayNodes = nodes;
  let displayEdges = edges;

  if (isRBTree) {
    const step = steps[stepIndex] || steps[steps.length - 1];
    if (step) {
      displayNodes = Array.isArray(step.nodes)
        ? step.nodes.map((n) => String(n.key))
        : [];
      displayEdges = Array.isArray(step.edges)
        ? step.edges.map(([a, b]) => [String(a), String(b)])
        : [];
    } else {
      displayNodes = [];
      displayEdges = [];
    }
  }

  // --------- layout tree from nodes & edges ----------
  const layout = useMemo(() => {
  const baseNodes = isRBTree ? displayNodes : nodes;
  const baseEdges = isRBTree ? displayEdges : edges;

  if (!baseNodes || baseNodes.length === 0)
    return { positions: {}, root: null };

  // build children map
  const childrenMap = new Map();
  baseNodes.forEach((n) => childrenMap.set(n, []));
  baseEdges.forEach(([parent, child]) => {
    if (!childrenMap.has(parent)) childrenMap.set(parent, []);
    childrenMap.get(parent).push(child);
  });

  // root = node that never appears as a child
  const childSet = new Set(baseEdges.map(([, c]) => c));
  const root = baseNodes.find((n) => !childSet.has(n)) ?? baseNodes[0];

  const levels = [];
  const visitedNodeSet = new Set();

  function dfs(node, depth) {
    if (!node || visitedNodeSet.has(node)) return;
    visitedNodeSet.add(node);

    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(node);

    const children = childrenMap.get(node) || [];
    children.forEach((c) => dfs(c, depth + 1));
  }

  dfs(root, 0);

  const positions = {};
  const maxDepth = levels.length - 1;

  levels.forEach((levelNodes, depth) => {
    const y =
      levels.length === 1
        ? height * 0.15
        : ((depth + 1) / (maxDepth + 3)) * height;

    const count = levelNodes.length;

    levelNodes.forEach((node, idx) => {
      const x =
        count === 1
          ? width / 2
          : ((idx + 1) / (count + 1)) * width;

      positions[node] = { x, y };
    });
  });

  return { positions, root };
}, [nodes, edges, displayNodes, displayEdges, width, height, isRBTree]);


  const { positions } = layout;

  // 🧩 RB-tree detector + rotation info
  

  if (!nodes || nodes.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        No tree data.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%", // fill wrapper
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        width="95%"               // responsive scale
        height="95%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: "block",
          borderRadius: "16px",
          background: "radial-gradient(circle at top, #cbceff, #cbceff)",
        }}
      >

        {/* Edges */}
        {displayEdges.map(([parent, child], idx) => {
          const pPos = positions[parent];
          const cPos = positions[child];
          if (!pPos || !cPos) return null;

          const isVisitedParent = visitedSet.has(parent);
          const isVisitedChild = visitedSet.has(child);

          const isRotated =
            rotation &&
            (parent === rotationNode || child === rotationNode);

          const strokeColor = isRotated
            ? "#facc15"      // bright yellow for rotation
            : (isVisitedParent || isVisitedChild
                ? "#ebf838ff"
                : "#6a6a6aff");

          const strokeW = isRotated
            ? 4
            : (isVisitedParent || isVisitedChild ? 3 : 2);

          const strokeOp = isRotated
            ? 1
            : (isVisitedParent || isVisitedChild ? 0.95 : 0.5);

          return (
            <motion.line
              key={idx}
              x1={pPos.x}
              y1={pPos.y}
              x2={cPos.x}
              y2={cPos.y}
              stroke={strokeColor}
              strokeWidth={strokeW}
              opacity={strokeOp}
              initial={{ pathLength: isRotated ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: isRotated ? 0.5 : 0 }}
            />
          );
        })}

        {/* 🔁 Rotation arrow */}
        {rotation && rotationNode && positions[rotationNode] && (
          <motion.path
            d={`M ${positions[rotationNode].x - 15} ${
              positions[rotationNode].y - 30
            }
                q 20 -20 40 0`}
            fill="transparent"
            stroke="#facc15"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ duration: 0.6 }}
            transform={
              rotation === "RIGHT"
                ? `scale(-1,1) translate(${-2 * positions[rotationNode].x}, 0)`
                : ""
            }
          />
        )}

        {/* Nodes */}
        {displayNodes.map((node) => {
          const pos = positions[node];
          if (!pos) return null;

          const isVisited = visitedSet.has(node);
          const isCurrent = isRBTree
            ? rotationNode === node
            : currentNode === node;

          // 🎨 RB-aware fill color
          let fill;

          if (isRBTree) {
            const step = steps[stepIndex] || steps[steps.length - 1];
            const nodeObj = step?.nodes?.find(
              (n) => String(n.key) === String(node)
            );
            const color = nodeObj?.color;

            if (color === "RED") fill = "#ff4d4d";      // 🔥 red node
            else fill = "#1e1e1e";                      // ⚫ black node

            if (isCurrent) fill = "#facc15";            // highlight current
          } else {
            fill = isCurrent
              ? "#f9d716ff" // current
              : isVisited
              ? "#6bffc4ff" // visited
              : "#032d41ff"; // unvisited
          }

          const r = isCurrent ? 18 : 14;

          return (
            <motion.g
              key={node}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{
                scale: isCurrent ? 1.2 : isVisited ? 1 : 0.95,
                opacity: 1,
                fillOpacity: rotationNode === node ? 0.6 : 1,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <circle cx={pos.x} cy={pos.y} r={r} fill={fill} />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize="12"
                fill="#5c6271ff"
                fontWeight="bold"
              >
                {node}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
};

export default TreeViewSVG;
