import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { TrendingUp, Users, Award } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import {
    Briefcase,
    CheckCircle,
    Globe
} from "lucide-react";
import RevealOnScroll from '../components/RevealOnScroll';


const WorkWithUs = () => {
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const [submitted, setSubmitted] = useState(false);
    const pincode = watch('pincode');

    React.useEffect(() => {
        if (pincode && pincode.length === 6) {
            fetch(`https://api.postalpincode.in/pincode/${pincode}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data[0].Status === "Success") {
                        const details = data[0].PostOffice[0];
                        setValue('city', details.Block === "NA" ? details.Name : details.Block);
                        setValue('state', details.State);
                    }
                })
                .catch(err => console.error("Error fetching pincode details:", err));
        }
    }, [pincode, setValue]);

    const onSubmit = async (data) => {
        try {
            // Combine location details for backend compatibility
            const locationString = `${data.city}, ${data.state} - ${data.pincode}`;

            const { error } = await supabase.from('marketers').insert([{
                name: data.name,
                contact: data.contact,
                email: data.email,
                location: locationString,
                experience: data.experience,
                status: 'pending'
            }]);

            if (error) throw error;

            if (error) throw error;

            setSubmitted(true);
            reset();
        } catch (error) {
            console.error('Error submitting application:', error);
            alert(`Something went wrong: ${error.message || JSON.stringify(error)}`);
        }
    };

    return (
        <div>

            {/* ---- HERO SECTION ---- */}
            <div className="position-relative py-5 mb-5" style={{ background: '#0f172a' }}>
                <Container className="text-center position-relative z-1">
                    <RevealOnScroll direction="down">
                        <h1 className="display-4 fw-bold text-white mb-2">Become a Marketer</h1>
                        <p className="text-white-50 lead mx-auto" style={{ maxWidth: "650px" }}>
                            Join our network and earn while promoting sustainable construction.
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

            {/* ---- MAIN CONTENT ---- */}
            <section className="py-5" style={{ backgroundColor: "#f9fafb" }}>
                <Container>
                    <Row className="gy-4">

                        {/* ========= LEFT COLUMN ========= */}
                        <Col md={6}>
                            <RevealOnScroll direction="left" delay={0.2}>
                                <h2 className="mb-4 fw-bold" style={{ color: "#0f172a" }}>
                                    Why Partner With Us?
                                </h2>

                                <div className="d-flex gap-3 mb-4">
                                    <TrendingUp size={36} style={{ color: "black" }} />
                                    <div>
                                        <h4 className="fw-semibold">High Growth Potential</h4>
                                        <p className="text-muted mb-0">
                                            The demand for eco-friendly building materials is sky-rocketing.
                                            Be at the forefront of this change.
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mb-4">
                                    <Users size={36} style={{ color: "black" }} />
                                    <div>
                                        <h4 className="fw-semibold">Community & Support</h4>
                                        <p className="text-muted mb-0">
                                            We provide full marketing support, training, and a dedicated team
                                            to help you succeed.
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mb-4">
                                    <Award size={36} style={{ color: "black" }} />
                                    <div>
                                        <h4 className="fw-semibold">Competitive Commissions</h4>
                                        <p className="text-muted mb-0">
                                            Earn attractive margins on every order generated through your network.
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mb-4">
                                    <Briefcase size={36} style={{ color: "black" }} />
                                    <div>
                                        <h4 className="fw-semibold">Professional Opportunities</h4>
                                        <p className="text-muted mb-0">
                                            Build strong business relationships with long-term growth
                                            and scalable opportunities.
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mb-4">
                                    <CheckCircle size={36} style={{ color: "black" }} />
                                    <div>
                                        <h4 className="fw-semibold">Trusted & Transparent</h4>
                                        <p className="text-muted mb-0">
                                            Work with a reliable partner that prioritizes quality,
                                            ethics, and transparency.
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mb-4">
                                    <Globe size={36} style={{ color: "black" }} />
                                    <div>
                                        <h4 className="fw-semibold">Expanding Reach</h4>
                                        <p className="text-muted mb-0">
                                            Be part of a growing network with expanding presence
                                            across regions and markets.
                                        </p>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        </Col>

                        {/* ========= RIGHT COLUMN - FORM ========= */}
                        <Col md={6}>
                            <RevealOnScroll direction="right" delay={0.4}>
                                <Card className="shadow-lg border-0 rounded-4">
                                    <Card.Header
                                        className="bg-white p-4 pb-0 border-0"
                                        style={{ borderRadius: "20px 20px 0 0" }}
                                    >
                                        <h3 className="fw-bold">Application Form</h3>
                                    </Card.Header>

                                    <Card.Body className="p-4">
                                        {submitted ? (
                                            <div className="text-center py-5">
                                                <div className="mb-4 text-success">
                                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                        <polyline points="22 4 12 14.01 9 11.01" />
                                                    </svg>
                                                </div>
                                                <h3 className="fw-bold text-dark mb-3">Application Submitted!</h3>
                                                <p className="text-muted mb-4">
                                                    Thank you for your interest. Our team will review your application and contact you soon.
                                                </p>
                                                <Button
                                                    variant="outline-dark"
                                                    className="px-4 py-2 rounded-pill"
                                                    onClick={() => setSubmitted(false)}
                                                >
                                                    Submit Another Application
                                                </Button>
                                            </div>
                                        ) : (
                                            <Form onSubmit={handleSubmit(onSubmit)}>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Full Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Your Name"
                                                        required
                                                        {...register("name")}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Contact Number</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        placeholder="Phone Number"
                                                        required
                                                        {...register("contact")}
                                                    />
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-semibold">Email Address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Email"
                                                        required
                                                        {...register("email")}
                                                    />
                                                </Form.Group>

                                                <Row>
                                                    <Col md={12} className="mb-3">
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">Pincode</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Enter 6-digit Pincode"
                                                                maxLength={6}
                                                                required
                                                                {...register("pincode")}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">City</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="City"
                                                                required
                                                                {...register("city")}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <Form.Group>
                                                            <Form.Label className="fw-semibold">State</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="State"
                                                                required
                                                                {...register("state")}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-semibold">Experience (Optional)</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        placeholder="Tell us about your background..."
                                                        {...register("experience")}
                                                    />
                                                </Form.Group>

                                                <div className="d-grid">
                                                    <Button size="lg" type="submit" style={{ backgroundColor: "#0f172a", border: "none" }}>
                                                        Submit Application
                                                    </Button>

                                                </div>

                                            </Form>
                                        )}
                                    </Card.Body>
                                </Card>
                            </RevealOnScroll>
                        </Col>

                    </Row>
                </Container>
            </section>

        </div>
    );
};

export default WorkWithUs;