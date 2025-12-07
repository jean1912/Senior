import React, { useEffect, useState } from "react";
import { getAllAlgorithms, generateVisualization } from "../../services/VisualizerService";
import {
  updateAlgorithm,
  createAlgorithm,
  listTemplates,
  getTemplate,
  listBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
} from "../../services/AlgorithmBuilderService";
import UserService from "../../services/UserService";
import { transpile } from "../../engine/compiler";       
import { runInSandbox } from "../../engine/runtime";    
import RuntimePanel from "./RuntimePanel";
import AlgorithmCanvas from "./AlgorithmCanvas";
import BlockEditorModal from "./BlockEditorModal";
import "./AlgorithmBuilder.css";
import Editor from "@monaco-editor/react";

import { setupMonacoLinting } from "../../monaco-eslint-setup";
import { reviewCode } from "../../services/ai";

  
/* ------------------------------------------------------------------ */
/* 1️⃣ ADD: Static validator — EXACTLY as you requested                */
/* ------------------------------------------------------------------ */
function validateAlgorithmCode(code = "", category = "") {
  const issues = [];
  const lower = code.toLowerCase();
  const hasStep = code.includes("api.step(");
  const hasCompare = code.includes("api.compare(");
  const hasSwap = code.includes("api.swap(");
  const hasSetVarTarget =
    code.includes(`api.setVar("target"`) || code.includes(`api.setVar('target'`);
  const hasHighlight = code.includes("highlight");
  const hasVars = code.includes("vars:");
  const hasArrClone = code.includes("arr: [...");

  if (!hasStep) {
    issues.push("No api.step(...) calls found — the visualizer will have almost no animation.");
  }

  if (hasStep && !hasArrClone && category === "Sorting") {
    issues.push("You are using api.step(...) but no 'arr: [...arr]' was detected — always clone arrays in steps to get reliable animations.");
  }

  if (hasStep && !hasVars) {
    issues.push("api.step(...) is used but no 'vars: { ... }' object was found — put your loop/index variables inside vars.");
  }

  if (category === "Sorting" && !hasCompare) {
    issues.push("Sorting algorithm without api.compare(...) — comparisons will not be counted in metrics.");
  }
  if (category === "Sorting" && !hasSwap) {
    issues.push("Sorting algorithm without api.swap(...) — swaps will not be animated or counted in metrics.");
  }

  if (category === "Searching") {
    if (!hasSetVarTarget) {
      issues.push("Searching algorithm without api.setVar('target', ...) — the UI will not know what value you are looking for.");
    }
    if (hasStep && !hasHighlight) {
      issues.push("Searching algorithm uses api.step(...) but no 'highlight' was found — consider adding highlight: [index] to show which element is being inspected.");
    }
  }

  if (hasSwap && !hasArrClone) {
    issues.push("api.swap(...) is used but no 'arr: [...arr]' in steps — animations may look glitchy if the array is not cloned in api.step.");
  }

  return issues;
}


/* ------------------------------------------------------------------ */

const AlgorithmBuilder = () => {
  const [algorithms, setAlgorithms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showAlgoModal, setShowAlgoModal] = useState(false);

  const [editingBlock, setEditingBlock] = useState(null);
  const [blocks, setBlocks] = useState([]);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [newAlgo, setNewAlgo] = useState({
    name: "",
    category: "Other",
    complexity: "O(1)",
  });

  const [customInput, setCustomInput] = useState("[5, 2, 9, 1, 3]");
  const [serverOutput, setServerOutput] = useState(null);
  const [localRunResult, setLocalRunResult] = useState(null);

  // 2️⃣ ADD: Store validation messages
  const [validationIssues, setValidationIssues] = useState([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");


  /* ------------------ Init ------------------ */
  useEffect(() => {
    async function init() {
      try {
        const [algosRes, userRes, tpls] = await Promise.all([
          getAllAlgorithms(),
          UserService.getProfile().catch(() => null),
          listTemplates().catch(() => []),
        ]);
        setAlgorithms(algosRes);
        setCurrentUser(userRes);
        setTemplates(tpls);

        if (algosRes.length > 0) {
          setSelected(algosRes[0]);
          const bs = await listBlocks(algosRes[0].id).catch(() => []);
          setBlocks(bs);
        }
      } catch (err) {
        console.error("❌ init error:", err);
      }
    }
    init();
  }, []);


  /* ------------------------------------------------------------------ */
  /* 3️⃣ ADD: Revalidate when selected algorithm changes                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (selected?.code) {
      setValidationIssues(
        validateAlgorithmCode(selected.code, selected.category || "")
      );
    } else {
      setValidationIssues([]);
    }
  }, [selected]);
  /* ------------------------------------------------------------------ */


  const isEditable =
    selected &&
    currentUser &&
    selected.createdBy &&
    selected.createdBy.id === currentUser.id;

  const reloadBlocks = async (algorithmId) => {
    const bs = await listBlocks(algorithmId).catch(() => []);
    setBlocks(bs);
  };

  const handleSelectAlgo = async (algo) => {
    setSelected(algo);
    setServerOutput(null);
    setLocalRunResult(null);
    await reloadBlocks(algo.id);
  };

  /* ------------------ Save & Create ------------------ */
  const handleSave = async (algo) => {
    try {
      await updateAlgorithm(algo.id, {
        pseudocode: algo.pseudocode,
        code: algo.code,
        visualFlow: algo.visualFlow ?? null,
      });
      alert("✅ Algorithm saved.");
    } catch (err) {
      console.error(err);
      alert("Error saving algorithm.");
    }
  };

  const handleCreate = async () => {
    try {
      const created = await createAlgorithm({
        name: newAlgo.name,
        category: newAlgo.category,
        complexity: newAlgo.complexity,
        description: "User-created algorithm.",
      });
      setAlgorithms([created, ...algorithms]);
      setSelected(created);
      setShowAlgoModal(false);
      setNewAlgo({ name: "", category: "Other", complexity: "O(1)" });
      alert("🎉 Created new algorithm.");
    } catch (err) {
      console.error(err);
      alert("Error creating algorithm.");
    }
  };

  /* ------------------ Server Run ------------------ */
  const handleServerVisualize = async (id) => {
    try {
      const parsed = JSON.parse(customInput);
      const response = await generateVisualization(id, parsed);
      setServerOutput(response.stateJson);
      setLocalRunResult(null);
    } catch (err) {
      console.error("❌ server visualize:", err);
      alert("Invalid input or generation failed.");
    }
  };


  /* ------------------ Local Run ------------------ */
  /* 6️⃣ ADD: warn on validation before running */
  const handleLocalRun = () => {
    if (!selected?.code) {
      alert("No JavaScript code found for this algorithm.");
      return;
    }

    const issues = validateAlgorithmCode(selected.code, selected.category || "");
    if (issues.length > 0) {
      console.warn("Validation issues:", issues);
    }

    try {
      const parsed = JSON.parse(customInput);
      const compiled = transpile(selected.code);
      const result = runInSandbox(compiled, parsed, {
        maxSteps: 2000,
        timeLimitMs: 4000,
      });

      setLocalRunResult(result);
      setServerOutput(null);
    } catch (err) {
      console.error("❌ local run:", err);
      alert("Compilation or input error: " + err.message);
    }
  };


  /* ------------------ Blocks ------------------ */
  const openAddBlock = () => {
    setEditingBlock(null);
    setShowBlockModal(true);
  };
  const openEditBlock = (b) => {
    setEditingBlock(b);
    setShowBlockModal(true);
  };

  const handleSaveBlock = async (payload) => {
    try {
      if (payload.id) await updateBlock(payload.id, payload);
      else await createBlock(payload);
      await reloadBlocks(selected.id);
      setShowBlockModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving block.");
    }
  };

  const handleReorder = async (block, dir) => {
    const delta = dir === "up" ? -1 : 1;
    await updateBlock(block.id, {
      order: Math.max(0, (block.order ?? 0) + delta),
    });
    await reloadBlocks(selected.id);
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm("Delete this block?")) return;
    await deleteBlock(id);
    await reloadBlocks(selected.id);
  };

  /* ------------------ Templates ------------------ */
  const applyTemplate = async (tplId) => {
    try {
      const tpl = await getTemplate(tplId);
      if (!selected) return;
      const updated = {
        ...selected,
        pseudocode: tpl.pseudocode,
        code: tpl.starterCode,
        visualFlow: tpl.visualFlow ?? null,
      };
      setSelected(updated);
      alert("🧩 Template applied (not yet saved). Click Save to persist.");
    } catch (err) {
      console.error(err);
      alert("Failed to load template.");
    }
  };

  /* ------------------ AI Review ------------------ */
  const handleOpenReviewModal = async () => {
    if (!selected?.code) {
      alert("There is no code to review for this algorithm.");
      return;
    }

    setShowReviewModal(true);
    setReviewLoading(true);
    setReviewText("");

    try {
      const algoType = selected.category || "";
      const ctx = `Algorithm: ${selected.name}`;
      const review = await reviewCode(selected.code, "", algoType, ctx);
      setReviewText(review);
    } catch (err) {
      console.error("❌ AI review error:", err);
      setReviewText("Failed to get AI review. " + (err?.message ? `\n\nDetails: ${err.message}` : ""));
    } finally {
      setReviewLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="builder-container">
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <h4 className="sidebar-title">Algorithms</h4>
        <button className="btn btn-success w-100 mb-3" onClick={openAddBlock}>
          + New Block
        </button>
        <button
          className="btn btn-primary w-100 mb-3"
          onClick={() => setShowAlgoModal(true)}
        >
          + New Algorithm
        </button>

        <ul className="algorithm-list">
          {algorithms.map((algo) => (
            <li
              key={algo.id}
              className={`algorithm-item ${selected?.id === algo.id ? "active" : ""}`}
              onClick={() => handleSelectAlgo(algo)}
            >
              <span className="algo-name">{algo.name}</span>
              <span className="algo-category">{algo.category}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* MAIN STAGE */}
      <div className="builder-stage">
        {selected ? (
          <>
            <h3 className="builder-title">{selected.name}</h3>
            <p><strong>Category:</strong> {selected.category}</p>
            <p><strong>Complexity:</strong> {selected.complexity}</p>
            <p className="text-muted">
              <strong>Created By:</strong>{" "}
              {selected.createdBy
                ? `${selected.createdBy.firstName} ${selected.createdBy.lastName} (${selected.createdBy.email})`
                : "System Algorithm"}
            </p>

            {/* Templates */}
            <div className="mb-3">
              <label className="form-label text-white-50">Apply Template:</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  value={selectedTemplate ?? ""}
                >
                  <option value="">-- choose --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                  ))}
                </select>

                <button
                  className="btn btn-outline-info"
                  disabled={!selectedTemplate}
                  onClick={() => applyTemplate(Number(selectedTemplate))}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Blocks Canvas */}
            <AlgorithmCanvas
              blocks={blocks}
              onSelect={(b) => openEditBlock(b)}
              onReorder={handleReorder}
            />

            {blocks.length > 0 && (
              <div className="mt-2">
                {blocks.map((b) => (
                  <button
                    key={b.id}
                    className="btn btn-sm btn-outline-danger me-2 mt-2"
                    onClick={() => handleDeleteBlock(b.id)}
                  >
                    Delete “{b.name}”
                  </button>
                ))}
              </div>
            )}

            {/* Editors */}
            <div className="editable-sections">
              
              {/* Pseudocode */}
              <div>
                <h6>Pseudocode:</h6>
                <textarea
                  className="code-editor"
                  value={selected.pseudocode || ""}
                  onChange={(e) =>
                    isEditable &&
                    setSelected({ ...selected, pseudocode: e.target.value })
                  }
                  disabled={!isEditable}
                />
              </div>

              {/* CODE EDITOR */}
              <div>
                <h6>JavaScript Code (any valid code with main(input, api)):</h6>

                <Editor
                  height="300px"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={selected.code || ""}

                  /* -------------------------------------------------------- */
                  /* 4️⃣ ADD: validator inside onChange — EXACTLY as requested */
                  /* -------------------------------------------------------- */
                  onChange={(v) => {
                    if (!isEditable) return;
                    const code = v || "";
                    setSelected({ ...selected, code });
                    setValidationIssues(
                      validateAlgorithmCode(code, selected.category || "")
                    );
                  }}
                  /* -------------------------------------------------------- */

                  onMount={(editor, monaco) => {
                    if (isEditable) setupMonacoLinting(monaco, editor);
                  }}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    readOnly: !isEditable,
                  }}
                />

                {/* Helper Text */}
                <small className="text-black-50">
                  You can now write <strong>any modern JS</strong> — ES6+, loops,
                  recursion, etc. Use:
                  <br />
                  <code>api.step(state)</code> – records a full snapshot.
                  <br />
                  <code>api.swap(i, j)</code> – swaps two indices.
                  <br />
                  <code>api.compare(i, j)</code> – logs comparison.
                  <br />
                  <code>api.visit(node)</code> – marks node visited.
                </small>

                {/* ----------------------------------------------------------------- */}
                {/* 5️⃣ ADD: Warnings panel — EXACTLY as you specified                */}
                {/* ----------------------------------------------------------------- */}
                {validationIssues.length > 0 && (
                  <div
                    className="mt-2 p-2 rounded"
                    style={{
                      background: "#2b2f4a",
                      color: "#fde68a",
                      fontSize: 12,
                    }}
                  >
                    <strong>⚠ Algorithm Helper:</strong>
                    <ul className="mb-0 mt-1">
                      {validationIssues.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* ----------------------------------------------------------------- */}

              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-success" onClick={() => handleSave(selected)} disabled={!isEditable}>💾 Save</button>
              <button className="btn btn-info" onClick={() => handleServerVisualize(selected.id)}>🌐 Visualize (Server)</button>
              <button className="btn btn-warning" onClick={handleLocalRun}>⚡ Run Locally</button>
              <button className="btn btn-outline-light" onClick={handleOpenReviewModal}>🤖 Review Code</button>
              <button
                className="btn btn-light"
                onClick={() =>
                  setCustomInput(
                    JSON.stringify(
                      Array.from({ length: 8 }, () => Math.floor(Math.random() * 50))
                    )
                  )
                }
              >
                🎲 Randomize Array
              </button>
            </div>

            {/* Input */}
            <div className="input-panel mt-3">
              <h6>🔢 Custom Input (JSON)</h6>
              <textarea
                className="form-control"
                rows="3"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder='e.g. [5,2,9,1,3] or {"A":["B","C"],"B":["A","D"]}'
              />
            </div>

            {/* Output */}
            <div className="mt-4">
              {localRunResult ? (
                <RuntimePanel
                  category={selected.category}
                  pseudocode={selected.pseudocode || ""}
                  runResult={localRunResult}
                />
              ) : serverOutput ? (
                <div className="mt-3 p-3 border rounded bg-dark text-white">
                  <h6>🧠 Server Output</h6>
                  <pre style={{ color: "#fbbf24", fontSize: 13 }}>
                    {JSON.stringify(serverOutput, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-white-50">Run locally or visualize via server to see output.</p>
              )}
            </div>

            {!isEditable && (
              <p style={{ color: "#a5b4fc", marginTop: 10 }}>
                🔒 This algorithm is read-only (system or another user's).
              </p>
            )}
          </>
        ) : (
          <p>Select an algorithm from the sidebar to start building.</p>
        )}
      </div>

      {/* NEW ALGO MODAL */}
      {showAlgoModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-dark text-white p-4 rounded">
            <h5>🧠 Create New Algorithm</h5>

            <label>Name</label>
            <input
              className="form-control mb-2"
              value={newAlgo.name}
              onChange={(e) => setNewAlgo({ ...newAlgo, name: e.target.value })}
            />

            <label>Category</label>
            <select
              className="form-select mb-2"
              value={newAlgo.category}
              onChange={(e) => setNewAlgo({ ...newAlgo, category: e.target.value })}
            >
              <option>Sorting</option>
              <option>Searching</option>
              <option>Graph</option>
              <option>Tree</option>
              <option>Dynamic</option>
              <option>Greedy</option>
              <option>Other</option>
            </select>

            <label>Complexity</label>
            <input
              className="form-control mb-3"
              value={newAlgo.complexity}
              onChange={(e) => setNewAlgo({ ...newAlgo, complexity: e.target.value })}
            />

            <div className="d-flex gap-2">
              <button className="btn btn-success" onClick={handleCreate}>Create</button>
              <button className="btn btn-secondary" onClick={() => setShowAlgoModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK EDITOR MODAL */}
      <BlockEditorModal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onSave={handleSaveBlock}
        block={editingBlock}
        algorithmId={selected?.id}
      />

      {/* AI REVIEW MODAL */}
      {showReviewModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "480px",
              maxWidth: "90vw",
              maxHeight: "70vh",
              background: "#111827",
              color: "#e5e7eb",
              borderRadius: "10px",
              padding: "16px 18px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <h5 style={{ margin: 0 }}>🤖 AI Code Review</h5>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>
              Reviewing the current JavaScript implementation of <strong>{selected?.name}</strong>.
            </p>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                background: "#020617",
                borderRadius: "6px",
                padding: "8px 10px",
                border: "1px solid #1f2937",
              }}
            >
              {reviewLoading ? (
                <p style={{ fontSize: 14 }}>Thinking… ⏳</p>
              ) : (
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    margin: 0,
                    fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
                  }}
                >
                  {reviewText || "No review available."}
                </pre>
              )}
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => setShowReviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmBuilder;
