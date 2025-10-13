// src/components/DemoVisualizer.jsx
import React, { useState, useEffect, useRef } from "react";

function DemoVisualizer({ ariaLiveId }) {
  const [arr, setArr] = useState(randomArray(8, 20, 90));
  const [trace, setTrace] = useState([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const timerRef = useRef(null);
  const [highlight, setHighlight] = useState([]);
  const ariaRef = useRef(null);

  // init trace on mount or when arr changes
  useEffect(() => {
    const t = bubbleSortTrace(arr);
    setTrace(t);
    setStep(0);
    setHighlight([]);
    // announce
    if (ariaRef.current) ariaRef.current.textContent = `Demo initialized with ${arr.length} elements. Press play to start.`;
    // stop any timer
    clearInterval(timerRef.current);
    setPlaying(false);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* nothing - keep trace until regenerate */]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        stepForward();
      } else if (e.key === "ArrowLeft") {
        stepBack();
      } else if (e.key === "r") {
        regenerate();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s + 1 >= trace.length) {
            clearInterval(timerRef.current);
            setPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speed, trace.length]);

  // update highlighting & current array from step
  useEffect(() => {
    if (!trace || trace.length === 0) return;
    const snap = trace[Math.max(0, Math.min(step, trace.length - 1))];
    if (!snap) return;
    setArr(snap.array.slice()); // set display array
    setHighlight(snap.highlight || []);
    if (ariaRef.current) ariaRef.current.textContent = snap.announce || `Step ${step+1} of ${trace.length}`;
  }, [step, trace]);

  function togglePlay() {
    setPlaying((p) => !p);
  }
  function stepForward() {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, Math.max(0, trace.length - 1)));
  }
  function stepBack() {
    setPlaying(false);
    setStep((s) => Math.max(0, s - 1));
  }
  function regenerate() {
    const a = randomArray(8, 10, 90);
    const t = bubbleSortTrace(a);
    setTrace(t);
    setStep(0);
    setArr(a);
    setHighlight([]);
    if (ariaRef.current) ariaRef.current.textContent = `New random array generated.`;
  }

  function downloadTrace() {
    const payload = { trace, initial: trace[0]?.array || arr, generated_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bubblesort_trace_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // accessible status region
  return (
    <>
      <div className="mb-2 d-flex justify-content-between align-items-center">
        <div>
          <strong>Array:</strong>
          <button className="btn btn-sm btn-link ms-2" onClick={regenerate}>Regenerate (r)</button>
        </div>
        <div>
          <button className="btn btn-sm btn-outline-primary me-2" onClick={togglePlay} aria-pressed={playing}>
            {playing ? "Pause" : "Play"}
          </button>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={stepBack} aria-label="Step back">←</button>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={stepForward} aria-label="Step forward">→</button>
          <button className="btn btn-sm btn-outline-success" onClick={downloadTrace}>Export Trace</button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="bars" aria-hidden="false" role="img" aria-label="Demo array visualization">
            {arr.map((v, i) => {
              const isCompare = highlight.includes(i);
              return (
                <div
                  key={i}
                  className={`bar ${isCompare ? "compare" : ""}`}
                  style={{ height: `${Math.max(12, v)}%`, minWidth: 10 }}
                  role="img"
                  aria-label={`Index ${i}, value ${v}`}
                >
                  <small style={{ padding: "4px" }}>{v}</small>
                </div>
              );
            })}
          </div>

          <div className="mt-3 d-flex align-items-center gap-3">
            <label className="small-muted me-2">Speed</label>
            <input
              type="range"
              min="120"
              max="1200"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label="Animation speed"
            />
            <span className="small-muted"> {Math.round(1200 - speed + 120) } ms/step (lower = faster)</span>
          </div>

          {/* Accessibility live region */}
          <div id={ariaLiveId} ref={ariaRef} role="status" aria-live="polite" className="sr-only" />
          <div className="mt-2 small-muted">Keyboard: <kbd>Space</kbd> Play/Pause • <kbd>←</kbd> Step back • <kbd>→</kbd> Step forward • <kbd>r</kbd> Regenerate</div>
        </div>
      </div>
    </>
  );
}

/* ----------------------
   Helper functions
   - bubbleSortTrace returns array of snapshots { array:[], highlight:[], announce:"" }
   -----------------------*/
function bubbleSortTrace(input) {
  const a = input.slice();
  const n = a.length;
  const snaps = [];
  snaps.push({ array: a.slice(), highlight: [], announce: `initial array with ${n} elements` });

  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      snaps.push({ array: a.slice(), highlight: [j, j + 1], announce: `Comparing indices ${j} and ${j + 1}` });
      if (a[j] > a[j + 1]) {
        // swap
        const tmp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tmp;
        swapped = true;
        snaps.push({ array: a.slice(), highlight: [j, j + 1], announce: `Swapped indices ${j} and ${j + 1}` });
      }
    }
    if (!swapped) {
      snaps.push({ array: a.slice(), highlight: [], announce: `Array is sorted early at pass ${i}` });
      break;
    }
  }
  snaps.push({ array: a.slice(), highlight: [], announce: `Completed. Sorted array.` });
  return snaps;
}

function randomArray(len = 8, min = 10, max = 90) {
  const out = [];
  for (let i = 0; i < len; i++) out.push(Math.floor(Math.random() * (max - min)) + min);
  return out;
}

export default DemoVisualizer;
