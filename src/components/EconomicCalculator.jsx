import React, { useState } from 'react';
import { RefreshCcw, Calculator, MapPin, CheckCircle, AlertCircle, ArrowRight, Loader, Truck } from 'lucide-react';
import { Card, Button, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import './EconomicCalculator.css';

const EconomicCalculator = () => {
    // Pincode state
    const [pincode, setPincode] = useState('');
    const [pincodeData, setPincodeData] = useState(null);
    const [pincodeError, setPincodeError] = useState('');
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [pincodeVerified, setPincodeVerified] = useState(false);

    // Calculated rates
    const [rates, setRates] = useState(null);

    const handlePincodeCheck = async () => {
        const cleanPincode = pincode.trim();
        if (!cleanPincode || cleanPincode.length !== 6 || isNaN(cleanPincode)) {
            setPincodeError('Please enter a valid 6-digit pincode');
            return;
        }

        setPincodeLoading(true);
        setPincodeError('');
        setPincodeData(null);
        setRates(null);

        try {
            const { data, error } = await supabase
                .from('pincodes')
                .select('*')
                .eq('pincode', cleanPincode)
                .eq('is_active', true)
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
                setPincodeError('Sorry, delivery is not available for this pincode yet.');
                setPincodeVerified(false);
                return;
            }

            const record = data[0];
            const deliveryStatus = record.delivery_status || record.deliverystatus || '';
            if (deliveryStatus === 'No Delivery' || deliveryStatus === 'Non-Delivery') {
                setPincodeError('Sorry, delivery is not available at this pincode.');
                setPincodeVerified(false);
                return;
            }

            setPincodeData(record);
            setPincodeVerified(true);
            setPincodeError('');

            // Calculate rates for all three tiers
            calculateRates(record);
        } catch (err) {
            console.error('Error checking pincode:', err);
            setPincodeError('Something went wrong. Please try again.');
        } finally {
            setPincodeLoading(false);
        }
    };

    const calculateRates = (record) => {
        const basic = parseFloat(record.slag_basicrate) || 0;
        const forty = parseFloat(record.forty_ton_hydraulic) || 0;
        const thirty = parseFloat(record.thirty_ton_hydraulic) || 0;
        const transport = parseFloat(record.transportation_by_truck) || 0;
        const unloading = parseFloat(record.unloading_charges) || 0;

        // 25T = basic + transport + unloading
        const rate25 = basic + transport + unloading;
        // 30T = basic + thirty_ton_hydraulic
        const rate30 = thirty > 0 ? basic + thirty : 0;
        // 40T = basic + forty_ton_hydraulic
        const rate40 = forty > 0 ? basic + forty : 0;

        setRates({
            rate25: { total: rate25, basic, transport, unloading, available: transport > 0 || unloading > 0 },
            rate30: { total: rate30, basic, hydraulic: thirty, available: thirty > 0 },
            rate40: { total: rate40, basic, hydraulic: forty, available: forty > 0 },
            city: record.city || '',
            district: record.district || '',
            km: record.km || ''
        });
    };

    const handlePincodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePincodeCheck();
        }
    };

    const handleReset = () => {
        setPincode('');
        setPincodeData(null);
        setPincodeError('');
        setPincodeVerified(false);
        setRates(null);
    };

    return (
        <Card
            className="border-0 shadow rounded-4 overflow-hidden text-white h-100"
            style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            }}
        >
            <Card.Header
                className="d-flex align-items-center gap-2 p-2 bg-transparent border-bottom border-light border-opacity-25"
            >
                <Calculator size={18} className="text-white opacity-75" />
                <h6 className="mb-0 fw-bold header-title text-small">Rate Calculator</h6>
                {pincodeVerified && (
                    <button
                        className="reset-link ms-auto"
                        onClick={handleReset}
                    >
                        <RefreshCcw size={12} /> <span>Reset</span>
                    </button>
                )}
            </Card.Header>

            <Card.Body className="p-3">
                <div className="calculator-container">
                    <div className="calculator-card">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: PINCODE ENTRY */}
                            {!pincodeVerified && (
                                <motion.div
                                    key="pincode-step"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                >
                                    <div className="pincode-step p-1">
                                        <div className="pincode-icon-wrapper mb-3">
                                            <MapPin size={28} className="pincode-icon" />
                                        </div>
                                        <p className="pincode-prompt mb-3">
                                            Enter your pincode to get location-based pricing
                                        </p>
                                        <div className="pincode-input-group mb-2">
                                            <Form.Control
                                                type="text"
                                                className="pincode-input"
                                                placeholder="Enter 6-digit pincode"
                                                maxLength={6}
                                                value={pincode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setPincode(val);
                                                    setPincodeError('');
                                                }}
                                                onKeyDown={handlePincodeKeyDown}
                                            />
                                            <Button
                                                className="pincode-check-btn"
                                                onClick={handlePincodeCheck}
                                                disabled={pincodeLoading || pincode.length !== 6}
                                            >
                                                {pincodeLoading ? (
                                                    <Loader size={16} className="spin-icon" />
                                                ) : (
                                                    <ArrowRight size={16} />
                                                )}
                                            </Button>
                                        </div>
                                        {pincodeError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="pincode-error"
                                            >
                                                <AlertCircle size={13} />
                                                <span>{pincodeError}</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: RATES DISPLAY */}
                            {pincodeVerified && rates && (
                                <motion.div
                                    key="rates-view"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <div className="results-section pt-0 border-0">
                                        {/* Location badge */}
                                        <div className="pincode-verified-badge mb-3" style={{ justifyContent: 'center' }}>
                                            <MapPin size={13} />
                                            <span>{rates.city || pincode}</span>
                                            <span className="pincode-badge-code">{pincode}</span>
                                        </div>

                                        {/* Rate cards */}
                                        <div className="rate-tiers">
                                            {/* 40 Ton */}
                                            {rates.rate40.available && (
                                                <motion.div
                                                    className="rate-tier-card"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <div className="rate-tier-header">
                                                        <Truck size={16} />
                                                        <span className="rate-tier-label">40 Ton</span>
                                                        <span className="rate-tier-badge best">Best Rate</span>
                                                    </div>
                                                    <div className="rate-tier-price">
                                                        ₹{rates.rate40.total.toLocaleString('en-IN')}
                                                        <span className="rate-tier-unit">/ ton</span>
                                                    </div>
                                                    <div className="rate-tier-breakdown">
                                                        Base ₹{rates.rate40.basic} + Hydraulic ₹{rates.rate40.hydraulic}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* 30 Ton */}
                                            {rates.rate30.available && (
                                                <motion.div
                                                    className="rate-tier-card"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <div className="rate-tier-header">
                                                        <Truck size={16} />
                                                        <span className="rate-tier-label">30 Ton</span>
                                                    </div>
                                                    <div className="rate-tier-price">
                                                        ₹{rates.rate30.total.toLocaleString('en-IN')}
                                                        <span className="rate-tier-unit">/ ton</span>
                                                    </div>
                                                    <div className="rate-tier-breakdown">
                                                        Base ₹{rates.rate30.basic} + Hydraulic ₹{rates.rate30.hydraulic}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* 25 Ton */}
                                            {rates.rate25.available && (
                                                <motion.div
                                                    className="rate-tier-card"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <div className="rate-tier-header">
                                                        <Truck size={16} />
                                                        <span className="rate-tier-label">25 Ton</span>
                                                    </div>
                                                    <div className="rate-tier-price">
                                                        ₹{rates.rate25.total.toLocaleString('en-IN')}
                                                        <span className="rate-tier-unit">/ ton</span>
                                                    </div>
                                                    <div className="rate-tier-breakdown">
                                                        Base ₹{rates.rate25.basic} + Transport ₹{rates.rate25.transport} + Unloading ₹{rates.rate25.unloading}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* No rates available */}
                                            {!rates.rate40.available && !rates.rate30.available && !rates.rate25.available && (
                                                <div className="no-rates-msg">
                                                    <AlertCircle size={16} />
                                                    <span>Rate details not available for this pincode. Please contact us for pricing.</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Distance info */}
                                        {rates.km && parseFloat(rates.km) > 0 && (
                                            <div className="distance-info mt-3">
                                                <MapPin size={12} />
                                                <span>Distance: {rates.km} km</span>
                                                {rates.district && <span> · {rates.district}</span>}
                                            </div>
                                        )}

                                        {/* Contact info */}
                                        <div className="contact-info mt-3">
                                            For more details contact on{' '}
                                            <a href="tel:+919421008649" className="contact-phone">
                                                +91 9421008649
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default EconomicCalculator;
