import React, { useState, useEffect } from 'react';
import { Container, Accordion, Row, Col, Spinner, Button } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import RevealOnScroll from '../components/RevealOnScroll';

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: supabaseError } = await supabase
                .from('faqs')
                .select('*')
                .order('priority', { ascending: true });

            if (supabaseError) throw supabaseError;
            setFaqs(data || []);
        } catch (err) {
            console.error('Detailed Error fetching FAQs:', err);
            setError(err.message || 'Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 50 }
        }
    };

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingBottom: "6rem" }}>
            {/* Header omitted for brevity in replace content, keeping logic same */}
            {/* Header Section */}
            <div className="position-relative py-5 mb-5" style={{ background: '#0f172a' }}>
                <Container className="text-center position-relative z-1">
                    <RevealOnScroll direction="down">
                        <h1 className="display-4 fw-bold text-white mb-2">Frequently Asked Questions</h1>
                        <p className="text-white-50 lead mx-auto" style={{ maxWidth: "600px" }}>
                            Quick answers to your questions about Slag Sand.
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

            <Container fluid="lg">
                <Row className="justify-content-center">
                    <Col lg={9}>
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="dark" /></div>
                        ) : error ? (
                            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-danger p-4">
                                <h4 className="text-danger fw-bold">Unable to load FAQs</h4>
                                <p className="text-muted small">{error}</p>
                                <Button variant="dark" size="sm" onClick={fetchFaqs} className="mt-2">Try Again</Button>
                                <hr />
                                <small className="text-muted">Check if Vercel Environment Variables are correctly set and matches your local .env</small>
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Accordion className="custom-accordion">
                                    {faqs.map((faq, index) => (
                                        <motion.div variants={itemVariants} key={faq.id} className="mb-3">
                                            <Accordion.Item
                                                eventKey={faq.id.toString()}
                                                className="border-0 rounded-4 shadow-sm overflow-hidden"
                                                style={{ transition: "0.3s ease", backgroundColor: "white" }}
                                            >
                                                <Accordion.Header className="fw-semibold py-1">
                                                    <div className="d-flex align-items-center w-100">
                                                        <span className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-bold"
                                                            style={{ width: "32px", height: "32px", fontSize: "14px", flexShrink: 0 }}>
                                                            Q
                                                        </span>
                                                        <span className="text-dark fw-bold fs-5">{faq.question}</span>
                                                    </div>
                                                </Accordion.Header>
                                                <Accordion.Body className="text-secondary ps-5 ms-2 pt-0 pb-4" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                                                    <div className="border-start border-3 border-dark ps-4">
                                                        <div style={{ whiteSpace: 'pre-line' }}>{faq.answer}</div>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </motion.div>
                                    ))}
                                    {faqs.length === 0 && (
                                        <div className="text-center py-5 text-muted">No FAQs available at the moment.</div>
                                    )}
                                </Accordion>
                            </motion.div>
                        )}

                        {/* Contact CTA */}
                        {/* ... (rest of standard JSX) */}


                        {/* Contact CTA */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-dark text-white rounded-5 p-5 mt-5 text-center shadow-lg position-relative overflow-hidden"
                        >
                            <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)" }}></div>
                            <div className="position-relative z-1">
                                <h2 className="fw-bold mb-3">Still have questions?</h2>
                                <p className="text-white-50 mb-4 fs-5">Can't find the answer you're looking for? Please chat with our friendly team.</p>
                                <a href="/contact" className="btn btn-light btn-lg rounded-pill px-5 fw-bold d-inline-flex align-items-center hover-lift">
                                    <Phone size={20} className="me-2" />
                                    Contact Support
                                </a>
                            </div>
                        </motion.div>

                    </Col>
                </Row>
            </Container>

            <style>
                {`
                .custom-accordion .accordion-button:not(.collapsed) {
                    background-color: #ffffff;
                    color: #000000;
                    box-shadow: none;
                }
                .custom-accordion .accordion-button:focus {
                    box-shadow: none;
                }
                .custom-accordion .accordion-item:hover {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
                    transform: translateY(-2px);
                }
                .accordion-button::after {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000000'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
                    background-color: #f0f0f0;
                    border-radius: 50%;
                    padding: 1rem;
                    background-position: center;
                    background-size: 1rem;
                    transition: 0.3s;
                }
                .accordion-button:not(.collapsed)::after {
                    background-color: #000000;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
                }
                .hover-lift {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
                }
                `}
            </style>
        </div>
    );
};

export default FAQ;
