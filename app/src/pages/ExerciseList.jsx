// src/pages/ExerciseList.jsx
import React, { useEffect, useState } from "react";
import { getAllExercises } from "../services/ExerciseService";
import { Link } from "react-router-dom";
import { Spinner, Card } from "react-bootstrap";
import "./ExerciseList.css";

const CATEGORIES = ["Sorting", "Searching", "Graph", "Tree", "Dynamic", "Greedy", "Other"];

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    getAllExercises()
      .then(setExercises)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="exercise-center text-center mt-5">
        <Spinner animation="border" /> Loading exercises...
      </div>
    );

  // Group exercises by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = exercises.filter(
      (ex) =>
        ex.algorithm?.category?.toLowerCase() === cat.toLowerCase()
    );
    return acc;
  }, {});

  // Toggle collapsible
  const toggleCategory = (cat) => {
    setOpenCategory(openCategory === cat ? null : cat);
  };

  return (
    <div className="exercise-container">
      <h2 className="main-title">Exercises</h2>

      {CATEGORIES.map((cat) =>
        grouped[cat].length > 0 ? (
          <div key={cat} className="category-section">

            {/* COLLAPSIBLE HEADER */}
            <h3 className="category-title collapsible" onClick={() => toggleCategory(cat)}>
              {openCategory === cat ? "▼" : " "} {cat}
            </h3>

            {/* COLLAPSIBLE BODY */}
            {openCategory === cat && (
              <div className="exercise-grid">
                {grouped[cat].map((ex) => (
                  <Card key={ex.id} className="exercise-card">
                    <Card.Body>
                      <Card.Title className="exercise-name">
                        Exercise #{ex.id}
                      </Card.Title>
                      <Card.Text className="exercise-description">
                        {ex.description}
                      </Card.Text>

                      <Link to={`/exercises/${ex.id}`} className="exercise-btn">
                        Solve Exercise
                      </Link>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : null
      )}
    </div>
  );
}
