import React, { useState } from 'react';
import { RefreshCcw, TrendingUp, Calculator, MapPin, CheckCircle, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { Card, Button, Form, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import './EconomicCalculator.css';

const EconomicCalculator = () => {
    const [isSqFt, setIsSqFt] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCustomQty, setIsCustomQty] = useState(false);

    // Pincode state
    const [pincode, setPincode] = useState('');
    const [pincodeData, setPincodeData] = useState(null);
    const [pincodeError, setPincodeError] = useState('');
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [pincodeVerified, setPincodeVerified] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset: resetForm } = useForm({
        defaultValues: {
            quantity: '40',
            marketRate: ''
        }
    });

    const quantity = watch('quantity');
    const marketRate = watch('marketRate');

    // Global conversion factors (not pincode-specific)
    const [conversionFactors, setConversionFactors] = useState({
        marketConvFactor: 20,
        ourSqftFactor: 28
    });

    React.useEffect(() => {
        fetchConversionFactors();
    }, []);

    const fetchConversionFactors = async () => {
        try {
            const { data, error } = await supabase
                .from('global_configs')
                .select('*')
                .in('key', ['calc_market_conv_factor', 'calc_sqft_density']);

            if (error) {
                console.warn('⚠️ Could not fetch conversion factors. Using defaults.', error.message);
                return;
            }

            if (data && data.length > 0) {
                const factors = { ...conversionFactors };
                data.forEach(item => {
                    if (item.key === 'calc_market_conv_factor') factors.marketConvFactor = parseFloat(item.value) || 20;
                    if (item.key === 'calc_sqft_density') factors.ourSqftFactor = parseFloat(item.value) || 28;
                });
                setConversionFactors(factors);
            }
        } catch (err) {
            console.error('Error fetching conversion factors:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePincodeCheck = async () => {
        const cleanPincode = pincode.trim();
        if (!cleanPincode || cleanPincode.length !== 6 || isNaN(cleanPincode)) {
            setPincodeError('Please enter a valid 6-digit pincode');
            return;
        }

        setPincodeLoading(true);
        setPincodeError('');
        setPincodeData(null);

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
            if (deliveryStatus === 'No Delivery') {
                setPincodeError('Sorry, delivery is not available at this pincode.');
                setPincodeVerified(false);
                return;
            }

            setPincodeData(record);
            setPincodeVerified(true);
            setPincodeError('');
        } catch (err) {
            console.error('Error checking pincode:', err);
            setPincodeError('Something went wrong. Please try again.');
        } finally {
            setPincodeLoading(false);
        }
    };

    const handlePincodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePincodeCheck();
        }
    };

    const handleReset = () => {
        resetForm();
        setResults(null);
        setIsCustomQty(false);
        setPincode('');
        setPincodeData(null);
        setPincodeError('');
        setPincodeVerified(false);
    };

    const calculateSavings = (data) => {
        if (!pincodeData) return;

        const inputVal = parseFloat(data.marketRate);
        if (isNaN(inputVal) || inputVal <= 0) return;

        const currentQty = data.quantity;
        const CONVERSION_FACTOR = conversionFactors.marketConvFactor;
        const density = conversionFactors.ourSqftFactor;

        // Extract rates from the pincode record
        const basic = parseFloat(pincodeData.slag_basicrate) || 0;
        const forty = parseFloat(pincodeData.forty_ton_hydraulic) || 0;
        const thirty = parseFloat(pincodeData.thirty_ton_hydraulic) || 0;
        const transport = parseFloat(pincodeData.transportation_by_truck) || 0;
        const unloading = parseFloat(pincodeData.unloading_charges) || 0;

        const rawQty = parseFloat(currentQty);
        const qtyVal = isSqFt ? rawQty / density : rawQty;

        let ourRateTon = 0;
        if (qtyVal >= 40) {
            ourRateTon = basic + forty;
        } else if (qtyVal >= 30) {
            ourRateTon = basic + thirty;
        } else {
            ourRateTon = basic + transport + unloading;
        }

        const OUR_RATE_SQFT = ourRateTon / density;

        let mRateTon, mRateSqFt;
        if (isSqFt) {
            mRateSqFt = inputVal;
            mRateTon = mRateSqFt * CONVERSION_FACTOR;
        } else {
            mRateTon = inputVal;
            mRateSqFt = mRateTon / CONVERSION_FACTOR;
        }

        const savingsTon = mRateTon - ourRateTon;
        const savingsSqFt = mRateSqFt - OUR_RATE_SQFT;

        setResults({
            marketRateTon: mRateTon.toFixed(2),
            marketRateSqFt: mRateSqFt.toFixed(2),
            ourRateTon: ourRateTon.toFixed(2),
            ourRateSqFt: OUR_RATE_SQFT.toFixed(2),
            savingsTon: savingsTon.toFixed(2),
            savingsSqFt: savingsSqFt.toFixed(2),
            totalSavings: (savingsTon * qtyVal).toFixed(2),
            qty: currentQty,
            city: pincodeData.city || pincodeData.City || ''
        });
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
                <h6 className="mb-0 fw-bold header-title text-small">Economic Calculator</h6>
                {(pincodeVerified || results) && (
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
                            {!pincodeVerified && !results && (
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

                            {/* STEP 2: CALCULATOR FORM (after pincode verified) */}
                            {pincodeVerified && !results && (
                                <motion.div
                                    key="input-form"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                >
                                    {/* Pincode verified badge */}
                                    <div className="pincode-verified-badge mb-3">
                                        <CheckCircle size={14} />
                                        <span>{pincodeData?.city || pincode}</span>
                                        <span className="pincode-badge-code">{pincode}</span>
                                    </div>

                                    <Form className="input-section p-1" onSubmit={handleSubmit(calculateSavings)} noValidate>
                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label className="input-label-small mb-0">Quantity</label>
                                                <span className="badge-unit">{isSqFt ? "Sq Ft" : "Tons"}</span>
                                            </div>
                                            <div className="toggle-group shadow-sm mb-2">
                                                {(isSqFt ? ['500', '1000', '2000', 'custom'] : ['25', '30', '40', 'custom']).map((q) => (
                                                    <button
                                                        key={q}
                                                        type="button"
                                                        className={`btn-toggle shadow-none ${quantity === q || (q === 'custom' && isCustomQty) ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (q === 'custom') {
                                                                setIsCustomQty(true);
                                                                setValue('quantity', '');
                                                            } else {
                                                                setIsCustomQty(false);
                                                                setValue('quantity', q);
                                                            }
                                                        }}
                                                    >
                                                        {q === 'custom' ? 'Custom' : isSqFt ? q : q + 'T'}
                                                    </button>
                                                ))}
                                            </div>
                                            {isCustomQty && (
                                                <div className="custom-qty-wrapper">
                                                    <Form.Control
                                                        type="number"
                                                        className="market-input-styled custom-qty-input"
                                                        placeholder={isSqFt ? "Enter Sq Ft" : "Enter Tons"}
                                                        {...register('quantity', { 
                                                            required: true,
                                                            min: 1
                                                        })}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="toggle-group shadow-sm secondary-toggle mb-3">
                                            <button
                                                type="button"
                                                className={`btn-toggle ${!isSqFt ? 'active' : ''}`}
                                                onClick={() => setIsSqFt(false)}
                                            >
                                                Rate/Ton
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-toggle ${isSqFt ? 'active' : ''}`}
                                                onClick={() => setIsSqFt(true)}
                                            >
                                                Rate/SqFt
                                            </button>
                                        </div>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="input-label-highlight mb-2 text-compact">
                                                    {isSqFt ? "What is the current market rate for River Sand per sqft in your area?" : "What is the current market rate for River Sand per ton in your area?"}
                                                </Form.Label>
                                                <div className="input-with-icon">
                                                    <span className="currency-prefix-small">₹</span>
                                                    <Form.Control
                                                        type="number"
                                                        className="market-input-styled compact"
                                                        placeholder="0.00"
                                                        {...register('marketRate', { 
                                                            required: true,
                                                            min: 1
                                                        })}
                                                    />
                                                </div>
                                            </Form.Group>

                                            <Button
                                                type="submit"
                                                variant="dark"
                                                className="calculate-btn border-0"
                                            >
                                                Calculate Savings
                                            </Button>
                                    </Form>
                                </motion.div>
                            )}

                            {/* STEP 3: RESULTS */}
                            {results && (
                                <motion.div
                                    key="results-view"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <div className="results-section pt-0 border-0">
                                        {/* Location tag in results */}
                                        <div className="pincode-verified-badge mb-3" style={{ justifyContent: 'center' }}>
                                            <MapPin size={13} />
                                            <span>{results.city || pincode}</span>
                                            <span className="pincode-badge-code">{pincode}</span>
                                        </div>

                                        <div className="result-grid">
                                            <div className="result-card">
                                                <span className="result-label">Your Market Rate</span>
                                                <span className="result-value">₹{isSqFt ? results.marketRateSqFt : results.marketRateTon} <small className="fs-6 opacity-50">{isSqFt ? "/ Sq Ft" : "/ Ton"}</small></span>
                                            </div>
                                            <div className="result-card highlight">
                                                <span className="result-label">Our Rate</span>
                                                <span className="result-value text-black">₹{isSqFt ? results.ourRateSqFt : results.ourRateTon} <small className="fs-6 opacity-75">{isSqFt ? "/ Sq Ft" : "/ Ton"}</small></span>
                                            </div>
                                        </div>

                                        <div className="savings-banner">
                                            <span className="savings-label">
                                                <TrendingUp size={18} className="me-2" />
                                                Total Savings ({results.qty || quantity} {isSqFt ? "Sq Ft" : "Tons"})
                                            </span>
                                            <span className="savings-value">
                                                ₹{results.totalSavings}
                                            </span>
                                        </div>

                                        <div className="result-grid mt-4">
                                            <div className="result-card bg-transparent border-0 py-0">
                                                <span className="result-label">Savings / Ton</span>
                                                <span className="fw-bold">₹{results.savingsTon}</span>
                                            </div>
                                            <div className="result-card bg-transparent border-0 py-0">
                                                <span className="result-label">Savings / Sq Ft</span>
                                                <span className="fw-bold text-white">₹{results.savingsSqFt}</span>
                                            </div>
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
