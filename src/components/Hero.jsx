import React, { useState } from 'react';
import { Container, Row, Col, Button, Carousel, Form, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import EconomicCalculator from './EconomicCalculator';
const Hero = ({ onGetSampleClick }) => {
    return (
        <div
            className="hero-section position-relative d-flex justify-content-center align-items-center py-5 py-lg-0"
            style={{ minHeight: "90vh", overflowX: "hidden" }}
        >
            {/* CAROUSEL BACKGROUND */}
            <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, zIndex: "0" }}>
                <Carousel
                    controls={false}
                    indicators={false}
                    fade
                    interval={3000}
                    className="w-100 h-100"
                    style={{ height: "100%" }}
                >
                    {[1, 2, 3, 4, 5].map((num) => (
                        <Carousel.Item key={num} style={{ height: "85vh", width: "100%" }}>
                            <img
                                className="d-block"
                                src={`/images/hero-carousel/slide${num}.png`}
                                alt={`Slide ${num}`}
                                style={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                    minHeight: "85vh"
                                }}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>

            {/* DARK OVERLAY */}
            <div
                className="position-absolute w-100 h-100"
                style={{
                    background: "linear-gradient(rgba(14, 17, 22, 0.7), rgba(55, 78, 127, 0.17))",
                    top: 0,
                    left: 0,
                    zIndex: "1"
                }}
            ></div>

            {/* CONTENT */}
            <Container className="position-relative" style={{ zIndex: "2" }}>
                <Row className="align-items-center">
                    {/* LEFT COLUMN: TEXT */}
                    <Col lg={7} className="text-white text-center mb-5 mb-lg-0">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h1 className="display-4 fw-bold mb-4 lh-tight d-none d-lg-block">
                                Smart, Sustainable Alternative Solution to  <span style={{ background: 'linear-gradient(45deg, #f4a460, #87ceeb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>River Sand.</span>
                            </h1>
                            <h1 className="display-6 fw-bold mb-4 lh-tight d-lg-none">
                                Smart, Sustainable Alternative Solution to  <span style={{ background: 'linear-gradient(45deg, #f4a460, #87ceeb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>River Sand.</span>
                            </h1>

                            <p className="lead mb-5 opacity-90 fw-light mx-auto" style={{ maxWidth: '600px' }}>
                                Manufactured under controlled conditions to guarantee consistency, reliability, and long-term performance.This commitment to quality guarantees long-term performance you can trust.
                            </p>

                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                <Button
                                    as={Link}
                                    to="/order-now"
                                    className="btn-primary-custom btn-lg px-5 py-3 rounded-pill shadow-lg border-0"
                                    style={{ background: '#caf3ffff', color: '#0f172a', fontWeight: '500' }}
                                >
                                    Order Now
                                </Button>

                            </div>
                        </motion.div>
                    </Col>

                    {/* RIGHT COLUMN: CALCULATOR */}
                    <Col lg={5} id="calculator">
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="h-100"
                        >
                            <EconomicCalculator />
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div >
    );
};

export default Hero;
