import http from "../http-common";

/* ------------------ ALGORITHMS ------------------ */
export const createAlgorithm = async (data) => http.post("/algorithms", data).then(r => r.data);
export const updateAlgorithm = async (id, data) => http.patch(`/algorithms/${id}`, data).then(r => r.data);
export const getAllAlgorithms = async () => http.get("/algorithms").then(r => r.data);
export const getAlgorithmById = async (id) => http.get(`/algorithms/${id}`).then(r => r.data);
export const deleteAlgorithm = async (id) => http.delete(`/algorithms/${id}`).then(r => r.data);

/* ------------------ BLOCKS ------------------ */
// ✅ Fix here: use /algorithm-blocks endpoints
export const listBlocks = async (algorithmId) =>
  http.get(`/algorithm-blocks/by-algorithm/${algorithmId}`).then(r => r.data);

export const createBlock = async (data) =>
  http.post("/algorithm-blocks", data).then(r => r.data);

export const updateBlock = async (id, data) =>
  http.patch(`/algorithm-blocks/${id}`, data).then(r => r.data);

export const deleteBlock = async (id) =>
  http.delete(`/algorithm-blocks/${id}`).then(r => r.data);

/* ------------------ TEMPLATES ------------------ */
// ✅ Fix here: use /algorithm-templates endpoints
export const listTemplates = async () =>
  http.get("/algorithm-templates").then(r => r.data);

export const getTemplate = async (id) =>
  http.get(`/algorithm-templates/${id}`).then(r => r.data);

export default {
  createAlgorithm,
  updateAlgorithm,
  deleteAlgorithm,
  getAllAlgorithms,
  getAlgorithmById,
  listBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  listTemplates,
  getTemplate,
};
