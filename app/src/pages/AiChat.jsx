import React, { useState } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import { reviewCode, explainAlgorithm } from "../services/ai";

export default function AiChat() {
  const [messages, setMessages] = useState([
    { from: "ai", text: "👋 Hello! How can I help you with algorithms today?" }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    let aiReply = "";

    try {
      const text = input.toLowerCase();

      // If user writes "explain", call explainAlgorithm
      if (text.includes("explain")) {
        // Using algorithmId = 1 as a generic algorithm
        aiReply = await explainAlgorithm(1, input);
      }

      // If user writes code (function, =>, { })
      else if (
        input.includes("{") ||
        input.includes("function") ||
        input.includes("=>")
      ) {
        aiReply = await reviewCode(input, "Review this code");
      }

      // General question fallback
      else {
        aiReply = await reviewCode(
          `// user question\n${input}`,
          "General question"
        );
      }

    } catch (err) {
      console.error(err);
      aiReply = "❌ Error processing your request.";
    }

    const botMessage = { from: "ai", text: aiReply };
    setMessages((prev) => [...prev, botMessage]);

    setLoading(false);
    setInput("");
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3 text-center">🤖 AI Algorithm Assistant</h2>

      <Card
        style={{
          height: "70vh",
          overflowY: "auto",
          padding: 20,
          background: "#1e293b",
          color: "white"
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              marginBottom: 12
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 10,
                background: msg.from === "user" ? "#3b82f6" : "#4b5563",
                whiteSpace: "pre-wrap"
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center mt-2">
            <Spinner animation="border" size="sm" /> Thinking...
          </div>
        )}
      </Card>

      <div className="d-flex mt-3">
        <input
          className="form-control me-2"
          placeholder="Ask about algorithms, paste code, etc..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <Button onClick={sendMessage} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
