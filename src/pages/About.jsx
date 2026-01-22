import React from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { Shield, Leaf, CheckCircle, Hammer, Coins, Wrench, Truck, Beaker, Users, Globe } from 'lucide-react';
import RevealOnScroll from '../components/RevealOnScroll';

const About = () => {
    return (
        <div style={{ backgroundColor: '#f9f9f8', minHeight: '100vh' }}>
            {/* Hero Section */}
            <div className="position-relative py-5 mb-5" style={{ background: '#0f172a' }}>
                <Container className="text-center position-relative z-1">
                    <RevealOnScroll direction="down">
                        <h1 className="display-4 fw-bold text-white mb-2">Ram Innovation and Solutions</h1>
                        <p className="text-white-50 lead w-75 mx-auto">
                            Research-Driven Construction Materials & Industrial Waste Utilization
                        </p>
                    </RevealOnScroll>
                </Container>
                {/* Decorative background element */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }}></div>
            </div>

            <Container className="pb-5">
                {/* Introduction Section */}
                <Row className="justify-content-center mb-5">
                    <Col lg={10}>
                        <RevealOnScroll>
                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                                <Card.Body className="p-4 p-md-5">
                                    <h3 className="fw-bold mb-4 text-dark text-center">Who We Are</h3>
                                    <p className="lead text-secondary mb-4">
                                        Ram Innovation and Solutions is a research-driven construction materials and industrial waste utilization company, established on 15th August 2019 under the Indian Partnership Act, 1932. Headquartered in Nagpur, Maharashtra, the firm is engaged in the research, development, manufacturing, logistics, and market development of value-added construction materials derived from industrial by-products.
                                    </p>
                                    <p className="text-secondary">
                                        The company draws its strength from its roots in <strong>Mandhana Engineers</strong>, a legacy enterprise with over 30 years of extensive experience in government and public sector contracts. This background equips us with deep technical understanding, execution discipline, and compliance-oriented operations required for large-scale infrastructure and PSU projects.
                                    </p>
                                </Card.Body>
                            </Card>
                        </RevealOnScroll>
                    </Col>
                </Row>

                {/* Legacy Section */}
                <Row className="mb-5 align-items-center">
                    <Col md={12}>
                        <RevealOnScroll direction="left">
                            <h3 className="fw-bold mb-3 text-primary">Legacy of Mandhana Engineers</h3>
                            <h5 className="text-muted mb-4">30+ Years of Government Contracting Experience</h5>
                            <p className="text-secondary mb-4">
                                Ram Innovation and Solutions is promoted by professionals from Mandhana Engineers, a firm known for more than three decades of successful execution of government contracts. This experience enables us to:
                            </p>
                            <Row className="g-3">
                                {[
                                    'Understand government specifications, tender conditions, and compliance norms',
                                    'Work efficiently with PSUs, municipal corporations, and infrastructure authorities',
                                    'Maintain strict quality control, documentation, and execution discipline',
                                    'Deliver materials and services with long-term accountability'
                                ].map((item, index) => (
                                    <Col md={6} key={index}>
                                        <div className="d-flex align-items-start gap-2">
                                            <CheckCircle size={20} className="text-success mt-1 flex-shrink-0" />
                                            <span className="text-secondary">{item}</span>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </RevealOnScroll>
                    </Col>
                </Row>

                {/* Research & Utilization */}
                <section className="py-4 mb-5" style={{ backgroundColor: '#f1f5f9', borderRadius: '1rem' }}>
                    <Container className="p-4">
                        <RevealOnScroll direction="right">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <Beaker size={32} className="text-info" />
                                <h3 className="fw-bold m-0">Research-Based Industrial Waste Utilization</h3>
                            </div>
                            <p className="text-secondary mb-4">
                                We are not conventional traders. We are a research-oriented organization focused on maximizing the practical value of industrial waste materials. Through continuous research, testing, and field validation, we:
                            </p>
                            <Row className="g-4">
                                {[
                                    'Convert blast furnace slag and other industrial by-products into usable construction materials',
                                    'Enhance material performance through process optimization',
                                    'Develop site-friendly solutions suitable for real-world applications',
                                    'Build market acceptance for alternative and sustainable materials'
                                ].map((text, i) => (
                                    <Col md={6} key={i}>
                                        <Card className="h-100 border-0 shadow-sm">
                                            <Card.Body>
                                                <p className="mb-0 text-secondary">{text}</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </RevealOnScroll>
                    </Container>
                </section>

                {/* Core Products */}
                <Row className="mb-5">
                    <Col lg={6} className="mb-4 mb-lg-0">
                        <RevealOnScroll>
                            <Card className="h-100 border-0 shadow-sm rounded-4">
                                <Card.Header className="bg-white border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <Hammer size={24} className="text-warning" />
                                        <h4 className="fw-bold m-0">Our Core Products & Expertise</h4>
                                    </div>
                                </Card.Header>
                                <Card.Body className="px-4 pb-4">
                                    <ListGroup variant="flush">
                                        {[
                                            'Manufacturing of GGBS (Ground Granulated Blast Furnace Slag)',
                                            'Processing and supply of Blast Furnace Slag Sand as an eco-friendly alternative',
                                            'Development of slag-based construction materials',
                                            'Bulk trading and supply of construction and industrial raw materials'
                                        ].map((item, idx) => (
                                            <ListGroup.Item key={idx} className="border-0 px-0 py-2 d-flex align-items-start gap-2">
                                                <span className="text-warning">•</span>
                                                <span className="text-secondary">{item}</span>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                    <div className="mt-3">
                                        <h6 className="fw-bold text-dark">Our materials are widely used by:</h6>
                                        <ul className="text-secondary list-unstyled mb-0 ps-3">
                                            <li>• Cement manufacturers</li>
                                            <li>• Ready Mix Concrete (RMC) plants</li>
                                            <li>• Cement product manufacturers</li>
                                            <li>• Government and infrastructure contractors</li>
                                        </ul>
                                    </div>
                                </Card.Body>
                            </Card>
                        </RevealOnScroll>
                    </Col>

                    {/* Logistics */}
                    <Col lg={6}>
                        <RevealOnScroll delay={0.2}>
                            <Card className="h-100 border-0 shadow-sm rounded-4">
                                <Card.Header className="bg-white border-0 pt-4 px-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <Truck size={24} className="text-danger" />
                                        <h4 className="fw-bold m-0">In-House Logistics</h4>
                                    </div>
                                </Card.Header>
                                <Card.Body className="px-4 pb-4">
                                    <p className="text-secondary mb-3">
                                        To ensure timely, reliable, and cost-effective deliveries, we operate with our own fleet of trucks, enabling end-to-end control over logistics.
                                    </p>
                                    <ListGroup variant="flush">
                                        {[
                                            'Handle bulk and continuous material movement',
                                            'Ensure on-time delivery to project sites and plants',
                                            'Maintain material quality during transit',
                                            'Reduce dependency on third-party transporters'
                                        ].map((item, idx) => (
                                            <ListGroup.Item key={idx} className="border-0 px-0 py-2 d-flex align-items-start gap-2">
                                                <span className="text-danger">•</span>
                                                <span className="text-secondary">{item}</span>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </RevealOnScroll>
                    </Col>
                </Row>

                {/* Sustainability Feature Section */}
                <Row className="mb-5">
                    <Col md={12}>
                        <RevealOnScroll>
                            <div className="bg-success bg-opacity-10 p-4 rounded-4 shadow-sm">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <Leaf size={32} className="text-success" />
                                    <h3 className="fw-bold m-0 text-success">Sustainable Construction Materials</h3>
                                </div>
                                <p className="text-secondary">
                                    Our products are developed using scientifically processed industrial waste, helping reduce dependence on natural resources, minimize river sand mining, lower environmental impact, and improve cost efficiency. By promoting slag sand and GGBS, we actively contribute to environmentally responsible construction.
                                </p>
                            </div>
                        </RevealOnScroll>
                    </Col>
                </Row>

                {/* Quality & Market Development Grid */}
                <Row className="g-4 mb-5">
                    <Col md={6}>
                        <RevealOnScroll direction="left">
                            <Card className="h-100 border-0 shadow-sm rounded-4">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <Shield size={28} className="text-primary" />
                                        <h4 className="fw-bold m-0">Quality & Process Control</h4>
                                    </div>
                                    <p className="text-secondary">
                                        Our quality systems combine engineering discipline from government contracting experience with research-driven process control. Every batch is processed under controlled conditions and supplied with a focus on predictable and repeatable performance.
                                    </p>
                                </Card.Body>
                            </Card>
                        </RevealOnScroll>
                    </Col>
                    <Col md={6}>
                        <RevealOnScroll direction="right">
                            <Card className="h-100 border-0 shadow-sm rounded-4">
                                <Card.Body className="p-4">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <Globe size={28} className="text-info" />
                                        <h4 className="fw-bold m-0">Market Development</h4>
                                    </div>
                                    <p className="text-secondary">
                                        We play an active role in developing markets for alternative construction materials by supporting trials, pilot applications, providing technical guidance, and building long-term confidence in sustainable materials.
                                    </p>
                                </Card.Body>
                            </Card>
                        </RevealOnScroll>
                    </Col>
                </Row>

                {/* Vision & Mission */}
                <Row className="g-4 mb-5">
                    <Col md={6}>
                        <Card className="h-100 border-0 shadow-sm rounded-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)' }}>
                            <Card.Body className="p-4 p-md-5">
                                <h4 className="fw-bold mb-3 text-primary">Our Vision</h4>
                                <p className="text-secondary mb-0">
                                    To become a leading research-based industrial waste utilization company, combining engineering legacy, innovation, and logistics strength to support India’s sustainable infrastructure growth.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <RevealOnScroll direction="right" delay={0.4}>
                            <Card className="h-100 border-0 shadow-sm rounded-4" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)' }}>
                                <Card.Body className="p-4 p-md-5">
                                    <h4 className="fw-bold mb-3 text-success">Our Mission</h4>
                                    <ul className="text-secondary mb-0 ps-3">
                                        <li>To convert industrial waste into high-value construction materials</li>
                                        <li>To apply research for practical, market-ready solutions</li>
                                        <li>To ensure dependable supply through in-house logistics</li>
                                        <li>To uphold quality and innovation</li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </RevealOnScroll>
                    </Col>
                </Row>
            </Container>

            <style>
                {`
                    .hover-lift {
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    .hover-lift:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                    }
                `}
            </style>
        </div>
    );
};

export default About;