// src/services/ExerciseService.js
import http from "../http-common";

// ✅ Get all exercises
export const getAllExercises = async () =>
  http.get("/exercises").then(r => r.data);

// ✅ Get a single exercise by ID
export const getExerciseById = async (id) =>
  http.get(`/exercises/${id}`).then(r => r.data);

// ✅ Create a new exercise (admin/creator only)
export const createExercise = async (data) =>
  http.post("/exercises", data).then(r => r.data);

// ✅ Update exercise
export const updateExercise = async (id, data) =>
  http.patch(`/exercises/${id}`, data).then(r => r.data);

// ✅ Delete exercise
export const deleteExercise = async (id) =>
  http.delete(`/exercises/${id}`).then(r => r.data);

export default {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
