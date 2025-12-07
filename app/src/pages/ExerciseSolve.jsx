// src/pages/ExerciseSolve.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { getExerciseById } from "../services/ExerciseService";
import { gradeSubmission } from "../services/SubmissionService";
import { transpile } from "../engine/compiler";
import { runInSandbox } from "../engine/runtime";
import { Button, Card, Nav } from "react-bootstrap";
import * as monaco from "monaco-editor";

// ⭐ ADD — AI services
import { generateHints, reviewSubmission } from "../services/ai";

export default function ExerciseSolve() {
  const { id } = useParams();

  const [exercise, setExercise] = useState(null);
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("console");

  const [consoleOutput, setConsoleOutput] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [judgeOutput, setJudgeOutput] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);

  // ⭐ AI MODALS
  const [showHintsModal, setShowHintsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  // Load exercise
  useEffect(() => {
    getExerciseById(id)
      .then((data) => {
        setExercise(data);
        setCode(data.starterCode || "");
      })
      .catch(console.error);
  }, [id]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // ============================================================
  // RUN CODE (UNCHANGED)
  // ============================================================
  const handleRun = () => {
    setIsRunning(true);
    setConsoleOutput("");
    setRunOutput(null);
    setActiveTab("console");

    const model = editorRef.current.getModel();
    const markers = monaco.editor.getModelMarkers({ model });

    if (markers.length > 0) {
      setConsoleOutput("❌ Syntax Error:\n" + markers[0].message);
      setIsRunning(false);
      return;
    }

    let transpiled;
    try {
      transpiled = transpile(code);
    } catch (err) {
      setConsoleOutput("❌ Compile Error:\n" + err.message);
      setIsRunning(false);
      return;
    }

    const sample = exercise.visibleTestCases?.[0];
    if (!sample) {
      setConsoleOutput("⚠ No sample test case available.");
      setIsRunning(false);
      return;
    }

    const { input, output } = sample;

    const result = runInSandbox(transpiled, input);

    if (result.error) {
      setConsoleOutput("❌ Runtime Error:\n" + result.error);
      setIsRunning(false);
      return;
    }

    if (result.logs?.length > 0) {
      setConsoleOutput(result.logs.join("\n"));
    }

    setRunOutput({
      input,
      expected: output,
      received: result.steps[result.steps.length - 1].state ?? null,
      pass:
        JSON.stringify(result.steps[result.steps.length - 1].state) ===
        JSON.stringify(output),
    });

    setActiveTab("output");
    setIsRunning(false);
  };

  // ============================================================
  // SUBMIT (UNCHANGED)
  // ============================================================
  const handleSubmit = async () => {
    setIsRunning(true);
    setConsoleOutput("");
    setJudgeOutput(null);
    setActiveTab("console");

    const model = editorRef.current.getModel();
    const markers = monaco.editor.getModelMarkers({ model });

    if (markers.length > 0) {
      setConsoleOutput("❌ Syntax Error:\n" + markers[0].message);
      setIsRunning(false);
      return;
    }

    try {
      transpile(code);
    } catch (err) {
      setConsoleOutput("❌ Compile Error:\n" + err.message);
      setIsRunning(false);
      return;
    }

    try {
      const result = await gradeSubmission(Number(id), code);
      setJudgeOutput(result);
      setActiveTab("results");
    } catch (err) {
      setConsoleOutput("❌ Judge Error:\n" + err.message);
    }

    setIsRunning(false);
  };

  // ============================================================
  // ⭐ AI: Generate Hints
  // ============================================================
  const handleGenerateHints = async () => {
    setShowHintsModal(true);
    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await generateHints(Number(id), "Give me hints", exercise.description);
      setAiResponse(res);
    } catch (err) {
      setAiResponse("❌ Failed to generate hints.\n" + err.message);
    }

    setAiLoading(false);
  };

  // ============================================================
  // ⭐ AI: Review Submission
  // ============================================================
  const handleReviewSubmission = async () => {
    if (!judgeOutput?.submissionId) {
      alert("Submit once before requesting a Review.");
      return;
    }

    setShowReviewModal(true);
    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await reviewSubmission(judgeOutput.submissionId, "", exercise.description);
      setAiResponse(res);
    } catch (err) {
      setAiResponse("❌ Failed to review submission.\n" + err.message);
    }

    setAiLoading(false);
  };

  if (!exercise) return <p>Loading...</p>;

  return (
    <div className="d-flex" style={{ gap: 20 }}>
      {/* LEFT SIDE — PROBLEM */}
      <div style={{ width: "45%" }}>
        <h2>Exercise #{exercise.id}</h2>
        <p>{exercise.description}</p>

        <h5>Function Signature</h5>
        <pre style={{ background: "#eee", padding: 10 }}>
          {exercise.functionSignature}
        </pre>

        <h5>Examples</h5>
        {exercise.visibleTestCases?.map((t, i) => (
          <Card key={i} className="mb-2">
            <Card.Body>
              <strong>Input:</strong> {JSON.stringify(t.input)} <br />
              <strong>Output:</strong> {JSON.stringify(t.output)}
            </Card.Body>
          </Card>
        ))}

        {/* ⭐ NEW AI BUTTONS */}
        <div className="mt-3 d-flex" style={{ gap: 10 }}>
          <Button variant="outline-info" onClick={handleGenerateHints}>
            🤖 Generate Hints
          </Button>

          <Button variant="outline-warning" onClick={handleReviewSubmission}>
            🧠 Review Submission
          </Button>
        </div>
      </div>

      {/* RIGHT SIDE — EDITOR + TABS */}
      <div style={{ width: "55%" }}>
        <h5>Code Editor</h5>

        <Editor
          height="400px"
          defaultLanguage="javascript"
          value={code}
          onChange={(v) => setCode(v)}
          onMount={(editor) => {
            handleEditorDidMount(editor);
            import("../monaco-eslint-setup").then(({ setupMonacoLinting }) => {
              setupMonacoLinting(monaco, editor);
            });
          }}
          theme="vs-dark"
          options={{
            fontSize: 15,
            minimap: { enabled: false },
            smoothScrolling: true,
          }}
        />

        {/* Buttons */}
        <div className="mt-3 d-flex" style={{ gap: 10 }}>
          <Button variant="secondary" onClick={handleRun} disabled={isRunning}>
            {isRunning ? "Running..." : "Run Code"}
          </Button>

          <Button onClick={handleSubmit} disabled={isRunning}>
            {isRunning ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Tabs */}
        <Nav variant="tabs" activeKey={activeTab} className="mt-3">
          <Nav.Item>
            <Nav.Link eventKey="console" onClick={() => setActiveTab("console")}>
              Console
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="output" onClick={() => setActiveTab("output")}>
              Output
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="results" onClick={() => setActiveTab("results")}>
              Test Results
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Tab content */}
        <Card className="p-3" style={{ minHeight: 250 }}>
          {/* Console tab */}
          {activeTab === "console" && (
            <pre style={{ whiteSpace: "pre-wrap" }}>{consoleOutput || "No logs."}</pre>
          )}

          {/* RUN OUTPUT */}
          {activeTab === "output" && runOutput && (
            <div>
              <h5>Sample Test Result</h5>
              <p><strong>Input:</strong> {JSON.stringify(runOutput.input)}</p>
              <p><strong>Expected:</strong> {JSON.stringify(runOutput.expected)}</p>
              <p><strong>Received:</strong> {JSON.stringify(runOutput.received)}</p>

              <div className={`alert ${runOutput.pass ? "alert-success" : "alert-danger"}`}>
                {runOutput.pass ? "Passed ✓" : "Failed ✗"}
              </div>
            </div>
          )}

          {/* Full Judge Results */}
          {activeTab === "results" && judgeOutput && (
            <div>
              <h5>Judge Results</h5>
              <p>
                Score: <strong>{judgeOutput.score}%</strong>
              </p>

              {judgeOutput.results.map((r) => (
                <Card
                  key={r.index}
                  className="mb-2"
                  style={{ borderLeft: r.pass ? "5px solid green" : "5px solid red" }}
                >
                  <Card.Body>
                    <p><strong>Test #{r.index + 1}</strong> {r.hidden ? "(hidden)" : ""}</p>
                    <p>Input: {JSON.stringify(r.input)}</p>
                    <p>Expected: {JSON.stringify(r.expected)}</p>
                    <p>Received: {JSON.stringify(r.received)}</p>

                    {r.pass ? (
                      <span className="text-success fw-bold">Passed ✓</span>
                    ) : (
                      <span className="text-danger fw-bold">Failed ✗</span>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

     
      {showHintsModal && (
        <div style={modalBg}>
          <div style={modalBox}>
            <h5> AI Hints</h5>
            <button className="btn btn-sm btn-outline-light" style={closeBtn}
              onClick={() => setShowHintsModal(false)}>✕</button>

            <div style={modalBody}>
              {aiLoading ? "Thinking..." : aiResponse}
            </div>
          </div>
        </div>
      )}

      
      {showReviewModal && (
        <div style={modalBg}>
          <div style={modalBox}>
            <h5>🧠 AI Submission Review</h5>

            <button className="btn btn-sm btn-outline-light" style={closeBtn}
              onClick={() => setShowReviewModal(false)}>✕</button>

            <div style={modalBody}>
              {aiLoading ? "Evaluating..." : aiResponse}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const modalBg = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalBox = {
  width: "480px",
  maxWidth: "90vw",
  maxHeight: "70vh",
  background: "#111827",
  color: "#e5e7eb",
  borderRadius: 10,
  padding: 16,
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const modalBody = {
  flex: 1,
  overflowY: "auto",
  background: "#1f2937",
  padding: 10,
  borderRadius: 6,
  whiteSpace: "pre-wrap",
  fontSize: 14,
  marginTop: 10,
};

const closeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
};
