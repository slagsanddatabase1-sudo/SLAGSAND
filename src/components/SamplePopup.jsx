import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { X, ArrowRight } from 'lucide-react';
import { Form, Button, Container, Row, Col, Spinner } from 'react-bootstrap';

const SamplePopup = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm({
        mode: "onChange"
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchPincodeDetails = async (pincode) => {
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data && data[0].Status === "Success") {
                const details = data[0].PostOffice[0];
                setValue('city', details.District);
                setValue('state', details.State);
            } else {
                setValue('city', '');
                setValue('state', '');
            }
        } catch (error) {
            console.error("Failed to fetch pincode details", error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Parse quantity string "500g - ₹49" -> weight: "500g", price: 49
            let weight = data.quantity;
            let amount = 0;

            if (data.quantity.includes('₹')) {
                const parts = data.quantity.split(' - ₹');
                weight = parts[0]; // "500g"
                amount = parseFloat(parts[1]); // 49
            }

            const { data: orderData, error } = await supabase.from('orders').insert([{
                user_details: {
                    name: data.name,
                    contact: data.contact,
                    address: data.address,
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode
                },
                order_details: {
                    quantity: weight,
                    measure: 'Sample Order',
                    unit_price: amount
                },
                amount: amount,
                payment_method: 'online',
                status: 'created'
            }]).select().single();

            if (error) throw error;

            reset();
            onClose();
            navigate(`/checkout/${orderData.id}`);
        } catch (error) {
            console.error(error);
            alert(`Something went wrong: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 1040, // Below panel
                    }}
                    onClick={onClose}
                />
            )}

            {/* Popup Panel */}
            <div
                className="shadow-lg border-bottom border-light sample-popup-panel"
                style={{
                    position: 'fixed',
                    top: '100px', // Adjusted to match navbar height
                    left: '50%',
                    transform: isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-120%)',
                    width: '95%',
                    maxWidth: '900px',
                    height: 'auto',
                    maxHeight: '80vh',
                    zIndex: 1050,
                    backgroundColor: '#ffffff',
                    borderBottomLeftRadius: '48px',
                    borderBottomRightRadius: '48px',
                    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    ...window.innerWidth < 992 ? {
                        top: '85px', // Match mobile navbar height
                        width: '100%',
                        borderRadius: '0 0 48px 48px',
                        transform: isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-150%)',
                    } : {}
                }}
            >
                <style>
                    {`
                        .hide-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        @media (max-width: 991px) {
                            .sample-popup-panel {
                                width: 100% !important;
                                top: 85px !important; /* Navbar height */
                                border-radius: 0 0 48px 48px !important;
                            }
                        }
                    `}
                </style>
                <div className="position-relative p-3 p-lg-4 hide-scrollbar">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="position-absolute top-0 end-0 mt-3 me-3 border-0 bg-light rounded-circle p-2 d-none d-lg-flex align-items-center justify-content-center hover-scale"
                        style={{ cursor: 'pointer', width: '40px', height: '40px', transition: '0.2s', zIndex: 10 }}
                    >
                        <X size={24} color="#64748b" />
                    </button>

                    <Row className="align-items-start h-100">
                        {/* Left Side: Info (Desktop only) */}
                        <Col lg={5} className="d-none d-lg-flex flex-column justify-content-center pe-5 border-end h-100">
                            <h3 className="fw-bold mb-4" style={{ color: '#0f172a' }}>Why Order a Sample?</h3>
                            <div className="d-flex flex-column gap-4">
                                <div>
                                    <h5 className="fw-bold text-black mb-1">Check Quality</h5>
                                    <p className="text-secondary mb-0">Feel the texture and consistency.</p>
                                </div>
                                <div>
                                    <h5 className="fw-bold text-black mb-1">Test Strength</h5>
                                    <p className="text-secondary mb-0">Verify superior bonding properties.</p>
                                </div>
                                <div>
                                    <h5 className="fw-bold text-black mb-1">Fast Delivery</h5>
                                    <p className="text-secondary mb-0">Delivered within 2-3 days.</p>
                                </div>
                            </div>
                        </Col>

                        {/* Right Side: Form */}
                        <Col lg={7}>
                            <div className="mb-4">
                                <h3 className="fw-bold mb-2" style={{ color: '#0f172a' }}>Get Your Free Sample</h3>
                                <p className="text-secondary">Fill details to receive your pack.</p>
                            </div>

                            {submitted ? (
                                <div className="text-center py-5">
                                    <div className="mb-4 text-success">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <h3 className="fw-bold text-dark mb-3">Sample Requested!</h3>
                                    <p className="text-muted mb-4">
                                        Your sample pack request has been received. We will dispatch it shortly.
                                    </p>
                                    <Button
                                        variant="outline-dark"
                                        className="px-4 py-2 rounded-pill"
                                        onClick={onClose}
                                    >
                                        Close Popup
                                    </Button>
                                </div>
                            ) : (
                                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-muted mb-1">Full Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Your Name"
                                                    className="bg-light border-0 py-2"
                                                    isInvalid={!!errors.name}
                                                    {...register("name", { 
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
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-muted mb-1">Phone Number</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    placeholder="10-digit mobile number"
                                                    className="bg-light border-0 py-2"
                                                    isInvalid={!!errors.contact}
                                                    {...register("contact", { 
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
                                                <Form.Control.Feedback type="invalid">{errors.contact?.message || "Please enter a valid 10-digit mobile number"}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small text-muted mb-1">Delivery Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            placeholder="House No, Street, Landmark"
                                            className="bg-light border-0 py-2"
                                            style={{ resize: 'none' }}
                                            isInvalid={!!errors.address}
                                            {...register("address", { 
                                                required: "Delivery address is required",
                                                minLength: { value: 10, message: "Please provide a complete address" }
                                            })}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.address?.message}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Row className="g-3">
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-muted mb-1">Pincode</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    className="bg-light border-0 py-2"
                                                    maxLength={6}
                                                    isInvalid={!!errors.pincode}
                                                    {...register("pincode", {
                                                        required: "Pincode is required",
                                                        pattern: { value: /^[0-9]{6}$/, message: "Pincode must be 6 digits" },
                                                        onChange: (e) => {
                                                            if (e.target.value.length === 6) {
                                                                fetchPincodeDetails(e.target.value);
                                                            } else {
                                                                setValue('city', '');
                                                                setValue('state', '');
                                                            }
                                                        }
                                                    })}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.pincode?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-muted mb-1">City</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    className="bg-light border-0 py-2"
                                                    isInvalid={!!errors.city}
                                                    {...register("city", { required: "City is required" })}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.city?.message}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-muted mb-1">State</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    className="bg-light border-0 py-2"
                                                    {...register("state")}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold small text-muted mb-1">Sample Pack Size</Form.Label>
                                        <Form.Select
                                            className="bg-light border-0 py-2"
                                            isInvalid={!!errors.quantity}
                                            {...register("quantity", { required: "Please select a pack size" })}
                                        >
                                            <option value="">Select Pack Size</option>
                                            <option value="500g - ₹49">500g Pack – ₹49 (Shipping Only)</option>
                                            <option value="1Kg - ₹99">1Kg Pack – ₹99 (Shipping Only)</option>
                                            <option value="5Kg - ₹199">5Kg Pack – ₹199 (Shipping Only)</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">{errors.quantity?.message}</Form.Control.Feedback>
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        disabled={loading || !isValid}
                                        className="w-100 py-3 fw-bold text-uppercase tracking-wide shadow-sm d-flex align-items-center justify-content-center"
                                        style={{ 
                                            backgroundColor: !isValid ? '#94a3b8' : '#0f172a', 
                                            border: 'none', 
                                            borderRadius: '40px', 
                                            fontSize: '1rem',
                                            cursor: !isValid ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : 'Proceed to Pay & Order'}
                                    </Button>
                                </Form>
                            )}
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export default SamplePopup;
