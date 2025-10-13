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
        <Navbar style={{ backgroundColor: '#eb9800ff' }} variant="dark" expand="lg" className="mb-4" >
            <Container>
                <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/visualizer">Visualizer</Nav.Link>
                        <Nav.Link as={Link} to="/">Exercise</Nav.Link>
                        <Nav.Link as={Link} to="/">Ml Helper</Nav.Link>
                        <Nav.Link as={Link} to="/">code/docs</Nav.Link>
                    </Nav>
                    {/* Add the Logout button */}
                    <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Menu;
