/* eslint-disable react-hooks/static-components */
import React, { useEffect, useState } from 'react';
import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, Home, Printer, Share2, Package, CreditCard, Calendar } from 'lucide-react';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderDetails = location.state?.orderDetails || {};
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoaded(true);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.1,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Simple Confetti implementation
    const Confetti = () => {
        const colors = ['#000', '#333', '#666', '#999'];
        return (
            <div className="position-fixed top-0 start-0 w-100 h-100 placeholder-glow" style={{ pointerEvents: 'none', zIndex: 0 }}>
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            top: -10,
                            left: `${Math.random() * 100}%`,
                            opacity: 1,
                            scale: Math.random() * 1 + 0.5,
                            rotate: 0
                        }}
                        animate={{
                            top: '120%',
                            left: `${(Math.random() * 20 - 10) + (i * 3.33)}%`,
                            opacity: 0,
                            rotate: Math.random() * 720
                        }}
                        transition={{
                            duration: Math.random() * 2 + 2,
                            ease: "linear",
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                        style={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-vh-100 position-relative overflow-hidden d-flex align-items-center py-5"
            style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>

            {/* Dynamic Background Elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute', top: '-10%', left: '-10%',
                        width: '40%', height: '40%',
                        background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        x: [0, -40, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute', bottom: '-10%', right: '-10%',
                        width: '50%', height: '50%',
                        background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }}
                />
            </div>

            // eslint-disable-next-line react-hooks/static-components, react-hooks/static-components
            <Confetti />

            <Container className="position-relative" style={{ zIndex: 1 }}>
                <Row className="justify-content-center">
                    <Col lg={8} xl={7}>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate={isLoaded ? "visible" : "hidden"}
                        >
                            <Card className="border-0 shadow-2xl rounded-5 overflow-hidden"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                                }}>
                                <Card.Body className="p-4 p-md-5">
                                    <div className="text-center mb-5">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 20,
                                                delay: 0.2
                                            }}
                                            className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '50%',
                                                backgroundColor: '#000',
                                                color: '#fff',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                                            }}
                                        >
                                            <Check size={60} strokeWidth={3} />
                                        </motion.div>

                                        <motion.h1 variants={itemVariants} className="display-5 fw-bold text-dark mb-2">
                                            Order Confirmed!
                                        </motion.h1>
                                        <motion.p variants={itemVariants} className="lead text-muted mx-auto" style={{ maxWidth: '450px' }}>
                                            Success! Your transaction was processed securely. You'll receive a confirmation email shortly.
                                        </motion.p>
                                    </div>

                                    <Row className="g-4 mb-5">
                                        <Col md={12}>
                                            <motion.div variants={itemVariants} className="p-4 rounded-4" style={{ backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                <div className="row g-4 text-center text-md-start">
                                                    <div className="col-md-4 border-end-md">
                                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                                                            <Package size={18} className="me-2 opacity-50" />
                                                            <small className="text-muted text-uppercase fw-bold ls-wider" style={{ fontSize: '0.65rem' }}>Order ID</small>
                                                        </div>
                                                        <p className="fw-bold mb-0 text-dark">{orderDetails.id || 'SW-82741'}</p>
                                                    </div>
                                                    <div className="col-md-4 border-end-md">
                                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                                                            <CreditCard size={18} className="me-2 opacity-50" />
                                                            <small className="text-muted text-uppercase fw-bold ls-wider" style={{ fontSize: '0.65rem' }}>Amount Paid</small>
                                                        </div>
                                                        <p className="fw-bold mb-0 text-dark">₹{orderDetails.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                                                            <Calendar size={18} className="me-2 opacity-50" />
                                                            <small className="text-muted text-uppercase fw-bold ls-wider" style={{ fontSize: '0.65rem' }}>Date</small>
                                                        </div>
                                                        <p className="fw-bold mb-0 text-dark">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Col>
                                    </Row>

                                    {orderDetails.paymentId && (
                                        <motion.div variants={itemVariants} className="text-center mb-5">
                                            <small className="text-muted mb-1 d-block opacity-75">Transaction Reference</small>
                                            <code className="bg-light px-3 py-2 rounded-pill text-dark fw-medium" style={{ fontSize: '0.9rem' }}>
                                                {orderDetails.paymentId}
                                            </code>
                                        </motion.div>
                                    )}

                                    <motion.div variants={itemVariants} className="d-sm-flex gap-3 justify-content-center">
                                        <Button
                                            variant="dark"
                                            size="lg"
                                            className="px-5 py-3 rounded-pill shadow-lg fw-bold d-flex align-items-center justify-content-center gap-2 mb-3 mb-sm-0 w-100 w-sm-auto"
                                            onClick={() => navigate('/')}
                                            style={{ minWidth: '200px' }}
                                        >
                                            <Home size={20} /> Back to Home
                                        </Button>
                                        <Button
                                            variant="outline-dark"
                                            size="lg"
                                            className="px-5 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto"
                                            onClick={() => window.print()}
                                            style={{ minWidth: '200px' }}
                                        >
                                            <Printer size={20} /> Print Receipt
                                        </Button>
                                    </motion.div>
                                </Card.Body>
                            </Card>

                            <motion.div
                                variants={itemVariants}
                                className="text-center mt-5"
                            >
                                <div className="d-flex align-items-center justify-content-center gap-4 opacity-50 grayscale">
                                    <span className="small fw-bold text-uppercase ls-wider">Member of</span>
                                    <img src="https://via.placeholder.com/120x30?text=Eco+Standards" alt="Eco Standards" height="20" />
                                    <img src="https://via.placeholder.com/100x30?text=Build+Safe" alt="Build Safe" height="20" />
                                </div>
                                <p className="text-muted small mt-4 opacity-75">
                                    Need help with your order? <a href="/contact" className="text-dark fw-bold text-decoration-none border-bottom">Contact Support</a>
                                </p>
                            </motion.div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>

            <style>
                {`
                    .shadow-2xl {
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                    }
                    .ls-wider {
                        letter-spacing: 0.1em;
                    }
                    .grayscale {
                        filter: grayscale(100%);
                    }
                    @media (min-width: 768px) {
                        .border-end-md {
                            border-right: 1px solid rgba(0,0,0,0.1);
                        }
                    }
                    @media print {
                        .min-vh-100 { min-height: auto !important; padding: 0 !important; background: white !important; }
                        .btn, .placeholder-glow, style, .mt-5, .position-absolute { display: none !important; }
                        .card { box-shadow: none !important; border: 1px solid #eee !important; backdrop-filter: none !important; background: white !important; }
                    }
                `}
            </style>
        </div>
    );
};

export default OrderSuccess;
