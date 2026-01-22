import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { ArrowRight, ChevronDown, X } from "lucide-react";

const CustomNavbar = ({ isSamplePopupOpen, onOpenSamplePopup, onCloseSamplePopup }) => {
  return (
    <Navbar
      expand="lg"
      sticky="top"
      collapseOnSelect
      className="py-1"
      style={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        transition: "0.3s ease",
        zIndex: 1100,
      }}
    >
      <Container>

        {/* LOGO */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/assets/logo.png"
            alt="Logo"
            style={{
              height: "85px",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          />
        </Navbar.Brand>

        {/* MOBILE TOGGLE */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          <Button
            variant="outline-dark"
            className="p-2 rounded-circle d-flex align-items-center justify-content-center"
            onClick={isSamplePopupOpen ? onCloseSamplePopup : onOpenSamplePopup}
            style={{ width: '40px', height: '40px' }}
          >
            {isSamplePopupOpen ? <X size={20} /> : <ChevronDown size={20} />}
          </Button>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="border-0 shadow-none"
          />
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-lg-3 gap-2">

            {/* NAV LINKS */}
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About" },
              { to: "/order-now", label: "Order Now" },
              { to: "/work-with-us", label: "Work With Us" },
              { to: "/faq", label: "FAQ" },
              { to: "/contact", label: "Contact Us" },
            ].map((item, i) => (
              <Nav.Link
                key={i}
                as={NavLink}
                to={item.to}
                end
                className="ms-1 me-1"
                style={{
                  fontWeight: "500",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  color: "#0f172a",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(122, 179, 198, 0.2)";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#0f172a";
                }}
              >
                {item.label}
              </Nav.Link>
            ))}

            <div className="d-none d-lg-flex align-items-center ms-lg-3 mt-3 mt-lg-0">
              {/* GET FREE SAMPLE BUTTON */}
              <Button
                variant="outline-dark"
                className="fw-bold rounded-pill px-4 py-2 d-flex align-items-center justify-content-center shadow-sm"
                onClick={onOpenSamplePopup}
                style={{
                  border: "2px solid #0f172a",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0f172a";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#0f172a";
                }}
              >
                Get Free Sample
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;