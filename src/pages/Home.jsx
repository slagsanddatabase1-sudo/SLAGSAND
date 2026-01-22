import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Form, Button, Card, Table, Spinner } from 'react-bootstrap';
import { Leaf, DollarSign, ShieldCheck, Truck, MessageSquare, Package, CheckCircle2, XCircle } from 'lucide-react';
import Hero from '../components/Hero';
import FloatingChat from '../components/FloatingChat';
import { supabase } from '../lib/supabase';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Added Navbar import
import RevealOnScroll from '../components/RevealOnScroll'; // Added RevealOnScroll import


const TypewriterText = ({ text, speed = 50 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <p className="mb-0" style={{ lineHeight: '1.6' }}>{displayedText}<span className="animate-blink">|</span></p>;
};

const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};

const sectionBg = {
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: "url('https://i.pinimg.com/736x/52/ca/6d/52ca6dfcbf57849bb8a862ca74d75e7a.jpg')",
};

const overlay = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 0
};

const content = {
    position: 'relative',
    zIndex: 1
};


const StatCard = ({ item, index }) => {
    const count = useCounter(item.value);

    return (
        <div
            className="rounded-4 border-start border-4 border-success text-center"
            style={{
                background: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                padding: "30px",
                transition: "0.3s ease",
                opacity: 0,
                animation: "fadeInUp 0.6s ease forwards",
                animationDelay: `${index * 0.15}s`,
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.1)";
            }}
        >
            {/* Counter */}
            <div className="display-5 fw-bold text-success mb-1">
                {count}+
            </div>

            {/* Label */}
            <div className="text-secondary fw-bold text-uppercase small">
                {item.label}
            </div>
        </div>
    );
};

const Home = () => {
    const [showSampleModal, setShowSampleModal] = useState(false);
    const [counters, setCounters] = useState({});
    const { register, handleSubmit, reset } = useForm();
    const [testimonials, setTestimonials] = useState([]);
    const [loadingCounters, setLoadingCounters] = useState(true);
    const [loadingTestimonials, setLoadingTestimonials] = useState(true);
    const [techSpecTab, setTechSpecTab] = useState('physical');

    useEffect(() => {
        // Fetch data in parallel
        Promise.all([fetchCounters(), fetchTestimonials()]);
    }, []);

    const fetchCounters = async () => {
        try {
            const { data } = await supabase.from('counters').select('*');
            if (data) {
                const counterMap = {};
                data.forEach(item => {
                    counterMap[item.key] = item.value;
                });
                setCounters(counterMap);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCounters(false);
        }
    };

    const fetchTestimonials = async () => {
        try {
            const { data } = await supabase.from('testimonials').select('*').limit(10).order('created_at', { ascending: false });
            if (data) setTestimonials(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTestimonials(false);
        }
    };

    const onGetSampleSubmit = async (data) => {
        try {
            const { error } = await supabase.from('inquiries').insert([{
                type: 'sample',
                name: data.name,
                contact: data.contact,
                email: data.email,
                details: { ...data }
            }]);

            if (error) throw error;
            alert('Request submitted! We will contact you soon.');
            setShowSampleModal(false);
            reset();
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        }
    };


    return (
        <div style={{ backgroundColor: '#F9F9F8' }}> {/* Light beige background for whole page */}
            <Hero onGetSampleClick={() => setShowSampleModal(true)} />

            {/* 1. About Slag Wala Section */}
            <section className="py-5" style={sectionBg}>
                <div style={overlay}></div>

                <Container style={content}>
                    <RevealOnScroll>
                        <Row className="align-items-center gy-4">
                            <Col lg={7}>
                                <h1 className="fw-bold mb-4" style={{ color: '#0f172a' }}>About Slag Wala</h1>
                                <p className="text-secondary mb-3 text-justify">
                                    Ram Innovation and Solutions, a proud venture of the Mandhana Engineer’s Group, has been serving the industrial and construction sectors with dedication and excellence for the past seven years. Our core mission is to transform industrial waste into valuable resources, ensuring optimum utilization and promoting sustainable practices across various industries.

                                    Over the years, we have built a strong and trusted network of 150+ vendors and cater to more than 150 clients across the Vidarbha region. Our consistent and timely services have helped us successfully deliver over 15,000 truckloads of material to date, strengthening our position as a reliable partner in the construction market.

                                    With a focus on innovation, sustainability, and customer satisfaction, Ram Innovation and Solutions continues to provide dependable material supply solutions while contributing to a cleaner and more efficient industrial ecosystem.
                                </p>
                                <p className="text-secondary text-justify">
                                    We are proudly associated with a wide network of leading industries across Vidarbha and Central India for waste management, material utilization, and sustainable resource handling. Our major clients include Evonith Metallics Limited, Sunflag Iron & Steel Company Limited, Jindal Cement Industry Pvt. Ltd., Truform Engineering, Kaplansh Dhatu Udyog, Lloyds Steel, Bhilai Steel Plant, Kanodiya Cement, Hindustan Copper Limited, and various departments of PWD. Through these collaborations, we ensure efficient processing and responsible handling of industrial by-products, contributing to cleaner operations and circular economy practices.
                                </p>
                            </Col>

                            <Col lg={5} className="text-center">
                                <div className="mx-auto d-flex align-items-center justify-content-center bg-white shadow-sm rounded-circle border border-2"
                                    style={{ width: '300px', height: '300px', borderColor: '#8ba665' }}
                                >
                                    {/* Your Logo */}
                                    <img
                                        src="/assets/logo.png"
                                        alt="Slag Wala Logo"
                                        className="img-fluid rounded-circle"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </RevealOnScroll>
                </Container>
            </section>

            {/* 2. About Slag Sand Section */}
            <section className="py-5" style={sectionBg}>
                <div style={overlay}></div>

                <Container style={content}>
                    <RevealOnScroll>
                        <Row className="align-items-center gy-4">

                            {/* Logo on Left */}
                            <Col lg={5} className="text-center order-lg-1 order-1">
                                <div
                                    className="mx-auto d-flex align-items-center justify-content-center bg-white shadow-sm rounded-circle border border-2"
                                    style={{ width: '270px', height: '270px', borderColor: '#8ba665' }}
                                >
                                    <img
                                        src="/assets/sand.jpg"
                                        alt="Slag Sand Logo"
                                        className="img-fluid rounded-circle"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </Col>

                            {/* Text on Right */}
                            <Col lg={7} className="order-lg-2 order-2">
                                <h1 className="fw-bold mb-4" style={{ color: '#0f172a' }}>About Slag Sand</h1>
                                <p className="text-secondary mb-4 text-justify">
                                    Slag Sand is an innovative, eco-friendly construction material made from
                                    <strong> Granulated Blast Furnace Slag (GBFS)</strong>, designed as a reliable
                                    alternative to natural river and crushed sand. It is scientifically processed
                                    to deliver consistent quality, better workability, and superior durability—
                                    making it ideal for concrete, mortar, precast products, and infrastructure development.
                                </p>
                                <p className="text-secondary text-justify">
                                    <strong>Being nearly 30% lighter than river sand</strong>, Slag Sand offers
                                    more volume per ton, easier handling, and lower transportation cost. It is widely
                                    preferred by RMC plants and contractors for its excellent bonding strength,
                                    uniform gradation, and long-term performance. By recycling industrial by-products,
                                    it supports green construction and helps reduce environmental damage—making Slag Sand
                                    the smart, sustainable choice for the future.
                                </p>
                            </Col>

                        </Row>
                    </RevealOnScroll>
                </Container>
            </section>

            {/* 5. Difference Between River Sand & Slag Sand */}
            <section
                className="py-5"
                style={{
                    backgroundImage: "url('https://i.pinimg.com/1200x/e6/bd/f6/e6bdf673753a8450ea3f9f34e881c38f.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                }}
            >
                {/* OVERLAY BEHIND THE CONTENT */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(5px)",
                        zIndex: 0,
                    }}
                ></div>

                {/* CONTENT ABOVE OVERLAY */}
                {/* Custom CSS for responsive scaling */}
                <style>
                    {`
                        .comparison-card-left {
                            background: rgba(255, 255, 255, 0.5);
                            border-top-left-radius: 24px;
                            border-bottom-left-radius: 24px;
                            border-right: 1px solid rgba(0,0,0,0.05);
                            transition: 0.3s ease;
                        }
                        
                        .comparison-card-right {
                            background: white;
                            border-radius: 24px;
                            transform: scale(1.05);
                            z-index: 2;
                            box-shadow: 0 20px 40px rgba(46, 125, 50, 0.15);
                            transition: 0.3s ease;
                        }

                        .comparison-card-right:hover {
                            transform: scale(1.08);
                            box-shadow: 0 25px 50px rgba(46, 125, 50, 0.25);
                        }

                        /* Responsive adjustments */
                        @media (max-width: 991px) {
                            .comparison-card-left {
                                border-radius: 24px;
                                margin-bottom: 2rem;
                                border-right: none;
                            }
                            
                            .comparison-card-right {
                                transform: scale(1) !important;
                                z-index: 1;
                            }
                            
                            .comparison-card-right:hover {
                                transform: translateY(-5px) !important;
                            }
                        }
                    `}
                </style>

                <Container style={{ position: "relative", zIndex: 1 }}>
                    <RevealOnScroll>
                        <div className="text-center mb-5">
                            <h2 className="fw-bold display-5 mb-3" style={{ color: "#0f172a" }}>
                                Why Upgrade to Slag Sand?
                            </h2>
                            <p className="text-secondary fs-5">A clear comparison for a smarter choice</p>
                        </div>

                        <Row className="g-0 align-items-center justify-content-center">
                            {/* LEFT CARD - NORMAL SAND */}
                            <Col lg={5} md={10}>
                                <div
                                    className="card h-100 p-4 border-0 position-relative comparison-card-left"
                                    onMouseEnter={(e) => {
                                        if (window.innerWidth > 991) {
                                            e.currentTarget.style.transform = "translateY(-5px)";
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (window.innerWidth > 991) {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
                                        }
                                    }}
                                >
                                    <div className="text-center mb-4 opacity-75">
                                        <h4 className="fw-bold text-secondary mb-1">Normal River Sand</h4>
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">Traditional Choice</span>
                                    </div>

                                    <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                                        {[
                                            "High cost & inconsistent quality",
                                            "Depletes natural river beds",
                                            "High silt & clay content",
                                            "Requires washing & sieving",
                                            "Environmentally harmful"
                                        ].map((text, i) => (
                                            <li key={i} className="d-flex align-items-center text-secondary">
                                                <XCircle size={20} className="text-danger me-3 flex-shrink-0" />
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Col>

                            {/* RIGHT CARD - SLAG SAND (HIGHLIGHTED) */}
                            <Col lg={5} md={10}>
                                <div className="card h-100 p-5 border-0 shadow-lg position-relative comparison-card-right">
                                    <div className="position-absolute top-0 start-50 translate-middle">
                                        <span className="badge bg-success text-white px-4 py-2 rounded-pill shadow-sm text-uppercase fw-bold tracking-wider">Recommended</span>
                                    </div>

                                    <div className="text-center mb-4">
                                        <h3 className="fw-bold text-success mb-1">Eco Slag Sand</h3>
                                        <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">Smart Innovation</span>
                                    </div>

                                    <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                                        {[
                                            "Consistent quality & IS Certified",
                                            "30% lighter (More volume/ton)",
                                            "Zero silt & excellent bonding",
                                            "Ready to use (No wastage)",
                                            "Eco-friendly & Sustainable"
                                        ].map((text, i) => (
                                            <li key={i} className="d-flex align-items-center fw-medium text-dark">
                                                <CheckCircle2 size={24} className="text-success me-3 flex-shrink-0" />
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Col>
                        </Row>
                    </RevealOnScroll>
                </Container>
            </section>

            {/* 3. Technical Specifications Section */}
            <section className="py-5 position-relative" style={{ overflow: 'hidden' }}>
                {/* Background layer with image and gradient */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: "linear-gradient(to right, rgba(22, 21, 21, 0.62), rgba(54, 52, 52, 0.15)), url('https://i.pinimg.com/736x/03/d2/c8/03d2c846665ff62478fd5ab26bf02214.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundBlendMode: 'overlay',
                    zIndex: 0
                }}></div>

                <Container style={{ position: 'relative', zIndex: 1 }}>
                    <RevealOnScroll>
                        <Row>
                            <Col lg={5} xl={6} className="d-flex align-items-center mb-5 mb-lg-0">
                                <div className="p-4">
                                    <h3 className="display-6 fw-bold mb-4" style={{ color: '#2E7D32' }}>Technical Specifications</h3>
                                    <div className="fs-5" style={{ minHeight: '120px', color: '#1a1a1a' }}>
                                        <p><strong>
                                            Our Slag Sand is scientifically processed to deliver superior compressive strength and optimal particle size distribution. Unlike traditional river sand, it offers consistent quality and chemical stability, ensuring your construction allows for reduced cement consumption while maintaining exceptional durability. Experience the future of sustainable construction with material that meets rigorous international standards.</strong>
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col lg={7} xl={6}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.85)', // Increased opacity for contrast against dark gradient
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '24px',
                                    padding: '2rem',
                                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                                }}>
                                    <Row className="align-items-center mb-4">
                                        <Col md={7}>
                                            <h2 className="fw-bold mb-0" style={{ color: '#1a4e23' }}>Specifications</h2>
                                        </Col>
                                        <Col md={5} className="text-md-end mt-3 mt-md-0">
                                            <Form.Select
                                                size="sm"
                                                value={techSpecTab}
                                                onChange={(e) => setTechSpecTab(e.target.value)}
                                                className="border-success text-success fw-bold shadow-sm"
                                                style={{ borderRadius: '8px' }}
                                            >
                                                <option value="physical">Physical</option>
                                                <option value="chemical">Chemical</option>
                                                <option value="mechanical">Mechanical</option>
                                                <option value="compliance">Standards</option>
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    <div className="bg-white rounded-4 p-3 shadow-sm border border-light" style={{ height: '300px', overflowY: 'auto' }}>
                                        {techSpecTab === 'physical' && (
                                            <>
                                                <h5 className="fw-bold text-success mb-3">Physical Properties</h5>
                                                <Table hover responsive size="sm" className="mb-0 small">
                                                    <thead className="bg-success text-white rounded-3">
                                                        <tr>
                                                            <th className="bg-success text-white py-2 ps-3 rounded-start-3">Parameter</th>
                                                            <th className="bg-success text-white py-2">Range</th>
                                                            <th className="bg-success text-white py-2 pe-3 rounded-end-3">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="align-middle">
                                                        <tr><td className="ps-3 fw-bold text-secondary">Bulk Density</td><td>1100–1300 kg/m³</td><td>30% lighter</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Specific Gravity</td><td>2.4–2.6</td><td>Higher yield</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Fineness Modulus</td><td>2.4–3.0</td><td>Concrete/blocks</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Moisture</td><td>2–8%</td><td>Weather dep.</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Absorption</td><td>6–10%</td><td>Workability</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Particle Size</td><td>0–4.75 mm</td><td>Well graded</td></tr>
                                                    </tbody>
                                                </Table>
                                            </>
                                        )}

                                        {techSpecTab === 'chemical' && (
                                            <>
                                                <h5 className="fw-bold text-success mb-3">Chemical Properties</h5>
                                                <Table hover responsive size="sm" className="mb-0 small">
                                                    <thead>
                                                        <tr>
                                                            <th className="bg-success text-white py-2 ps-3 rounded-start-3">Component</th>
                                                            <th className="bg-success text-white py-2">Value</th>
                                                            <th className="bg-success text-white py-2 pe-3 rounded-end-3">Impact</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="align-middle">
                                                        <tr><td className="ps-3 fw-bold text-secondary">CaO</td><td>30–40%</td><td>Strength</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">SiO₂</td><td>30–38%</td><td>Durability</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Al₂O₃</td><td>10–18%</td><td>Workability</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">MgO</td><td>7–12%</td><td>Stability</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Fe₂O₃</td><td>0.5–1.5%</td><td>Structure</td></tr>
                                                    </tbody>
                                                </Table>
                                            </>
                                        )}

                                        {techSpecTab === 'mechanical' && (
                                            <>
                                                <h5 className="fw-bold text-success mb-3">Mechanical & Performance</h5>
                                                <Table hover responsive size="sm" className="mb-0 small">
                                                    <thead>
                                                        <tr>
                                                            <th className="bg-success text-white py-2 ps-3 rounded-start-3">Parameter</th>
                                                            <th className="bg-success text-white py-2">Range</th>
                                                            <th className="bg-success text-white py-2 pe-3 rounded-end-3">Remarks</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="align-middle">
                                                        <tr><td className="ps-3 fw-bold text-secondary">Strength (7d)</td><td>25–35 MPa</td><td>Early strength</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Strength (28d)</td><td>40–55 MPa</td><td>Durability</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Workability</td><td>High</td><td>Easy mixing</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Durability</td><td>Excellent</td><td>Weather proof</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">Soundness</td><td>IS Compliant</td><td>Stable volume</td></tr>
                                                    </tbody>
                                                </Table>
                                            </>
                                        )}

                                        {techSpecTab === 'compliance' && (
                                            <>
                                                <h5 className="fw-bold text-success mb-3">Compliance & Standards</h5>
                                                <Table hover responsive size="sm" className="mb-0 small">
                                                    <thead>
                                                        <tr>
                                                            <th className="bg-success text-white py-2 ps-3 rounded-start-3">Code</th>
                                                            <th className="bg-success text-white py-2 pe-3 rounded-end-3">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="align-middle">
                                                        <tr><td className="ps-3 fw-bold text-secondary">IS 383:2016</td><td>Fine Aggregate Code</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">IS 456:2000</td><td>Concrete Design</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">IS 2386</td><td>Testing Methods</td></tr>
                                                        <tr><td className="ps-3 fw-bold text-secondary">IRC Standards</td><td>Road & Infrastructure</td></tr>
                                                    </tbody>
                                                </Table>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </RevealOnScroll>
                </Container>
            </section>

            {/* 4. Where GBFS Sand Works Best */}
            <section className="py-5 " style={{ backgroundColor: "#dad6d0ff" }} >
                <Container>
                    <RevealOnScroll>
                        <h2 className="fw-bold text-center mb-5" style={{ color: "#0f172a" }}>
                            Where GBFS Sand Works Best
                        </h2>
                    </RevealOnScroll>

                    <Row className="g-4">

                        {[
                            {
                                img: "/assets/Construction.jpg",
                                title: "Ready-Mix Concrete (RMC)",
                                text: "Ideal for high-volume concrete production.",
                            },
                            {
                                img: "/assets/road.jpg",
                                title: "Cement Roads",
                                text: "Durable and cost-effective road construction.",
                            },
                            {
                                img: "/assets/building.jpg",
                                title: "Building Structures",
                                text: "Strong foundations and structural concrete.",
                            },
                            {
                                img: "/assets/brick.jpg",
                                title: "Plaster & Brick Work",
                                text: "Smooth finish and better bonding.",
                            },
                            {
                                img: "/assets/paver.jpg",
                                title: "Paver Blocks",
                                text: "Durable paving solutions for pathways.",
                            },
                            {
                                img: "/assets/pipes.jpg",
                                title: "Cement Pipes",
                                text: "Reliable for drainage and water systems.",
                            },
                        ].map((item, index) => (
                            <Col md={4} sm={6} key={index}>
                                <RevealOnScroll delay={index * 0.1}>
                                    <div
                                        className="card h-100 shadow-sm border-0"
                                        style={{ transition: "0.3s ease" }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-6px)";
                                            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
                                        }}
                                    >

                                        {/* Responsive Bootstrap Card Image */}
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="card-img-top"
                                            style={{
                                                height: "200px",
                                                objectFit: "cover",
                                            }}
                                        />

                                        <div className="card-body text-center">
                                            <h6 className="fw-bold">{item.title}</h6>
                                            <p className="text-secondary small">{item.text}</p>
                                        </div>

                                    </div>
                                </RevealOnScroll>
                            </Col>
                        ))}

                    </Row>
                </Container>
            </section>
            {/* 5. Our Achievements */}
            <section
                className="position-relative d-flex flex-column justify-content-center"
                style={{
                    backgroundImage: "url('https://i.pinimg.com/736x/cb/24/df/cb24dfa0d604d31e7a0def6df155507e.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "70vh",
                    padding: "4rem 0"
                }}
            >
                {/* Dark overlay for better readability */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, rgba(233, 238, 235, 0.85), rgba(224, 211, 216, 0.18))",
                    zIndex: 0
                }}></div>

                <Container style={{ position: "relative", zIndex: 1 }}>
                    <Row className="align-items-center">
                        {/* Left side - Title */}
                        <Col lg={5} className="mb-4 mb-lg-0">
                            <RevealOnScroll direction="right">
                                <h1 className="fw-bold display-4" style={{ color: "#0f172a" }}>
                                    Our Achievements
                                </h1>
                                <p className="text-secondary fs-5 mt-3">
                                    Building trust through excellence and consistency
                                </p>
                            </RevealOnScroll>
                        </Col>

                        {/* Right side - Glass container with stats */}
                        <Col lg={7}>
                            <Row className="g-4">
                                {(() => {
                                    // Automatic Increment Logic (Hybrid Approach)
                                    // Start Date: Dec 23, 2025
                                    const START_DATE = new Date("2025-12-23");
                                    const now = new Date();
                                    const diffTime = Math.max(0, now - START_DATE);
                                    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

                                    // Base values from Database (fallback to defaults if null)
                                    const baseCustomers = counters.total_customers || 250;
                                    const baseOrders = counters.orders_delivered || 15000;

                                    // Calculate final values: Base (DB) + Auto-Growth
                                    const currentCustomers = baseCustomers + (diffWeeks * 2);
                                    const currentOrders = baseOrders + (diffWeeks * 51);

                                    return [
                                        { value: currentCustomers, label: "Total Customers" },
                                        { value: currentOrders, label: "Orders Delivered" },
                                        { value: counters.pincodes_served || 110, label: "Pincodes Served" },
                                        { value: counters.marketers_onboarded || 75, label: "Marketers Onboarded" },
                                    ].map((item, index) => (
                                        <Col md={6} key={index}>
                                            <RevealOnScroll delay={index * 0.1}>
                                                <StatCard item={item} index={index} />
                                            </RevealOnScroll>
                                        </Col>
                                    ));
                                })()}
                            </Row>
                        </Col>
                    </Row>
                </Container>

                {/* Global keyframes — works everywhere */}
                <style>
                    {`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}
                </style>
            </section>

            {/* 6. Testimonials Section - Split Sliding Rows */}
            <section id="testimonials" className="position-relative d-flex flex-column justify-content-center" style={{
                background: 'linear-gradient(to right, #ffffffff 0%, #6b8383ff 100%)',
                minHeight: 'auto',
                padding: '4rem 0',
                overflow: 'hidden'
            }}>
                <style>
                    {`
        @keyframes slideLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        @keyframes slideRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
        }

        .slider-row {
            display: flex;
            white-space: nowrap;
            gap: 25px;
            width: 100%;
        }

        .slide-track {
            display: flex;
            gap: 25px;
            width: max-content;
        }

        .slide-left {
            animation: slideLeft 40s linear infinite;
        }

        .slide-right {
            animation: slideRight 40s linear infinite;
        }

        .testimonial-card {
            width: 350px;
            display: inline-block;
            white-space: normal;
        }

        /* Pause on hover */
        .slide-track:hover {
            animation-play-state: paused;
        }
        `}
                </style>

                <Container>
                    <RevealOnScroll direction="down">
                        <h1 className="text-center fw-bold mb-5" style={{ color: '#131313ff' }}>
                            Our Testimonials
                        </h1>
                    </RevealOnScroll>
                </Container>

                {(() => {
                    // Logic to split testimonials into two unique rows
                    const data = loadingTestimonials ? [] : testimonials.length ? testimonials : [
                        { client_name: "Sneha Kulkarni", content: "Much better than normal river sand. Highly recommended!" },
                        { client_name: "Amit Jadhav", content: "Perfect grain size. Great for concrete work." },
                        { client_name: "Rohit Sharma", content: "Quality is excellent. Construction strength improved." },
                        { client_name: "Priya Desai", content: "Timely delivery and great service. Will order again." },
                        { client_name: "Vikram Singh", content: "Eco-friendly and cost-effective. Best decision." },
                        { client_name: "Anjali Mehta", content: "Stronger binding than local sand. Very satisfied." }
                    ];

                    // Split into two halves
                    const half = Math.ceil(data.length / 2);
                    const row1 = data.slice(0, half);
                    const row2 = data.slice(half);

                    // Duplicate ONLY for seamless scrolling (visual purposes only, main content is unique per row)
                    // We duplicate the row content 4 times to ensure it fills the width for animation
                    const row1Display = [...row1, ...row1, ...row1, ...row1];
                    const row2Display = [...row2, ...row2, ...row2, ...row2];

                    return (
                        <>
                            {/* ========== ROW 1 – SLIDES LEFT (First Half) ========== */}
                            <div className="slider-row mb-4">
                                <div className="slide-track slide-left">
                                    {row1Display.map((item, index) => (
                                        <div key={`r1-${index}`} className="testimonial-card p-4 bg-white border rounded-4 shadow-sm text-center">
                                            <p className="text-muted fst-italic mb-3">"{item.content}"</p>
                                            <h6 className="fw-bold mb-0">- {item.client_name}</h6>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ========== ROW 2 – SLIDES RIGHT (Second Half) ========== */}
                            <div className="slider-row">
                                <div className="slide-track slide-right">
                                    {row2Display.map((item, index) => (
                                        <div key={`r2-${index}`} className="testimonial-card p-4 bg-white border rounded-4 shadow-sm text-center">
                                            <p className="text-muted fst-italic mb-3">"{item.content}"</p>
                                            <h6 className="fw-bold mb-0">- {item.client_name}</h6>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    );
                })()}
            </section>

            <FloatingChat />
            {/* Order Sample Modal (Updated) */}
            <style>
                {`
                    .custom-modal-content .modal-content {
                        border-radius: 20px;
                        border: none;
                        overflow: hidden;
                    }
                    .custom-modal-content .modal-header {
                        background: #f8f9fa;
                        border-bottom: 1px solid #eee;
                    }
                    @media (min-width: 992px) {
                        .custom-modal-content .modal-dialog {
                            max-width: 650px; /* Smaller rectangular view */
                            margin-top: 8rem; /* Push down slightly */
                        }
                    }
                    @media (max-width: 576px) {
                        .custom-modal-content .modal-dialog {
                            margin: 1rem;
                            max-width: 95%; /* Slightly smaller width on mobile */
                            margin-top: 20vh; /* Push down on mobile too */
                        }
                        .custom-modal-content .modal-content {
                            min-height: auto;
                        }
                    }
                `}
            </style>
            <Modal
                show={showSampleModal}
                onHide={() => setShowSampleModal(false)}
                /* Removed centered to allow custom top margin */
                className="custom-modal-content"
                backdrop="static"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold w-100 text-center text-black fs-3">Order a Sample</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-3 pt-0">
                    <p className="text-center text-muted mb-3 small">Select a sample pack to test the quality of Eco Slag Sand.</p>
                    <Form onSubmit={handleSubmit(onGetSampleSubmit)}>
                        <div className="mb-2">
                            <Form.Label className="fw-semibold small">Full Name</Form.Label>
                            <Form.Control className="bg-light border-0 py-2" type="text" placeholder="Enter your full name" required {...register("name")} />
                        </div>

                        <div className="mb-2">
                            <Form.Label className="fw-semibold small">Contact Number</Form.Label>
                            <Form.Control className="bg-light border-0 py-2" type="tel" placeholder="Enter mobile number" required {...register("contact")} />
                        </div>

                        <div className="mb-2">
                            <Form.Label className="fw-semibold small">Delivery Address</Form.Label>
                            <Form.Control className="bg-light border-0 py-2" as="textarea" rows={2} placeholder="Complete delivery address" required {...register("address")} />
                        </div>

                        <div className="mb-3">
                            <Form.Label className="fw-semibold small">Select Quantity</Form.Label>
                            <Form.Select className="bg-light border-0 py-2" {...register("quantity")}>
                                <option value="500g - ₹49">500g – ₹49 (Courier Charges)</option>
                                <option value="1Kg - ₹99">1Kg – ₹99 (Courier Charges)</option>
                                <option value="5Kg - ₹199">5Kg – ₹199 (Courier Charges)</option>
                            </Form.Select>
                        </div>

                        <Button variant="dark" size="lg" type="submit" className="w-100 fw-bold rounded-pill text-uppercase tracking-wider shadow-sm" style={{ backgroundColor: 'black', border: 'none' }}>
                            Order Now
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div >
    );
};

export default Home;
