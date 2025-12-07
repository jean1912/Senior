// src/engine/compile.js
import * as Babel from "@babel/standalone";

/**
 * 🔧 Transpile user JavaScript into ES5 for the sandbox runtime.
 * - Safe for browser execution
 * - Supports ES6+ features
 * - Strips import/export lines to avoid external injections
 * - Throws clear compilation errors
 */
export function transpile(codeText) {
  if (!codeText || typeof codeText !== "string") {
    throw new Error("No code provided to transpile.");
  }

  try {
    // 🧹 Remove imports/exports (they're not needed in the sandbox)
    const sanitized = codeText.replace(/^\s*(import|export).*/gm, "");

    const { code } = Babel.transform(sanitized, {
      presets: [["env", { targets: { ie: "11" } }]],
      comments: false,
      compact: true,
      sourceMaps: false,
    });

    return code;
  } catch (err) {
    console.error("❌ Babel transpile error:", err);
    throw new Error("Transpilation failed: " + err.message);
  }
}
