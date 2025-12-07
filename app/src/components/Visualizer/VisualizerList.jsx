import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { getAllAlgorithms } from "../../services/VisualizerService";
import VisualizerCanvas from "./VisualizerCanvas";
import "./VisualizerList.css";

const CATEGORIES = ["Sorting", "Searching", "Graph", "Tree", "Dynamic", "Greedy", "Other"];

const VisualizerList = () => {
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllAlgorithms();
        setAlgorithms(data);
      } catch (err) {
        console.error("❌ Failed to fetch algorithms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="visualizer-loading text-center mt-5">
        <Spinner animation="border" /> Loading algorithms...
      </div>
    );

  // group algorithms by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = algorithms.filter(
      (algo) => algo.category?.toLowerCase() === cat.toLowerCase()
    );
    return acc;
  }, {});

  return (
    <div className="visualizer-layout">
      {/* 🧭 Sidebar */}
      <div className="visualizer-sidebar">
        <h4 className="sidebar-title">Algorithms</h4>

        <ul className="category-list">
          {CATEGORIES.map((cat) => (
            <li key={cat} className="category-item">
              <button
                className={`category-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
              >
                {cat}
              </button>

              {/* Show algorithms for selected category */}
              {selectedCategory === cat && grouped[cat]?.length > 0 && (
                <ul className="algorithm-sublist">
                  {grouped[cat].map((algo) => (
                    <li
                      key={algo.id}
                      className={`algorithm-item ${
                        selectedAlgorithm?.id === algo.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedAlgorithm(algo)}
                    >
                      <span className="algo-name">{algo.name}</span>
                    </li>
                  ))}
                </ul>
              )}

              {selectedCategory === cat && grouped[cat]?.length === 0 && (
                <p className="no-algo">No algorithms in this category</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* 🎨 Visualization Stage */}
      <div className="visualizer-stage">
        {selectedAlgorithm ? (
          <VisualizerCanvas
            visualization={{
              title: selectedAlgorithm.name,
              description: selectedAlgorithm.description,

              // ⭐ Set structure automatically
              structureType: selectedAlgorithm.category?.toLowerCase().includes("graph")
                ? "Graph"
                : selectedAlgorithm.category?.toLowerCase().includes("tree")
                ? "Tree"
                : "Array", // sorting, searching, others → arrays

              algorithm: {
                id: selectedAlgorithm.id,
                name: selectedAlgorithm.name,
                category: selectedAlgorithm.category,
                complexity: selectedAlgorithm.complexity,
                description: selectedAlgorithm.description,
                pseudocode: selectedAlgorithm.pseudocode,
                code: selectedAlgorithm.code,
              },
            }}
            onBack={() => setSelectedAlgorithm(null)}
          />
        ) : (
          <p className="text-center mt-5">
            Select a category, then choose an algorithm to visualize.
          </p>
        )}
      </div>
    </div>
  );
};

export default VisualizerList;
