import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Menu from "./components/Menu";
import Home from "./pages/Home";
import AiChat from "./pages/AiChat";

import { AuthContext } from "./context/AuthContext.jsx";
import Visualizer from "./components/Visualizer/VisualizerList.jsx";
import AlgorithmBuilder from "./components/AlgorithmBuilder/AlgorithmBuilder";
import ExerciseList from "./pages/ExerciseList.jsx";
import ExerciseSolve from "./pages/ExerciseSolve.jsx";

const App = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      {isAuthenticated && <Menu />}
      <Container>
        <Routes>
          {!isAuthenticated ? (
  <>
    <Route path="/registration" element={<Registration />} />
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<Navigate to="/registration" />} />
  </>
) : (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/visualizer" element={<Visualizer />} />
    <Route path="/builder" element={<AlgorithmBuilder />} />
    <Route path="/exercises" element={<ExerciseList />} />
    <Route path="/exercises/:id" element={<ExerciseSolve />} />
    <Route path="/ai-chat" element={<AiChat />} />

    
  </>
)}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
