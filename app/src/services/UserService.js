import http from "../http-common";
import { getTokenBearer } from "../utility/Utility";

// Fetch all users (protected)
export const getAll = () => {
  const token = getTokenBearer();
  console.log("📡 Fetching all users with token:", token);
  return http.get("/users", {
    headers: { Authorization: token },
  });
};

// Authenticate (login)
export const authenticate = (username, password) => {
  console.log("🔑 Authenticating user:", username);
  return http.post("/auth/login", { username, password });
};

// Register new user (with email)
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

export default {
  getAll,
  authenticate,
  signUp,
};
