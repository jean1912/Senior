import React, { useEffect, useState } from "react";
import { getAllVisualizations } from "../../services/VisualizerService";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import VisualizerCanvas from "./VisualizerCanvas";

const VisualizerList = () => {
  const [visualizations, setVisualizations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllVisualizations();
        setVisualizations(data);
      } catch (err) {
        console.error("❌ Failed to fetch visualizations:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" /> Loading visualizations...
      </Container>
    );

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Algorithm Visualizations</h2>

      {selected ? (
        <VisualizerCanvas
          visualization={selected}
          onBack={() => setSelected(null)}
        />
      ) : (
        <div className="d-flex flex-wrap justify-content-center gap-4">
          {visualizations.map((vis) => (
            <Card
              key={vis.id}
              style={{ width: "18rem" }}
              className="shadow-sm text-center"
            >
              <Card.Body>
                <Card.Title>{vis.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {vis.algorithm?.name || "Unknown Algorithm"}
                </Card.Subtitle>
                <Card.Text style={{ minHeight: "4rem" }}>
                  {vis.description}
                </Card.Text>
                <Button variant="primary" onClick={() => setSelected(vis)}>
                  Visualize
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default VisualizerList;
