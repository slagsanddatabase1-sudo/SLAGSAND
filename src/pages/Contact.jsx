import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { MapPin, Phone, Mail, Facebook, Linkedin, Instagram } from 'lucide-react';
import RevealOnScroll from '../components/RevealOnScroll';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';

const Contact = () => {
    const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
        mode: "onChange"
    });
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (data) => {
        try {
            const { error } = await supabase.from('inquiries').insert([{
                type: 'contact',
                name: data.name,
                contact: data.phone,
                email: data.email,
                details: { message: data.message },
                status: 'new'
            }]);

            if (error) throw error;
            setSubmitted(true);
            reset();
        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to send message: ${error.message || JSON.stringify(error)}`);
        }
    };

    return (
        <div style={{ backgroundColor: '#f9f9f8', minHeight: '100vh' }}>
            {/* Header Section */}
            <div className="position-relative py-5 mb-5" style={{ background: '#0f172a' }}>
                <Container className="text-center position-relative z-1">
                    <RevealOnScroll direction="down">
                        <h1 className="display-4 fw-bold text-white mb-2">Get In Touch</h1>
                        <p className="text-white-50 lead">We'd love to hear from you. Reach out to us for any queries.</p>
                    </RevealOnScroll>
                </Container>
                {/* Decorative background element */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)',
                    pointerEvents: 'none'
                }}></div>
            </div>

            <Container className="pb-5">
                <RevealOnScroll>
                    <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                        <Row className="g-0">
                            {/* Left Side: Contact Info */}
                            <Col lg={5} className="text-white position-relative p-5 d-flex flex-column justify-content-between"
                                style={{
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                }}>
                                {/* Overlay pattern or shape could go here */}
                                <div>
                                    <h3 className="fw-bold mb-4">Contact Information</h3>
                                    <p className="text-white-50 mb-5">
                                        Fill up the form and our Team will get back to you within 24 hours.
                                    </p>

                                    <div className="d-flex flex-column gap-4">
                                        <div className="d-flex align-items-start">
                                            <MapPin className="me-3 mt-1 flex-shrink-0" color="#22c55e" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Our Office</h6>
                                                <p className="mb-0 text-white-50 small">Block Number 5, Maheshwari Society,<br /> Wardhaman Nagar Square, Nagpur, Maharashtra 440008, India</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center">
                                            <Phone className="me-3 flex-shrink-0" color="#22c55e" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Phone</h6>
                                                <p className="mb-0 text-white-50 small">+91 9876543210</p>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center">
                                            <Mail className="me-3 flex-shrink-0" color="#22c55e" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Email</h6>
                                                <p className="mb-0 text-white-50 small">raminnovationsolutions@gmail.com</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-4">
                                    <div>
                                        <h6 className="mb-3 fw-bold">Follow Us</h6>
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-light" className="rounded-circle p-2 border-opacity-25" style={{ width: '40px', height: '40px' }} href="https://facebook.com" target="_blank"><Facebook size={18} /></Button>
                                            <Button variant="outline-light" className="rounded-circle p-2 border-opacity-25" style={{ width: '40px', height: '40px' }} href="https://instagram.com" target="_blank"><Instagram size={18} /></Button>
                                            <Button variant="outline-light" className="rounded-circle p-2 border-opacity-25" style={{ width: '40px', height: '40px' }} href="https://linkedin.com" target="_blank"><Linkedin size={18} /></Button>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex align-items-center gap-3 bg-white bg-opacity-10 p-2 rounded-4 border border-white border-opacity-10">
                                        <div className="bg-white p-1 rounded-3" style={{ width: '70px', height: '70px', flexShrink: 0 }}>
                                            <img src="/assets/whatsappqr.png" alt="WhatsApp QR Code" className="w-100 h-100 object-fit-contain" />
                                        </div>
                                        <div>
                                            <p className="mb-1 fw-bold text-white small lh-sm">Scan to Order</p>
                                            <p className="text-white-50 x-small mb-0 lh-sm" style={{ fontSize: '0.75rem', maxWidth: '120px' }}>You can now order us on WhatsApp!</p>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* Right Side: Form */}
                            <Col lg={7} className="bg-white p-5">
                                {submitted ? (
                                    <div className="text-center py-5">
                                        <div className="mb-4 text-success">
                                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                        </div>
                                        <h3 className="fw-bold text-dark mb-3">Message Sent!</h3>
                                        <p className="text-muted mb-4">Thank you for contacting us. We will get back to you shortly.</p>
                                        <Button
                                            variant="outline-dark"
                                            className="px-4 py-2 rounded-pill"
                                            onClick={() => setSubmitted(false)}
                                        >
                                            Send Another Message
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="fw-bold mb-4 text-dark">Send us a Message</h3>
                                        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-secondary">Your Name</Form.Label>
                                                        <Form.Control 
                                                            type="text" 
                                                            className="bg-light border-0 py-2" 
                                                            placeholder="Enter Your Name" 
                                                            isInvalid={!!errors.name}
                                                            {...register('name', { 
                                                                required: "Full name is required",
                                                                pattern: {
                                                                    value: /^[A-Za-z ]+$/,
                                                                    message: "Please enter a valid name (letters only, no numbers or special characters)"
                                                                },
                                                                minLength: { value: 2, message: "Name must be at least 2 characters" },
                                                                maxLength: { value: 50, message: "Name must not exceed 50 characters" }
                                                            })} 
                                                            onKeyDown={(e) => {
                                                                if (!/^[A-Za-z ]+$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== ' ') {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.name?.message || "Please enter a valid name (letters only, no numbers or special characters)"}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-secondary">Phone Number</Form.Label>
                                                        <Form.Control 
                                                            type="tel" 
                                                            className="bg-light border-0 py-2" 
                                                            placeholder="10-digit mobile number" 
                                                            isInvalid={!!errors.phone}
                                                            {...register('phone', { 
                                                                required: "Phone number is required",
                                                                pattern: { 
                                                                    value: /^[0-9]{10}$/, 
                                                                    message: "Please enter a valid 10-digit mobile number" 
                                                                },
                                                                minLength: { value: 10, message: "Must be exactly 10 digits" },
                                                                maxLength: { value: 10, message: "Must be exactly 10 digits" }
                                                            })} 
                                                            onInput={(e) => {
                                                                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                                            }}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.phone?.message || "Please enter a valid 10-digit mobile number"}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                                                        <Form.Control 
                                                            type="email" 
                                                            className="bg-light border-0 py-2" 
                                                            placeholder="Enter Your Email" 
                                                            isInvalid={!!errors.email}
                                                            {...register('email', { 
                                                                required: "Email is required",
                                                                pattern: { 
                                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                                                                    message: "Invalid email address" 
                                                                }
                                                            })} 
                                                        />
                                                        <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-secondary">Message</Form.Label>
                                                        <Form.Control 
                                                            as="textarea" 
                                                            rows={4} 
                                                            className="bg-light border-0 py-2" 
                                                            placeholder="How can we help you?" 
                                                            {...register('message')} 
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12} className="mt-4">
                                                    <Button 
                                                        type="submit" 
                                                        disabled={!isValid}
                                                        className="w-100 py-3 fw-bold rounded-3 shadow-sm" 
                                                        style={{ 
                                                            backgroundColor: !isValid ? '#94a3b8' : '#0f172a', 
                                                            border: 'none',
                                                            cursor: !isValid ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        Send Message
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </>
                                )}
                            </Col>
                        </Row>
                    </Card>
                </RevealOnScroll>

                {/* Map Section */}
                <RevealOnScroll delay={0.2}>
                    <div className="mt-5 rounded-4 overflow-hidden shadow-lg border border-white">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.271463625064!2d79.0962859!3d21.141592399999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4c0c7aaaaaaab%3A0x68afc14f3e71d963!2sAkhil%20Bharat%20Varshiya%20Maheshwari%20Mahasabha!5e0!3m2!1sen!2sin!4v1765998898142!5m2!1sen!2sin"
                            width="100%"
                            height="400"
                            style={{ border: 0, display: 'block' }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Google Map Location"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </RevealOnScroll>
            </Container>
        </div>
    );
};

export default Contact;
