import http from "../http-common";
import { getTokenBearer } from "../utility/Utility";

// 🧠 Fetch all visualizations (the list page)
export const getAllVisualizations = async () => {
  const token = getTokenBearer();
  const res = await http.get("/visualizations", {
    headers: { Authorization: token },
  });
  return res.data;
};

// 🧠 Fetch one saved visualization by ID
export const getVisualizationById = async (id) => {
  const token = getTokenBearer();
  const res = await http.get(`/visualizations/${id}`, {
    headers: { Authorization: token },
  });
  return res.data;
};

// ⚙️ NEW — Dynamically generate visualization from backend (executes real algorithm code)
export const generateVisualization = async (algorithmId, input) => {
  const token = getTokenBearer();
  const res = await http.post(
    "/visualizations/generate",
    { algorithmId, input },
    { headers: { Authorization: token } }
  );
  return res.data; // { id, stateJson: { steps, result }, ... }
};
// 🧠 Fetch all algorithms instead of visualizations
export const getAllAlgorithms = async () => {
  const token = getTokenBearer();
  const res = await http.get("/algorithms", {
    headers: { Authorization: token },
  });
  return res.data;
};
