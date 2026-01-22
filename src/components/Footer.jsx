import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    const footerLinkStyle = {
        textDecoration: 'none',
        color: '#1f2937',
        transition: 'color 0.2s ease',
        fontWeight: '500'
    };

    return (
        <footer
            className="pt-4 pb-2"
            style={{ backgroundColor: 'rgba(140, 124, 124, 0.17)', color: '#1f2937' }}
        >
            <Container>
                {/* MOBILE → 2 COLUMNS | TABLET & DESKTOP → NORMAL */}
                <Row className="gy-4 gx-4 justify-content-between row-cols-2 row-cols-md-3 row-cols-lg-4">

                    {/* Brand */}
                    <Col>
                        <div className="mb-3">
                            <Link to="/">
                                <img
                                    src="/logo.png"
                                    alt="Eco Sand Logo"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'contain',
                                        borderRadius: '50%'
                                    }}
                                />
                            </Link>
                        </div>
                        <h5 className="fw-bold text-dark">Eco Sand</h5>
                    </Col>

                    {/* NavLinks */}
                    <Col>
                        <h5 className="fw-bold mb-3">NavLinks</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li><Link to="/" style={footerLinkStyle}>Home</Link></li>
                            <li><Link to="/about" style={footerLinkStyle}>Products</Link></li>
                            <li><Link to="/about" style={footerLinkStyle}>About Us</Link></li>
                            <li><Link to="/contact" style={footerLinkStyle}>Contact</Link></li>
                        </ul>
                    </Col>

                    {/* Quick Links */}
                    <Col>
                        <h5 className="fw-bold mb-3">Quick Links</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li><Link to="/work-with-us" style={footerLinkStyle}>Work With Us</Link></li>
                            <li><a href="/#testimonials" style={footerLinkStyle}>Testimonials</a></li>
                            <li><a href="/#calculator" style={footerLinkStyle}>Economic Calculator</a></li>
                            <li><Link to="/faq" style={footerLinkStyle}>FAQ</Link></li>
                        </ul>
                    </Col>

                    {/* Contact */}
                    <Col>
                        <h5 className="fw-bold mb-3">Contact</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li className="d-flex align-items-start gap-2">
                                <MapPin size={18} className="text-secondary mt-1 flex-shrink-0" />
                                <span className="fw-medium">Block Number 5, Maheshwari Society, Wardhaman Nagar Square, Nagpur, Maharashtra 440008, India</span>
                            </li>
                            <li className="d-flex align-items-center gap-2">
                                <Phone size={18} className="text-danger" />
                                <span className="fw-medium">+91 9876543210</span>
                            </li>
                            <li className="d-flex align-items-center gap-2">
                                <Mail size={18} className="text-primary" />
                                <span className="fw-medium">info@ecosand.com</span>
                            </li>
                        </ul>
                    </Col>

                </Row>

                {/* Bottom Line */}
                <div className="mt-4 pt-3 text-center border-top border-secondary border-opacity-25 small fw-bold text-secondary">
                    <p className="mb-0">
                        &copy; {new Date().getFullYear()} Designed and Developed By{' '}
                        <a href="https://saturnxdigital.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1a237e', textDecoration: 'none', cursor: 'pointer' }}>SaturnX Digital Solutions</a>
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;