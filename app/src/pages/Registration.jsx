import { useState, useContext } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { signUp } from "../services/UserService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Registration = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await signUp(
        formData.firstName,
        formData.lastName,
        formData.username,
        formData.email,
        formData.password
      );

      const token = result.data.access_token;
      if (token) {
        login(token);
        alert("🎉 Registration successful!");
        navigate("/");
      } else {
        throw new Error("No token returned from server");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center flex-column"
      style={{
        width: "100%",
        minHeight: "100vh",
        padding: "20px",
        background: `
          radial-gradient(circle at 20% 20%, rgba(203,206,255,0.6), transparent 60%),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15), transparent 60%),
          linear-gradient(135deg, rgba(20,26,70,0.6), rgba(6,16,48,0.8))
        `,
        backdropFilter: "blur(4px)",
      }}
    >
      {/* WELCOME TITLE */}
      <h1
        style={{
          color: "white",
          fontWeight: 800,
          marginBottom: "30px",
          fontSize: "3rem",
          textShadow: "0 5px 25px rgba(203,206,255,0.6)",
          letterSpacing: "1px",
        }}
      >
        Welcome to AlgoVisualizer+
      </h1>
      <h4
        style={{
          color: "rgba(255,255,255,0.85)",
          fontWeight: 400,
          marginBottom: "40px",
          maxWidth: "600px",
          textAlign: "center",
          lineHeight: "1.5",
        }}
      >
        Create your account and start exploring powerful algorithm visualizations,
        enjoy interactive learning tools, and build your own custom algorithms.
      </h4>

      {/* 3D Apple Vision Pro Glass Panel */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "40px 35px",
          borderRadius: "28px",
          background: "rgba(255, 255, 255, 0.16)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.4), inset 0 0 60px rgba(255,255,255,0.2)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{
            fontWeight: 700,
            color: "#ffffff",
            textShadow: "0 2px 6px rgba(0,0,0,0.4)",
            letterSpacing: "0.4px",
            marginBottom: "30px",
          }}
        >
          Create Your Account
        </h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {[
            { label: "First Name", name: "firstName", placeholder: "John" },
            { label: "Last Name", name: "lastName", placeholder: "Doe" },
            { label: "Username", name: "username", placeholder: "yourusername" },
            { label: "Email", name: "email", placeholder: "you@example.com" },
          ].map((field, index) => (
            <Form.Group key={index} className="mb-3">
              <Form.Label style={{ color: "white", fontWeight: 500 }}>
                {field.label}
              </Form.Label>
              <Form.Control
                type={field.name === "email" ? "email" : "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                style={{
                  borderRadius: "14px",
                  padding: "12px",
                  background: "rgba(255,255,255,0.28)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  color: "white",
                  backdropFilter: "blur(8px)",
                  boxShadow: "inset 0 0 12px rgba(255,255,255,0.25)",
                }}
              />
            </Form.Group>
          ))}

          {/* PASSWORD */}
          <Form.Group className="mb-4">
            <Form.Label style={{ color: "white", fontWeight: 500 }}>
              Password
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              minLength="8"
              style={{
                borderRadius: "14px",
                padding: "12px",
                background: "rgba(255,255,255,0.28)",
                border: "1px solid rgba(255,255,255,0.45)",
                color: "white",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 0 12px rgba(255,255,255,0.25)",
              }}
            />
          </Form.Group>

          {/* REGISTER BUTTON */}
          <Button
            type="submit"
            style={{
              width: "100%",
              background: "#6bffc4ff",
              border: "none",
              padding: "12px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#000",
              borderRadius: "14px",
              boxShadow: "0 6px 22px rgba(0,0,0,0.3)",
            }}
          >
            Create Account
          </Button>

          {/* LOGIN LINK */}
          <div className="text-center mt-3">
            <Button
              variant="link"
              onClick={() => navigate("/login")}
              style={{
                color: "#6bffc4ff",
                textDecoration: "underline",
                fontWeight: 500,
                marginTop: "10px",
              }}
            >
              Already have an account? Login
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Registration;
