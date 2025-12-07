// ================================
// ArrayView.jsx
// Smart 1D array visualizer
// - Factorial Sequence
// - Ugly Numbers Sequence
// - Maximum Subarray (Kadane, sliding window)
// ================================
import React from "react";
import "./ArrayView.css";

const ArrayView = ({ algorithmName = "", steps = [], stepIndex = 0 }) => {
  const algo = (algorithmName || "").toLowerCase();

  if (!steps || steps.length === 0) {
    return (
      <div className="array-view-container">
        <p style={{ color: "#cbd5e1" }}>No steps to display.</p>
      </div>
    );
  }

  // Clamp step index to valid range
  const idx = Math.max(0, Math.min(stepIndex, steps.length - 1));
  const currentStep = steps[idx];

  let displayArray = [];
  let highlight = [];
  let highlightRange = null;
  let title = "";

  // -----------------------------
  // Factorial Sequence / Ugly Numbers
  // steps: [ [prefix1], [prefix2], ... ]
  // We show the FULL final array length, with blanks for future values.
  // -----------------------------
  if (algo.includes("factorial") || algo.includes("ugly")) {
    const finalSeq = steps[steps.length - 1] || [];
    const prefix = Array.isArray(currentStep) ? currentStep : [];
    const n = finalSeq.length;

    displayArray = new Array(n).fill("");

    for (let i = 0; i < prefix.length; i++) {
      displayArray[i] = prefix[i];
    }

    const lastIdx = Math.max(0, prefix.length - 1);

    highlightRange = { start: 0, end: lastIdx };
    highlight = [lastIdx];

    title = algo.includes("factorial")
      ? "Factorial sequence (building 1!, 2!, 3!, ...)"
      : "Ugly numbers sequence (building prefix)";
  }

  // -----------------------------
  // Maximum Subarray (Kadane)
  // steps: [
  //   {
  //     array: [...original],
  //     index: i,
  //     range: { start, end: i },      // current window
  //     bestRange: { start, end },     // best window so far
  //     currentSum,
  //     bestSum
  //   },
  //   ...
  // ]
  // -----------------------------
  else if (algo.includes("subarray") || algo.includes("kadane")) {
    const base = currentStep?.array || [];
    displayArray = base.slice();

    const range = currentStep.range;
    const bestRange = currentStep.bestRange;

    if (
      range &&
      typeof range.start === "number" &&
      typeof range.end === "number"
    ) {
      highlightRange = { start: range.start, end: range.end };
    }

    if (
      bestRange &&
      typeof bestRange.start === "number" &&
      typeof bestRange.end === "number"
    ) {
      const hi = [];
      for (let i = bestRange.start; i <= bestRange.end; i++) {
        if (i >= 0 && i < base.length) hi.push(i);
      }
      highlight = hi;
    }

    title = "Kadane’s Algorithm — sliding window on array";
  }

  // -----------------------------
  // Fallback: treat step as a simple array snapshot
  // -----------------------------
  else {
    const snap = Array.isArray(currentStep) ? currentStep : [];
    displayArray = snap.slice();

    const lastIdx = Math.max(0, displayArray.length - 1);
    highlight = [lastIdx];
    highlightRange = { start: 0, end: lastIdx };
    title = "Array state";
  }

  return (
    <div className="array-view-container">
      {title && <h4 className="array-title">{title}</h4>}

      {/* Index row */}
      <div className="array-index-row">
        {displayArray.map((_, i) => (
          <div key={`idx-${i}`} className="array-index">
            {i}
          </div>
        ))}
      </div>

      {/* Values row */}
      <div className="array-row">
        {displayArray.map((value, i) => {
          const isHighlighted = highlight.includes(i);
          const inRange =
            highlightRange &&
            i >= highlightRange.start &&
            i <= highlightRange.end;

          return (
            <div
              key={`cell-${i}`}
              className={`array-cell ${
                isHighlighted ? "highlight" : ""
              } ${inRange ? "range" : ""}`}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArrayView;
