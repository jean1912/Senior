import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GraphViewSVG = ({
  nodes = [],
  edges = [],
  treeEdges = [],
  visitedOrder = [],
  shortestPath = [],     // ⬅ ADDED
  stepIndex = 0,
  startNode = null,
  targetNode = null,
  width = 720,
  height = 420,
}) => {

  // ============================
  //  POSITION LAYOUT
  // ============================
  const { positions } = useMemo(() => {
    const R = Math.min(width, height) * 0.35;
    const cx = width / 2;
    const cy = height / 2;

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

    const topY = cy - R;
    const leftTopX = cx - R * 0.7;
    const rightTopX = cx + R * 0.7;

    if (startNode && pos.has(startNode)) {
      pos.set(startNode, { x: leftTopX, y: topY });
    }
    if (targetNode && pos.has(targetNode)) {
      const same = startNode === targetNode;
      pos.set(targetNode, { x: same ? cx + 8 : rightTopX, y: topY });
    }

    return { positions: pos };
  }, [nodes, width, height, startNode, targetNode]);

  // ============================
  //  SHORTEST PATH EDGE SET
  // ============================
  const shortestPathEdges = useMemo(() => {
    const set = new Set();
    if (Array.isArray(shortestPath) && shortestPath.length > 1) {
      for (let i = 1; i < shortestPath.length; i++) {
        const a = shortestPath[i - 1];
        const b = shortestPath[i];
        set.add(`${a}__${b}`);
        set.add(`${b}__${a}`);
      }
    }
    return set;
  }, [shortestPath]);

  // ============================
  //  TRAVERSED TREE EDGES
  // ============================
  const traversedEdges = useMemo(() => {
    const set = new Set();
    const slice = treeEdges?.slice(0, stepIndex) || [];
    for (const [u, v] of slice) {
      set.add(`${u}__${v}`);
    }
    return set;
  }, [treeEdges, stepIndex]);

  const edgeKey = (u, v) => `${u}__${v}`;

  // ============================
  //  RENDER
  // ============================
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        width="95%"
        height="95%"
        style={{ display: "block" }}
      >
        <rect width={width} height={height} fill="rgba(255,255,255,0.05)" />

        {/* =======================
            EDGES + WEIGHTS
        ======================= */}
        {edges.map((edge, i) => {
          const [u, v, w] = edge; // w may be undefined (DFS/BFS)
          const pu = positions.get(u);
          const pv = positions.get(v);
          if (!pu || !pv) return null;

          const isActive = traversedEdges.has(edgeKey(u, v));
          const inShortest = shortestPathEdges.has(edgeKey(u, v));

          const mx = (pu.x + pv.x) / 2;
          const my = (pu.y + pv.y) / 2;

          return (
            <g key={`edge-${u}-${v}-${i}`}>

              {/* base edge */}
              <motion.line
                x1={pu.x}
                y1={pu.y}
                x2={pv.x}
                y2={pv.y}
                stroke={inShortest ? "#ef4444" : "rgba(255,255,255,0.25)"}
                strokeWidth={inShortest ? 4 : 2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* animated DFS/BFS/Dijkstra relax edge */}
              <AnimatePresence>
                {isActive && (
                  <motion.line
                    key={`active-${u}-${v}-${stepIndex}`}
                    x1={pu.x}
                    y1={pu.y}
                    x2={pv.x}
                    y2={pv.y}
                    stroke="#facc15"
                    strokeWidth={6}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>

              {/* weight label */}
              {w !== undefined && (
                <>
                  <motion.circle
                    cx={mx}
                    cy={my}
                    r={11}
                    fill="#0f172a"
                    stroke="rgba(148,163,184,0.9)"
                    strokeWidth={1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.text
                    x={mx}
                    y={my + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="#e5e7eb"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {w}
                  </motion.text>
                </>
              )}
            </g>
          );
        })}

        {/* =======================
            NODES
        ======================= */}
        {nodes.map((n) => {
          const p = positions.get(n);
          if (!p) return null;

          const visitedUpTo = visitedOrder.slice(0, stepIndex + 1);
          const isVisited = visitedUpTo.includes(n);
          const isCurrent = visitedOrder[stepIndex] === n;

          let fillColor = "#fff";
          if (n === startNode) fillColor = "#3B82F6";
          else if (n === targetNode) fillColor = "#EF4444";
          else if (isCurrent) fillColor = "#FBBF24";
          else if (isVisited) fillColor = "#34D399";

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
