import { useState, useContext } from "react";
import { authenticate } from "../services/UserService";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

// 🌟 Modern Glassmorphism Login Page — color theme: #cbceff
const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
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
        login(data.access_token);
        navigate("/");
      } else {
        setError("Incorrect username or password.");
      }
    } catch (err) {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `
          linear-gradient(135deg, rgba(203,206,255,0.35), rgba(6,20,50,0.55)),
          radial-gradient(circle at top left, rgba(203,206,255,0.45), transparent 60%)
        `,
        backdropFilter: "blur(6px)",
        padding: "20px",
      }}
    >
      {/* Glass Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "35px 30px",
          borderRadius: "18px",
          background: "rgba(255, 255, 255, 0.18)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(14px) saturate(180%)",
          WebkitBackdropFilter: "blur(14px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            color: "#ffffff",
            textShadow: "0 2px 6px rgba(0,0,0,0.4)",
            marginBottom: "25px",
            letterSpacing: "0.5px",
          }}
        >
          Welcome Back 
        </h2>

        {error && (
          <p style={{ color: "#ff6b6b", fontWeight: "600", marginBottom: "15px" }}>
            {error}
          </p>
        )}

        <Form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <Form.Group className="mb-4 text-start">
            <Form.Label style={{ color: "#fff", fontWeight: 500 }}>
              Username
            </Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              placeholder="Enter your username"
              style={{
                borderRadius: "10px",
                background: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "white",
                padding: "12px",
                backdropFilter: "blur(6px)",
                boxShadow: "0 0 8px rgba(203,206,255,0.4)",
              }}
              required
            />
          </Form.Group>

          {/* PASSWORD */}
          <Form.Group className="mb-4 text-start">
            <Form.Label style={{ color: "#fff", fontWeight: 500 }}>
              Password
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={{
                borderRadius: "10px",
                background: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "white",
                padding: "12px",
                backdropFilter: "blur(6px)",
                boxShadow: "0 0 8px rgba(203,206,255,0.4)",
              }}
              required
            />
          </Form.Group>

          {/* SIGN IN BUTTON — updated to #cbceff */}
          <Button
            type="submit"
            style={{
              width: "100%",
              background: "#6bffc4ff",
              border: "none",
              color: "#000",
              fontWeight: 600,
              borderRadius: "10px",
              padding: "12px",
              fontSize: "17px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            Sign In
          </Button>

          {/* REGISTER LINK */}
          <div className="text-center mt-3">
            <Button
              variant="link"
              onClick={() => navigate("/registration")}
              style={{
                color: "#6bffc4ff",
                textDecoration: "underline",
                fontWeight: 500,
              }}
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
