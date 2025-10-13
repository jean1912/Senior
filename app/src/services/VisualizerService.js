// src/components/Visualizer/VisualizerService.js
import http from "../http-common"; // adjust path if needed
import { getTokenBearer } from "../utility/Utility";

export const getAllVisualizations = async () => {
  const token = getTokenBearer();
  const res = await http.get("/visualizations", {
    headers: { Authorization: token },
  });
  return res.data;
};

export const getVisualizationById = async (id) => {
  const token = getTokenBearer();
  const res = await http.get(`/visualizations/${id}`, {
    headers: { Authorization: token },
  });
  return res.data;
};
