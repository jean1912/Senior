import { useState, useContext } from "react";
import { authenticate } from "../services/UserService";
import { useNavigate } from "react-router-dom";
import backRound from "../assets/bin.png";
import { Form, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // 👈 use global login from context
  const [user, setUser] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!user.username || !user.password) {
        setError("Username and password cannot be empty.");
        return;
      }

      const response = await authenticate(user.username, user.password);
      const data = response?.data;

      if (data?.access_token) {
        login(data.access_token); // 👈 update global auth context
        alert("✅ You are logged in!");
        navigate("/"); // instant redirect — no refresh needed
      } else {
        setError("Incorrect username or password.");
      }
    } catch (err) {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backRound})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
      }}
    >
      <div
        className="p-4 rounded"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            color: "#333",
            marginBottom: "20px",
          }}
        >
          Welcome Back!
        </h2>

        {error && (
          <p style={{ color: "red", fontWeight: 500, marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "500" }}>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              placeholder="Enter your username"
              style={{ borderRadius: "8px" }}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "500" }}>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={{ borderRadius: "8px" }}
              required
            />
          </Form.Group>

          <Button
            variant="success"
            type="submit"
            style={{
              backgroundColor: "#4CAF50",
              borderColor: "#4CAF50",
              borderRadius: "8px",
              width: "100%",
              padding: "10px",
              fontSize: "16px",
            }}
          >
            Sign In
          </Button>

          <div className="text-center mt-3">
            <Button
              variant="link"
              onClick={() => navigate("/registration")}
              style={{ color: "#4CAF50" }}
            >
              Don’t have an account? Register
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
