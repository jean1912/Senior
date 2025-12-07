import React, { useEffect, useState, useRef } from "react";
import "./MergeSortVisualizer.css";

export default function MergeSortVisualizer({ steps = [], playing, speed }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setIndex((i) => Math.min(i + 1, steps.length - 1));
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, steps.length]);

  const step = steps[index] || {};
  const left = step.left || [];
  const right = step.right || [];
  const merged = step.merged || [];

  // ✅ Capture the "initial" array from backend
  const initialArray =
    steps.find((s) => s.initial)?.initial ||
    (steps.length > 0
      ? [...(steps[0].left || []), ...(steps[0].right || [])]
      : []);

  return (
    <div className="merge-container">
      <h3 className="merge-title">
        Merge Sort Step {index + 1}/{steps.length}
      </h3>

      {/* 🟨 Initial Unsorted Array */}
      {initialArray.length > 0 && (
        <div className="merge-row top-array">
          {initialArray.map((n, i) => (
            <div key={`init${i}`} className="merge-cell initial">
              {n}
            </div>
          ))}
        </div>
      )}

      {/* 🟦 Left + Right Subarrays */}
      <div className="merge-row">
        {left.map((n, i) => (
          <div key={`l${i}`} className="merge-cell left">
            {n}
          </div>
        ))}
        <div style={{ width: "20px" }}></div>
        {right.map((n, i) => (
          <div key={`r${i}`} className="merge-cell right">
            {n}
          </div>
        ))}
      </div>

      {/* 🟩 Merged Result */}
      <div className="merge-row">
        {merged.map((n, i) => (
          <div key={`m${i}`} className="merge-cell merged">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
