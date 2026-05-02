import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { CreditCard, ShieldCheck, ArrowLeft, Package, User, CheckCircle } from 'lucide-react';
import RevealOnScroll from '../components/RevealOnScroll';

const Checkout = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error("Order not found");

                if (data.status === 'paid') {
                    alert("This order is already paid.");
                    navigate('/');
                    return;
                }

                setOrder(data);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, navigate]);

    const handlePayment = async () => {
        console.log("🚀 Payment flow initiated");
        console.log("Order details:", order);

        // Hardcoded key for testing to bypass Vercel environment variable misconfigurations
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID?.startsWith('rzp_') 
            ? import.meta.env.VITE_RAZORPAY_KEY_ID 
            : "rzp_test_SVSp7lxfYNMVj8";
            
        if (!razorpayKey) {
            console.error("❌ VITE_RAZORPAY_KEY_ID not found in environment variables");
            alert("Configuration error: Razorpay key not found. Please contact support.");
            return;
        }
        console.log("✓ Razorpay key being used:", razorpayKey);

        setVerifying(true);
        try {
            // 1. Create Order in Razorpay via backend
            console.log("📤 Sending order creation request to backend...");

            const paymentAmount = Math.round(order.amount * 100);
            if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
                throw new Error(`Invalid order amount: ${order.amount}`);
            }

            const orderPayload = {
                amount: paymentAmount, // Amount in paise
                currency: "INR",
                receipt: `receipt_${order.id}`
            };
            console.log("Order payload:", orderPayload);

            const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://slagsand-backend.onrender.com';
            const response = await fetch(`${baseURL}/api/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            console.log("📥 Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
                console.error("❌ Backend error:", errorData);
                throw new Error(errorData.message || "Failed to create Razorpay order");
            }

            const razorpayOrder = await response.json();
            console.log("✓ Razorpay order created:", razorpayOrder);

            // 2. Open Razorpay
            console.log("🎨 Opening Razorpay checkout...");
            const options = {
                key: razorpayKey,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Slagwala",
                description: "Order Payment",
                // Intentionally omitted 'image' to allow Razorpay to use its default and avoid CORS issues
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    console.log("✓ Payment successful, validating...");
                    console.log("Payment response:", response);

                    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://slagsand-backend.onrender.com';
                    // On Success, validate signature
                    const validateRes = await fetch(`${baseURL}/api/validate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(response)
                    });

                    const validationResult = await validateRes.json();
                    console.log("Validation result:", validationResult);

                    if (validationResult.msg === "success") {
                        console.log("✓ Payment validated, updating order status...");
                        const { error: updateError } = await supabase
                            .from('orders')
                            .update({
                                status: 'paid',
                                payment_id: response.razorpay_payment_id
                            })
                            .eq('id', order.id);

                        if (updateError) {
                            console.error("❌ Error updating order:", updateError);
                            alert("Payment successful but order update failed. Contact support.");
                        } else {
                            console.log("✓ Order updated successfully, redirecting...");
                            navigate('/order-success', {
                                state: {
                                    orderDetails: {
                                        id: order.id,
                                        amount: order.amount,
                                        paymentId: response.razorpay_payment_id
                                    }
                                }
                            });
                        }
                    } else {
                        console.error("❌ Payment verification failed");
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: order.user_details.name,
                    contact: order.user_details.contact,
                },
                theme: {
                    color: "#000000"
                }
            };

            if (!window.Razorpay) {
                console.error("❌ Razorpay script not loaded");
                alert("Payment gateway not loaded. Please refresh the page and try again.");
                return;
            }

            console.log("Final Checkout Options:", {
                ...options,
                handler: "[Function]"
            });

            const rzp1 = new window.Razorpay(options);
            console.log("✓ Razorpay instance created, opening modal...");
            rzp1.open();

            rzp1.on('payment.failed', function (response) {
                console.error("❌ Payment failed:", response.error);
                alert("Payment Failed: " + response.error.description);
            });

        } catch (err) {
            console.error("❌ Payment Error:", err);
            console.error("Error stack:", err.stack);
            alert("Failed to initiate payment: " + err.message);
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <Spinner animation="border" variant="dark" />
                <p className="mt-2 text-muted">Loading payment details...</p>
            </div>
        </div>
    );

    if (error) return (
        <Container className="py-5">
            <Alert variant="danger" className="text-center py-5 shadow-sm">
                <h4 className="fw-bold">Error Loading Checkout</h4>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={() => navigate('/order-now')}>Go Back</Button>
            </Alert>
        </Container>
    );

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>
            <div className="bg-dark py-4 mb-5 text-white shadow-sm">
                <Container>
                    <div className="d-flex align-items-center gap-3">
                        <Button variant="link" className="text-white p-0" onClick={() => navigate(-1)}>
                            <ArrowLeft size={24} />
                        </Button>
                        <h3 className="mb-0 fw-bold">Secure Checkout</h3>
                    </div>
                </Container>
            </div>

            <Container>
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <RevealOnScroll direction="up">
                            <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                                <Card.Body className="p-4 p-md-5">
                                    <div className="row g-4">
                                        <div className="col-md-6 border-end-md">
                                            <div className="d-flex align-items-center mb-3">
                                                <User className="text-dark me-2" size={20} />
                                                <h5 className="fw-bold mb-0">Customer Information</h5>
                                            </div>
                                            <div className="bg-light p-3 rounded-3 mb-4">
                                                <p className="mb-1 fw-bold">{order.user_details.name}</p>
                                                <p className="mb-1 text-muted small">{order.user_details.contact}</p>
                                                <p className="mb-0 text-muted small">{order.user_details.address}, {order.user_details.pincode}</p>
                                            </div>

                                            <div className="d-flex align-items-center mb-3">
                                                <Package className="text-dark me-2" size={20} />
                                                <h5 className="fw-bold mb-0">Order Summary</h5>
                                            </div>
                                            <div className="bg-light p-3 rounded-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted small">Quantity:</span>
                                                    <span className="fw-bold">{order.order_details.quantity} {order.order_details.measure}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-0">
                                                    <span className="text-muted small">Unit Price:</span>
                                                    <span className="fw-bold">₹{order.order_details.unit_price}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6 text-center text-md-start">
                                            <div className="ps-md-4">
                                                <div className="mb-5 mt-4 mt-md-0">
                                                    <small className="text-muted text-uppercase fw-bold ls-wider">Total Amount to Pay</small>
                                                    <h1 className="display-4 fw-bold text-dark mb-0">₹{order.amount.toFixed(2)}</h1>
                                                    {order.order_details.measure === 'Sample Order' ? (
                                                        <div className="mt-1">
                                                            <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                                Material is Free - Only courier charges applicable
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <small className="text-muted">Includes GST</small>
                                                    )}
                                                </div>

                                                {order.payment_method === 'cod' ? (
                                                    <div className="bg-success bg-opacity-10 p-4 rounded-3 text-center mb-3 border border-success border-opacity-25">
                                                        <CheckCircle className="text-success mb-2" size={32} />
                                                        <h5 className="fw-bold text-success">Order Placed Successfully</h5>
                                                        <p className="small text-muted mb-0">Payment to be made on delivery.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="dark"
                                                            size="lg"
                                                            className="w-100 py-3 rounded-3 shadow-lg fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
                                                            onClick={handlePayment}
                                                            disabled={verifying}
                                                        >
                                                            {verifying ? <Spinner animation="border" size="sm" /> : <>Pay Now <CreditCard size={20} /></>}
                                                        </Button>

                                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start text-muted gap-2 small">
                                                            <ShieldCheck size={16} className="text-dark" />
                                                            <span>Secure Payment via Razorpay</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            <div className="text-center opacity-75">
                                <p className="text-muted small">
                                    By clicking "Pay Now", you agree to our Terms of Service.
                                    <br />
                                    Your payment details are encrypted and securely processed.
                                </p>
                            </div>
                        </RevealOnScroll>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Checkout;
