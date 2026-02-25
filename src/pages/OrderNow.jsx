import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreditCard, ShoppingCart, ShieldCheck, Banknote, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import RevealOnScroll from '../components/RevealOnScroll';

const OrderNow = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            pincode: location.state?.pincode || '',
            quantity: location.state?.quantity || ''
        }
    });
    const [pricing, setPricing] = useState(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [error, setError] = useState(null);
    const [showGstWarning, setShowGstWarning] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isBusiness, setIsBusiness] = useState(false);
    const [isCustomQty, setIsCustomQty] = useState(false);

    useEffect(() => {
        const initialQty = location.state?.quantity;
        if (initialQty && !['25', '30', '40'].includes(String(initialQty))) {
            setIsCustomQty(true);
        }
    }, [location.state]);

    // Business Logic
    const OUR_STATE_CODE = '27'; // Maharashtra (Example - update if different)

    // Watch fields
    const pincode = watch('pincode');
    const quantity = watch('quantity');
    const gstNumber = watch('gst_number');
    const measure = 'Ton';

    useEffect(() => {
        const fetchPrice = async () => {
            if (!pincode || pincode.length < 6 || !quantity) return;

            setLoadingPrice(true);
            setError(null);
            try {
                setPricing(null); // Reset prev price

                // Fetch from Supabase (Handling duplicates -> get latest active one)
                const { data, error } = await supabase
                    .from('pincodes')
                    .select('*')
                    .eq('pincode', pincode.trim())
                    .eq('is_active', true) // Prefer active pincodes
                    .order('id', { ascending: false })
                    .limit(1);

                let unitPrice = 0;
                let pincodeData = null;

                if (data && data.length > 0) {
                    pincodeData = data[0];

                    // Check delivery status first
                    const status = pincodeData.delivery_status || pincodeData.deliverystatus;
                    if (status === 'No Delivery') {
                        setError("Delivery not available for this pincode.");
                        setLoadingPrice(false);
                        return;
                    }

                    // Calculate Unit Price based on Quantity
                    const basic = parseFloat(pincodeData.slag_basicrate) || 0;
                    const transport = parseFloat(pincodeData.transportation_by_truck || pincodeData.transport_rate || pincodeData['transportation By truck'] || pincodeData['Transportation by truck']) || 0;
                    const unloading = parseFloat(pincodeData.unloading_charges) || 0;
                    const fortyVal = parseFloat(pincodeData.forty_ton_hydraulic || pincodeData.forty_ton_hydraulic_type || pincodeData['40 Ton hydrallic Type'] || pincodeData['40 Ton']) || 0;
                    const thirtyVal = parseFloat(pincodeData.thirty_ton_hydraulic || pincodeData.thirty_ton_hydraulic_type || pincodeData['30 Ton hydrallic type'] || pincodeData['30 Ton']) || 0;

                    if (quantity === '40' && fortyVal > 0) {
                        unitPrice = basic + fortyVal;
                    } else if (quantity === '30' && thirtyVal > 0) {
                        unitPrice = basic + thirtyVal;
                    } else {
                        unitPrice = basic + transport + unloading;
                    }

                    // Auto-fill City from DB
                    if (pincodeData.city) {
                        setValue('city', pincodeData.city);
                    }

                    // Check if price is set for delivery-enabled pincode
                    if (unitPrice === 0) {
                        setError("Price not set for this pincode. Please contact support.");
                        setLoadingPrice(false);
                        return;
                    }
                } else {
                    // Fallback to External API for location if not in DB (Optional convenience)
                    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
                        .then(res => res.json())
                        .then(apiData => {
                            if (apiData && apiData[0].Status === "Success") {
                                const details = apiData[0].PostOffice[0];
                                setValue('city', details.Block === "NA" ? details.Name : details.Block);
                            }
                        })
                        .catch(err => console.error("Error fetching pincode details:", err));

                    // Pincode not found in database
                    setError("Delivery not available for this pincode.");
                    setLoadingPrice(false);
                    return;
                }

                // Calculate Basis
                const qtyNum = parseFloat(quantity);
                const basePrice = unitPrice * qtyNum;

                // GST Calculation (18% Global)
                // Determine Split: Integrated or Split
                let gstRate = 0.18;
                let isIgst = true;

                if (gstNumber && gstNumber.length >= 2) {
                    const userStateCode = gstNumber.substring(0, 2);
                    if (userStateCode === OUR_STATE_CODE) {
                        isIgst = false; // CGST + SGST
                    }
                }

                const gstAmount = basePrice * gstRate;
                const totalAmount = basePrice + gstAmount;

                setPricing({
                    unitPrice,
                    basePrice,
                    gstAmount,
                    totalAmount,
                    isIgst,
                    gstRate
                });

            } catch (err) {
                console.error(err);
                setError('Error calculating price.');
            } finally {
                setLoadingPrice(false);
            }
        };

        // Debounce
        fetchPrice();
    }, [pincode, quantity, gstNumber, setValue]);

    // Removed the separate useEffect for API calls to avoid overwriting DB data
    // The fallback API call is now integrated above.

    const onFormSubmit = (data) => {
        if (!pricing) {
            alert("Please ensure pricing is calculated before ordering.");
            return;
        }

        // GST Validation Check if enabled
        if (isBusiness) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!data.gst_number || !gstRegex.test(data.gst_number)) {
                alert("Please enter a valid 15-digit GST Number.");
                return;
            }
        } else {
            // User NOT buying as business -> Trigger Warning
            setPendingFormData(data);
            setShowGstWarning(true);
            return;
        }

        // If validation passed or explicitly provided
        processOrder(data);
    };

    const confirmOrderWithoutGst = () => {
        setShowGstWarning(false);
        if (pendingFormData) {
            // Clear any partial GST data just in case
            const finalData = { ...pendingFormData, gst_number: null };
            processOrder(finalData);
        }
    };

    const processOrder = async (formData) => {
        setLoadingOrder(true);

        try {
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_details: {
                        name: formData.name,
                        contact: formData.contact,
                        address: formData.address,
                        pincode: formData.pincode,
                        city: formData.city,
                        gst_number: formData.gst_number,
                        is_business: isBusiness
                    },
                    order_details: {
                        quantity: formData.quantity,
                        measure: 'Ton',
                        unit_price: pricing.unitPrice,
                        tax_type: pricing.isIgst ? 'IGST' : 'CGST+SGST',
                        tax_rate: pricing.gstRate,
                        tax_amount: pricing.gstAmount
                    },
                    amount: pricing.totalAmount,
                    payment_method: paymentMethod, // 'online' or 'cod'
                    status: 'created'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            if (paymentMethod === 'cod') {
                setShowSuccessModal(true);
                setTimeout(() => {
                    navigate(`/checkout/${orderData.id}`);
                }, 3000);
            } else {
                // Redirect immediately for online payment
                navigate(`/checkout/${orderData.id}`);
            }

        } catch (err) {
            console.error("Order Error:", err);
            alert("Failed to initiate order. Please try again.");
        } finally {
            setLoadingOrder(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#fffefb10', minHeight: '100vh' }}>
            {/* Header Section */}
            <div className="position-relative py-5 mb-5" style={{ background: '#0f172a' }}>
                <Container className="text-center position-relative z-1">
                    <RevealOnScroll direction="down">
                        <h1 className="display-4 fw-bold text-white mb-2">Order Eco Sand</h1>
                        <p className="text-white-50 lead">Premium quality slag sand delivered straight to your site.</p>
                    </RevealOnScroll>
                </Container>
                {/* Decorative background element */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    opacity: 0.2
                }}></div>
            </div>

            <Container className="pb-5">
                <Form onSubmit={handleSubmit(onFormSubmit)}>
                    <Row className="justify-content-center g-4">
                        {/* Form Section */}
                        <Col lg={7}>
                            <RevealOnScroll direction="left" delay={0.2}>
                                <Card className="shadow-lg border-0 rounded-4 overflow-hidden h-100">
                                    <div className="bg-white p-4 p-md-5">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-dark bg-opacity-10 p-3 rounded-circle me-3">
                                                <ShoppingCart className="text-dark" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="fw-bold mb-0">Delivery Details</h4>
                                                <p className="text-muted small mb-0">Where should we send your order?</p>
                                            </div>
                                        </div>

                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Full Name</Form.Label>
                                                    <Form.Control type="text" className="bg-light border-0 py-2" placeholder="Enter your full name" required {...register('name')} />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Contact Number</Form.Label>
                                                    <Form.Control type="tel" className="bg-light border-0 py-2" placeholder="+91 XXXXXXXXXX" required {...register('contact')} />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Pincode</Form.Label>
                                                    <Form.Control type="text" className="bg-light border-0 py-2" placeholder="Enter your pincode" required {...register('pincode')} />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">City</Form.Label>
                                                    <Form.Control type="text" className="bg-light border-0 py-2" placeholder="Enter your city" required {...register('city')} />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary"> Address</Form.Label>
                                                    <Form.Control as="textarea" rows={3} className="bg-light border-0 py-2" placeholder="Enter your address" required {...register('address')} />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="my-4 border-top"></div>

                                        {/* GST Section */}
                                        <div className="mb-4">
                                            <Form.Check
                                                type="checkbox"
                                                id="business-check"
                                                label="Buying for business? Add GST details"
                                                className="fw-bold text-primary mb-3"
                                                checked={isBusiness}
                                                onChange={(e) => {
                                                    setIsBusiness(e.target.checked);
                                                    if (!e.target.checked) setValue('gst_number', '');
                                                }}
                                            />

                                            {isBusiness && (
                                                <div className="p-3 bg-light rounded-3 fade-in">
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold text-secondary">GST Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            className="border-0 py-2"
                                                            placeholder="Ex: 27ABCDE1234F1Z5"
                                                            {...register('gst_number')}
                                                            style={{ textTransform: 'uppercase' }}
                                                        />
                                                        <Form.Text className="text-muted x-small">
                                                            Enter valid 15-digit GSTIN. Tax will be calculated based on state code (first 2 digits).
                                                        </Form.Text>
                                                    </Form.Group>
                                                </div>
                                            )}
                                        </div>

                                        <div className="my-4 border-top"></div>

                                        <div className="d-flex align-items-center mb-4">
                                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                                <CreditCard className="text-primary" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="fw-bold mb-0">Order Configuration</h4>
                                                <p className="text-muted small mb-0">Select quantity (Tons)</p>
                                            </div>
                                        </div>

                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small fw-bold text-secondary">Quantity (Ton)</Form.Label>
                                                    <div className="d-flex gap-2">
                                                        <Form.Select
                                                            className="bg-light border-0 py-2"
                                                            value={!isCustomQty && ['25', '30', '40'].includes(String(quantity)) ? quantity : (isCustomQty ? 'custom' : '')}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'custom') {
                                                                    setIsCustomQty(true);
                                                                    setValue('quantity', '');
                                                                } else {
                                                                    setIsCustomQty(false);
                                                                    setValue('quantity', val);
                                                                }
                                                            }}
                                                            required
                                                        >
                                                            <option value="">Select Quantity</option>
                                                            <option value="25">25 Tons</option>
                                                            <option value="30">30 Tons</option>
                                                            <option value="40">40 Tons</option>
                                                            <option value="custom">Other (&gt; 40)</option>
                                                        </Form.Select>
                                                    </div>
                                                    {isCustomQty && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mt-2"
                                                        >
                                                            <Form.Control
                                                                type="number"
                                                                className="bg-light border-0 py-2"
                                                                placeholder="Enter quantity"
                                                                min="41"
                                                                value={quantity}
                                                                onChange={(e) => setValue('quantity', e.target.value)}
                                                                required
                                                            />
                                                        </motion.div>
                                                    )}
                                                    <Form.Text className="text-muted small">
                                                        * 1 Ton ≈ 27 Cu ft approximately
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                    </div>
                                </Card>
                            </RevealOnScroll>
                        </Col>

                        {/* Summary Section */}
                        <Col lg={5}>
                            <RevealOnScroll direction="right" delay={0.4}>
                                <div className="sticky-top" style={{ top: '100px', zIndex: 1 }}>
                                    <Card className="border-0 shadow-lg rounded-4 overflow-hidden bg-white">
                                        <Card.Header className="bg-white border-0 p-4 pb-0">
                                            <h5 className="fw-bold mb-0 text-dark">Order Summary</h5>
                                        </Card.Header>
                                        <Card.Body className="p-4">
                                            {loadingPrice && (
                                                <div className="text-center py-5">
                                                    <Spinner animation="border" variant="dark" />
                                                    <p className="mt-2 text-muted small">Fetching latest prices...</p>
                                                </div>
                                            )}

                                            {error && (
                                                <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger rounded-3 m-0">
                                                    <small>{error}</small>
                                                </Alert>
                                            )}

                                            {!loadingPrice && !pricing && !error && (
                                                <div className="text-center py-5 border rounded-3 border-dashed bg-light">
                                                    <p className="text-muted small mb-0">Enter details to view pricing</p>
                                                </div>
                                            )}

                                            {pricing && (
                                                <div className="d-flex flex-column gap-3">
                                                    <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-light">
                                                        <div>
                                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Rate per Ton</small>
                                                            <span className="fw-bold fs-5">₹{pricing.unitPrice}</span>
                                                        </div>
                                                        <div className="text-end">
                                                            <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Quantity</small>
                                                            <span className="fw-bold fs-5">{quantity} Tons</span>
                                                        </div>
                                                    </div>

                                                    <div className="px-2">
                                                        <div className="d-flex justify-content-between mb-2 small text-secondary">
                                                            <span>Subtotal</span>
                                                            <span>₹{pricing.basePrice.toFixed(2)}</span>
                                                        </div>

                                                        {pricing.isIgst ? (
                                                            <div className="d-flex justify-content-between mb-3 small text-secondary">
                                                                <span>IGST (18%)</span>
                                                                <span>₹{pricing.gstAmount.toFixed(2)}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="d-flex justify-content-between mb-1 small text-secondary">
                                                                    <span>CGST (9%)</span>
                                                                    <span>₹{(pricing.gstAmount / 2).toFixed(2)}</span>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-3 small text-secondary">
                                                                    <span>SGST (9%)</span>
                                                                    <span>₹{(pricing.gstAmount / 2).toFixed(2)}</span>
                                                                </div>
                                                            </>
                                                        )}

                                                        <div className="d-flex justify-content-between pt-3 border-top border-2">
                                                            <span className="fw-bold h5 mb-0">Total</span>
                                                            <span className="fw-bold h4 text-dark mb-0">₹{pricing.totalAmount.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4">
                                                <p className="fw-bold mb-2 small text-secondary">Payment Method</p>
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant={paymentMethod === 'online' ? 'dark' : 'outline-dark'}
                                                        className="flex-fill d-flex align-items-center justify-content-center gap-2"
                                                        onClick={() => setPaymentMethod('online')}
                                                    >
                                                        <CreditCard size={18} /> Online
                                                    </Button>
                                                    <Button
                                                        variant={paymentMethod === 'cod' ? 'dark' : 'outline-dark'}
                                                        className="flex-fill d-flex align-items-center justify-content-center gap-2"
                                                        onClick={() => setPaymentMethod('cod')}
                                                    >
                                                        <Banknote size={18} /> COD
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Button
                                                    variant="dark"
                                                    size="lg"
                                                    type="submit"
                                                    disabled={loadingOrder || !pricing || !!error}
                                                    className="w-100 py-3 rounded-3 shadow-lg fw-bold d-flex align-items-center justify-content-center gap-2"
                                                    style={{ backgroundColor: '#0f172a' }}
                                                >
                                                    {loadingOrder ? <Spinner animation="border" size="sm" /> : (paymentMethod === 'online' ? 'Pay Securely' : 'Place Order')}
                                                </Button>
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className="bg-light p-3 border-0">
                                            <div className="d-flex align-items-center justify-content-center text-muted gap-2 small">
                                                <ShieldCheck size={14} />
                                                <span>Secure Payments & Processing</span>
                                            </div>
                                        </Card.Footer>
                                    </Card>

                                    {/* Trust Badges */}
                                    <div className="mt-4 row g-2 text-center text-secondary small opacity-75">
                                        <div className="col-4">
                                            <div className="bg-white p-2 rounded shadow-sm">
                                                <p className="mb-0 fw-bold">100%</p>
                                                <span style={{ fontSize: '0.65rem' }}>Secure</span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="bg-white p-2 rounded shadow-sm">
                                                <p className="mb-0 fw-bold">24/7</p>
                                                <span style={{ fontSize: '0.65rem' }}>Support</span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="bg-white p-2 rounded shadow-sm">
                                                <p className="mb-0 fw-bold">Fast</p>
                                                <span style={{ fontSize: '0.65rem' }}>Delivery</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RevealOnScroll>
                        </Col>
                    </Row>
                </Form>
            </Container>

            {/* GST Confirmation Modal */}
            <Modal show={showGstWarning} onHide={() => setShowGstWarning(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-warning">Wait! You might be losing money</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">
                        If you do not enter a GST number, you are losing <strong>18% GST benefit</strong> on your order.
                    </p>
                    <p className="text-muted mt-2 small">Do you still want to proceed without GST?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGstWarning(false)}>
                        Go Back
                    </Button>
                    <Button variant="dark" onClick={confirmOrderWithoutGst}>
                        Proceed Anyway
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Order Success Modal (COD) */}
            <Modal show={showSuccessModal} centered backdrop="static" keyboard={false}>
                <Modal.Body className="text-center p-5">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="mb-4 d-inline-block"
                    >
                        <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                            <Check className="text-white" size={40} />
                        </div>
                    </motion.div>
                    <h2 className="fw-bold mb-3">Order Placed!</h2>
                    <p className="text-muted mb-0">Your order has been placed successfully.</p>
                    <p className="text-muted small">Redirecting you to order details...</p>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default OrderNow;
