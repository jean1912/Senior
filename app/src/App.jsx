import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Menu from "./components/Menu";
import Home from "./pages/Home";

import { AuthContext } from "./context/AuthContext.jsx";
import Visualizer from "./components/Visualizer/VisualizerList.jsx";

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
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
