import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { removeToken } from "../utility/Utility"; // Import the removeToken function

const Menu = () => {
    const navigate = useNavigate(); // Hook to navigate to different pages

    // Handle logout
    const handleLogout = () => {
        removeToken(); // Remove the token from localStorage
        navigate('/login'); // Redirect the user to the login page
        window.location.reload(); // Force a page reload to reset the application state
    };

    return (
        <Navbar style={{ backgroundColor: '#6bffc4ff' }} variant="light" expand="lg" className="mb-4" >
            <Container>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/visualizer">Visualizer</Nav.Link>
                        <Nav.Link as={Link} to="/builder">Algorithm Builder</Nav.Link>
                        <Nav.Link as={Link} to="/exercises">Exercises</Nav.Link>

                        <Nav.Link as={Link} to="/ai-chat">Ml Helper</Nav.Link>
                       
                    </Nav>
                    {/* Add the Logout button */}
                    <Button variant="light" onClick={handleLogout}>Logout</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Menu;
