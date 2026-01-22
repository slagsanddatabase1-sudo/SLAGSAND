import React, { useState } from 'react';
import { Container, Row, Col, Button, Carousel, Form, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = ({ onGetSampleClick }) => {
    const [calcData, setCalcData] = useState({
        product: 'Slag Sand',
        measure: 'Ton',
        quantity: '',
        pincode: '',
        gst: false
    });
    const [step, setStep] = useState(1);
    const [marketRate, setMarketRate] = useState('');
    const [priceResult, setPriceResult] = useState(null);
    const [savingsResult, setSavingsResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCustomQty, setIsCustomQty] = useState(false);

    const resetCalculator = () => {
        setStep(1);
        setPriceResult(null);
        setSavingsResult(null);
        setMarketRate('');
        setError(null);
        setCalcData(prev => ({ ...prev, quantity: '', pincode: '', measure: 'Ton' }));
        setIsCustomQty(false);
    };

    const handleCheckAvailability = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!calcData.measure) {
            setError('Please select a measure unit.');
            setLoading(false);
            return;
        }

        try {
            console.log("Checking pincode:", calcData.pincode.trim());

            // Fetch from Supabase (Handling duplicates -> get latest active one)
            const { data, error } = await supabase
                .from('pincodes')
                .select('*')
                .eq('pincode', calcData.pincode.trim())
                .eq('is_active', true)
                .order('id', { ascending: false })
                .limit(1);

            if (error) {
                console.error("Supabase Error:", error);
            }
            console.log("Supabase Data:", data);

            // Fallback Logic
            let unitPrice = 0;

            if (data && data.length > 0) {
                const pincodeData = data[0];
                // Use final_price if available, otherwise fallback
                if (calcData.measure === 'Ton') unitPrice = parseFloat(pincodeData.final_price) || 0;
                // Note: final_price is generally per Ton. Brass/Foot logic would need conversion if not explicitly stored.
                // Assuming final_price IS the per-ton price.
                else if (calcData.measure === 'Brass') unitPrice = (parseFloat(pincodeData.final_price) || 0) * 2.5; // Approx conversion if needed, or fallback
                else if (calcData.measure === 'Foot') unitPrice = (parseFloat(pincodeData.final_price) || 0) / 20; // Approx conversion

                // If the specific legacy columns exist and are non-zero, we COULD use them, but user said "use final price".
                // So we stick to final_price for Ton.
            } else {
                // No data found in DB
                // Do NOT fallback to default prices.
            }

            // If DB returned 0 or no data, show error
            if (unitPrice === 0) {
                console.warn("Unit Price is 0 or Pincode not found");
                setError("Delivery not available or price not set for this pincode.");
                setLoading(false);
                return;
            }

            console.log("Final Unit Price:", unitPrice);

            const quantity = Number(calcData.quantity) || 0;
            const basePrice = unitPrice * quantity;
            const gstAmount = calcData.gst ? basePrice * 0.18 : 0;
            const total = basePrice + gstAmount;

            setPriceResult({ unitPrice, basePrice, gstAmount, total });
            setStep(2); // Proceed to ask for market rate
        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateSavings = (e) => {
        e.preventDefault();
        if (!marketRate || isNaN(marketRate)) {
            setError("Please enter a valid market rate.");
            return;
        }

        const marketUnitRate = parseFloat(marketRate);
        const marketTotal = marketUnitRate * parseFloat(calcData.quantity);
        const ourTotal = priceResult.total;
        const savedAmount = marketTotal - ourTotal;

        setSavingsResult({
            marketTotal,
            savedAmount,
            isSavings: savedAmount > 0
        });
    };

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
                        >
                            <Card
                                className="border-0 shadow rounded-4 overflow-hidden text-white"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                                }}
                            >
                                <Card.Header
                                    className="d-flex align-items-center gap-3 p-3 bg-transparent border-bottom border-light border-opacity-25"
                                >
                                    <Calculator size={28} className="text-white" />
                                    <h4 className="mb-0 fw-bold">Economic Calculator</h4>
                                    {step > 1 && (
                                        <Button
                                            variant="link"
                                            className="text-white ms-auto p-0 text-decoration-none small opacity-75"
                                            onClick={resetCalculator}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                </Card.Header>

                                <Card.Body className="p-4">
                                    {step === 1 && (
                                        <Form onSubmit={handleCheckAvailability}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-bold text-white small text-uppercase letter-spacing-1">Product</Form.Label>
                                                        <Form.Select
                                                            size="lg"
                                                            value={calcData.product}
                                                            onChange={(e) => setCalcData({ ...calcData, product: e.target.value })}
                                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', fontWeight: 'bold' }}
                                                            disabled
                                                        >
                                                            <option>Slag Sand</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-bold text-white small text-uppercase letter-spacing-1">Measure</Form.Label>
                                                        <Form.Select
                                                            size="lg"
                                                            value={calcData.measure}
                                                            onChange={(e) => setCalcData({ ...calcData, measure: e.target.value })}
                                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', fontWeight: 'bold' }}
                                                            required
                                                            disabled
                                                        >
                                                            <option value="Ton">Ton</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold text-white small text-uppercase letter-spacing-1">Quantity</Form.Label>
                                                <div className="d-flex gap-2">
                                                    <Form.Select
                                                        size="lg"
                                                        value={!isCustomQty && ['25', '30', '40'].includes(calcData.quantity) ? calcData.quantity : (isCustomQty ? 'custom' : '')}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === 'custom') {
                                                                setIsCustomQty(true);
                                                                setCalcData({ ...calcData, quantity: '' });
                                                            } else {
                                                                setIsCustomQty(false);
                                                                setCalcData({ ...calcData, quantity: val });
                                                            }
                                                        }}
                                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', fontWeight: 'bold' }}
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
                                                            size="lg"
                                                            placeholder="Enter quantity"
                                                            min="41"
                                                            value={calcData.quantity}
                                                            onChange={(e) => setCalcData({ ...calcData, quantity: e.target.value })}
                                                            style={{ background: 'rgba(255, 255, 255, 0.8)', border: 'none', fontWeight: 'bold' }}
                                                            required
                                                        />
                                                    </motion.div>
                                                )}
                                            </Form.Group>


                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold text-white small text-uppercase letter-spacing-1">Pincode</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    size="lg"
                                                    placeholder="Enter pincode"
                                                    value={calcData.pincode}
                                                    onChange={(e) => setCalcData({ ...calcData, pincode: e.target.value })}
                                                    style={{ background: 'rgba(255, 255, 255, 0.8)', border: 'none', fontWeight: 'bold' }}
                                                    required
                                                />
                                            </Form.Group>

                                            {/* <Form.Group className="mb-4">
                                                <Form.Check
                                                    type="checkbox"
                                                    label={<span className="fw-bold text-white">Include GST (18%)</span>}
                                                    checked={calcData.gst}
                                                    onChange={(e) => setCalcData({ ...calcData, gst: e.target.checked })}
                                                    style={{ transform: 'scale(1.1)', transformOrigin: 'left' }}
                                                />
                                            </Form.Group> */}

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-100 py-3 fw-bold text-white shadow-sm"
                                                style={{ backgroundColor: '#0f172a', border: 'none', fontSize: '1.1rem' }}
                                                disabled={loading}
                                            >
                                                {loading ? 'Checking...' : 'Check Rates'}
                                            </Button>
                                        </Form>
                                    )}

                                    {step === 2 && !savingsResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="text-center mb-4">
                                                <p className="text-white-50 mb-1">Our Rate for {calcData.quantity} {calcData.measure} in your area:</p>
                                                <h3 className="text-info fw-bold">₹{priceResult.total.toFixed(2)}</h3>
                                                <small className="text-white-50">(₹{priceResult.unitPrice}/{calcData.measure})</small>
                                            </div>

                                            <Form onSubmit={handleCalculateSavings}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-bold text-white text-center w-100">
                                                        What is the current market rate per {calcData.measure} in your area?
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        size="lg"
                                                        placeholder={`Rate per ${calcData.measure}`}
                                                        value={marketRate}
                                                        onChange={(e) => setMarketRate(e.target.value)}
                                                        style={{ background: 'rgba(255, 255, 255, 0.9)', border: 'none', fontWeight: 'bold', textAlign: 'center' }}
                                                        required
                                                    />
                                                </Form.Group>

                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="w-100 py-3 fw-bold text-white shadow-sm"
                                                    style={{ backgroundColor: '#10b981', border: 'none', fontSize: '1.1rem' }}
                                                >
                                                    Calculate Savings
                                                </Button>
                                            </Form>
                                        </motion.div>
                                    )}

                                    {step === 2 && savingsResult && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center"
                                        >
                                            <h5 className="text-white mb-4">Savings Calculation</h5>

                                            <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-3">
                                                <div className="d-flex justify-content-between text-white-50 mb-2">
                                                    <span>Market Cost:</span>
                                                    <span className="text-white fw-bold">₹{savingsResult.marketTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between text-white-50 mb-2">
                                                    <span>Our Cost:</span>
                                                    <span className="text-info fw-bold">₹{priceResult.total.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className={`p-4 rounded-4 mb-4 ${savingsResult.isSavings ? 'bg-success bg-opacity-75' : 'bg-warning bg-opacity-75'}`}>
                                                <p className="mb-1 text-white fw-medium text-uppercase small">{savingsResult.isSavings ? 'You Save' : 'Cost Difference'}</p>
                                                <h2 className="display-4 fw-bold text-white mb-0">₹{Math.abs(savingsResult.savedAmount).toFixed(2)}</h2>
                                            </div>

                                            <Button
                                                as={Link}
                                                to="/order-now"
                                                state={{
                                                    pincode: calcData.pincode,
                                                    quantity: calcData.quantity
                                                }}
                                                size="lg"
                                                className="w-100 py-3 fw-bold text-dark shadow-sm"
                                                style={{ backgroundColor: '#caf3ffff', border: 'none', fontSize: '1.1rem' }}
                                            >
                                                Proceed to Order
                                            </Button>

                                        </motion.div>
                                    )}

                                    {error && <Alert variant="danger" className="mt-3 py-2 fw-semibold small text-center bg-white border-0 text-danger">{error}</Alert>}
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </div >
    );
};

export default Hero;
