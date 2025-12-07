import React from "react";

/**
 * A tiny read-only-ish canvas to list blocks in order.
 * You can replace later with React Flow; this keeps things simple now.
 */
export default function AlgorithmCanvas({ blocks = [], onSelect, onReorder }) {
  return (
    <div style={{ background: "#494b59ff", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: 12 }}>
      <h6 className="text-warning mb-2">Blocks (Order)</h6>
      {blocks.length === 0 ? (
        <p className="text-white-50 mb-0">No blocks yet. Add one below.</p>
      ) : (
        <ol style={{ paddingLeft: 18 }}>
          {blocks.map((b, i) => (
            <li key={b.id} style={{ marginBottom: 8 }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
                onClick={() => onSelect?.(b)}
              >
                <code className="me-auto">{b.name}</code>
                <small className="text-white-50">order {b.order}</small>
                <div className="d-flex gap-1 ms-2">
                  <button className="btn btn-sm btn-outline-light" onClick={(e)=>{e.stopPropagation(); onReorder?.(b,'up')}}>↑</button>
                  <button className="btn btn-sm btn-outline-light" onClick={(e)=>{e.stopPropagation(); onReorder?.(b,'down')}}>↓</button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
