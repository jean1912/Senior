// src/services/SubmissionService.js
import http from "../http-common";

// ✅ Create plain text submission (optional feature)
export const createSubmission = async (data) =>
  http.post("/submissions", data).then(r => r.data);

// ✅ LeetCode-style grading
export const gradeSubmission = async (exerciseId, code) =>
  http.post("/submissions/grade", {
    exerciseId,
    code,
  }).then(r => r.data);

// ✅ Get all submissions
export const getAllSubmissions = async () =>
  http.get("/submissions").then(r => r.data);

// ✅ Get a single submission
export const getSubmissionById = async (id) =>
  http.get(`/submissions/${id}`).then(r => r.data);

// ✅ Update submission
export const updateSubmission = async (id, data) =>
  http.patch(`/submissions/${id}`, data).then(r => r.data);

// ✅ Delete submission
export const deleteSubmission = async (id) =>
  http.delete(`/submissions/${id}`).then(r => r.data);

export default {
  createSubmission,
  gradeSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
};
