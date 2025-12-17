import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

export default function Header() {
  return (
    <Navbar bg="light" sticky="top" className="Header">
      <Container>
        <Navbar.Brand id="home" href="/">Melissa's Food Reviews</Navbar.Brand>
        <Nav className="me-auto active" variant="underline">
            <Nav.Item id="write-review">
                <Nav.Link href="/write-review">Write Review</Nav.Link>
            </Nav.Item>
            <Nav.Item id="update-review">
                <Nav.Link href="/find-review">Update Review</Nav.Link>
            </Nav.Item>
        </Nav>
      </Container>
    </Navbar>
  );
}