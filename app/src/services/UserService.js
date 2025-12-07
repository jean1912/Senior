import http from "../http-common";
import { getTokenBearer } from "../utility/Utility";

/**
 * 🔐 Fetch all users (protected)
 */
export const getAll = () => {
  const token = getTokenBearer();
  console.log("📡 Fetching all users with token:", token);
  return http.get("/users", {
    headers: { Authorization: token },
  });
};

/**
 * 🔑 Authenticate (login)
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{access_token: string, user: object}>}
 */
export const authenticate = (username, password) => {
  console.log("🔑 Authenticating user:", username);
  return http.post("/auth/login", { username, password });
};

/**
 * 🧾 Register new user (signup)
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{access_token: string, user: object}>}
 */
export const signUp = (firstName, lastName, username, email, password) => {
  console.log("📝 Registering new user:", {
    firstName,
    lastName,
    username,
    email,
  });
  return http.post("/auth/signup", {
    firstName,
    lastName,
    username,
    email,
    password,
  });
};

/**
 * 👤 Get current authenticated user profile
 * Uses /auth/profile endpoint with JWT
 */
export const getProfile = async () => {
  const token = getTokenBearer();
  console.log("👤 Fetching current user profile...");
  const res = await http.get("/auth/profile", {
    headers: { Authorization: token },
  });
  return res.data;
};

export default {
  getAll,
  authenticate,
  signUp,
  getProfile,
};
