// src/services/ai.js
import axios from "../http-common";

const AI_URL = "/ai";

export async function explainAlgorithm(algorithmId, question) {
  const res = await axios.post(`${AI_URL}/explain-algorithm`, {
    algorithmId,
    question,
  });
  return res.data.explanation;
}

export async function generateHints(exerciseId, question, context = "") {
  const res = await axios.post(`${AI_URL}/generate-hints`, {
    exerciseId,
    question,
    context,
  });
  return res.data.hints;
}

export async function reviewCode(code, question = "", algorithmType = "", context = "") {
  const res = await axios.post(`${AI_URL}/review-code`, {
    code,
    question,
    algorithmType,
    context,
  });
  return res.data.review;
}

export async function reviewSubmission(submissionId, question = "", context = "") {
  const res = await axios.post(`${AI_URL}/review-submission`, {
    submissionId,
    question,
    context,
  });
  return res.data.review;
}
