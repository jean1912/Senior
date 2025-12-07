import React, { useState, useEffect } from "react";

export default function BlockEditorModal({ open, onClose, onSave, block, algorithmId }) {
  const [form, setForm] = useState({ name: "Step", parameters: "{}", codeSnippet: "", order: 0 });

  useEffect(() => {
    if (block) {
      setForm({
        name: block.name ?? "Step",
        parameters: JSON.stringify(block.parameters ?? {}, null, 2),
        codeSnippet: block.codeSnippet ?? "",
        order: block.order ?? 0,
      });
    } else {
      setForm({ name: "Step", parameters: "{}", codeSnippet: "", order: 0 });
    }
  }, [block]);

  if (!open) return null;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(form.parameters || "{}");
      onSave({
        algorithmId,
        name: form.name,
        parameters: parsed,
        codeSnippet: form.codeSnippet,
        order: Number(form.order) || 0,
        id: block?.id,
      });
    } catch {
      alert("Parameters must be valid JSON.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 720 }}>
        <h5>{block ? "Edit Block" : "Add Block"}</h5>

        <div className="row">
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Order</label>
            <input type="number" className="form-control" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          </div>
        </div>

        <label className="form-label mt-2">Parameters (JSON)</label>
        <textarea className="form-control" rows={6} value={form.parameters} onChange={(e)=>setForm({...form, parameters: e.target.value})} />

        <label className="form-label mt-2">Code Snippet (optional)</label>
        <textarea className="form-control" rows={6} value={form.codeSnippet} onChange={(e)=>setForm({...form, codeSnippet: e.target.value})} />

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSave}>{block ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}
