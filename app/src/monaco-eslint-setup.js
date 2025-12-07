// src/monaco-eslint-setup.js

import { Linter } from "eslint-linter-browserify";
import * as eslintConfig from "@eslint/js";
import { registerAlgorithmAPI } from "./monaco-api-defs";

export function setupMonacoLinting(monaco, editor) {
  const linter = new Linter();

  // ESLint rule set (browser-friendly)
  const rules = {
    ...eslintConfig.configs.recommended.rules,

    // Ignore: 'main' is defined but never used
    "no-unused-vars": ["warn", { varsIgnorePattern: "^main$" }],

    // Usability improvements
    "no-unreachable": "warn",
    "no-empty": "warn",
    "no-constant-condition": "warn",
    "no-debugger": "warn",
    eqeqeq: "warn",
  };

  function runLint() {
    const code = editor.getValue();

    // Run ESLint on current code
    const messages = linter.verify(code, {
      languageOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      rules,
    });

    // Convert ESLint messages → Monaco markers
    const markers = messages.map((msg) => ({
      startLineNumber: msg.line,
      startColumn: msg.column,
      endLineNumber: msg.endLine || msg.line,
      endColumn: msg.endColumn || msg.column + 1,
      message: msg.message,
      severity:
        msg.severity === 2
          ? monaco.MarkerSeverity.Error
          : monaco.MarkerSeverity.Warning,
    }));

    // Apply real-time diagnostics to the editor
    monaco.editor.setModelMarkers(editor.getModel(), "eslint", markers);
  }

  // Lint on changes
  editor.onDidChangeModelContent(() => runLint());

  // Initial lint on load
  runLint();
  registerAlgorithmAPI();
}
