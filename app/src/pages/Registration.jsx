import { useState, useContext } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { signUp } from "../services/UserService";
import { useNavigate } from "react-router-dom";
import loginPicture from "../assets/enter.png";
import { AuthContext } from "../context/AuthContext";

const Registration = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // 👈 use global login
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
        login(token); // 👈 updates AuthContext
        alert("🎉 Registration successful!");
        navigate("/"); // instant redirect
      } else {
        throw new Error("No token returned from server");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="shadow-lg rounded-3 overflow-hidden"
        style={{ display: "flex", width: "900px" }}
      >
        {/* Left Column - Form */}
        <div className="p-5" style={{ flex: 1, backgroundColor: "white" }}>
          <h2 className="text-center mb-4" style={{ color: "#4CAF50" }}>
            Register
          </h2>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
            </Form.Group>

            <Button
              variant="success"
              type="submit"
              className="w-100"
              style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
            >
              Register
            </Button>

            <div className="text-center mt-3">
              <Button
                variant="link"
                onClick={() => navigate("/login")}
                style={{ color: "#4CAF50" }}
              >
                Already have an account? Login
              </Button>
            </div>
          </Form>
        </div>

        {/* Right Column - Image */}
        <div className="d-none d-md-block" style={{ flex: 1 }}>
          <img
            src={loginPicture}
            className="img-fluid h-100"
            style={{ objectFit: "cover" }}
            alt="Registration visual"
          />
        </div>
      </div>
    </Container>
  );
};

export default Registration;
