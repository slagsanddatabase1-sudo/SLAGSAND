import React, { useState } from 'react';
import { RefreshCcw, TrendingUp, Calculator, AlertCircle } from 'lucide-react';
import { Card, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import './EconomicCalculator.css';

const EconomicCalculator = () => {
    const [isSqFt, setIsSqFt] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCustomQty, setIsCustomQty] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset: resetForm } = useForm({
        defaultValues: {
            quantity: '40',
            marketRate: ''
        }
    });

    const quantity = watch('quantity');
    const marketRate = watch('marketRate');
    const [dynamicRates, setDynamicRates] = useState({
        slag_basicrate: 1200,
        forty_ton_hydraulic: 150,
        thirty_ton_hydraulic: 180,
        transportation_by_truck: 200,
        unloading_charges: 50,
        marketConvFactor: 20,
        ourSqftFactor: 28
    });

    React.useEffect(() => {
        fetchDynamicRates();
    }, []);

    const fetchDynamicRates = async () => {
        try {
            const { data, error } = await supabase
                .from('global_configs')
                .select('*')
                .in('key', [
                    'slag_basicrate', 
                    'forty_ton_hydraulic',
                    'thirty_ton_hydraulic',
                    'transportation_by_truck',
                    'unloading_charges',
                    'calc_market_conv_factor',
                    'calc_sqft_density'
                ]);

            if (error) throw error;

            if (data && data.length > 0) {
                const configs = {};
                data.forEach(item => {
                    configs[item.key] = parseFloat(item.value);
                });

                const tonPriceFactors = {
                    slag_basicrate: parseFloat(configs.slag_basicrate) || 1200,
                    forty_ton_hydraulic: parseFloat(configs.forty_ton_hydraulic) || 150,
                    thirty_ton_hydraulic: parseFloat(configs.thirty_ton_hydraulic) || parseFloat(configs.forty_ton_hydraulic) || 180,
                    transportation_by_truck: parseFloat(configs.transportation_by_truck) || 200,
                    unloading_charges: parseFloat(configs.unloading_charges) || 50,
                    marketConvFactor: parseFloat(configs.calc_market_conv_factor) || 20,
                    ourSqftFactor: parseFloat(configs.calc_sqft_density) || 28
                };

                setDynamicRates(tonPriceFactors);
            }
        } catch (err) {
            console.error('Error fetching dynamic rates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        resetForm();
        setResults(null);
        setIsCustomQty(false);
    };

    const calculateSavings = (data) => {
        const inputVal = parseFloat(data.marketRate);
        if (isNaN(inputVal) || inputVal <= 0) {
            return;
        }
        const currentQty = data.quantity;

        let mRateTon, mRateSqFt;
        const CONVERSION_FACTOR = dynamicRates.marketConvFactor;
        
        let ourRateTon = 0;
        const { 
            slag_basicrate: basic,
            forty_ton_hydraulic: forty,
            thirty_ton_hydraulic: thirty,
            transportation_by_truck: transport,
            unloading_charges: unloading,
            ourSqftFactor: density
        } = dynamicRates;

        const rawQty = parseFloat(currentQty);
        const qtyVal = isSqFt ? rawQty / density : rawQty;
        
        if (qtyVal >= 40) {
            ourRateTon = basic + forty;
        } else if (qtyVal >= 30) {
            ourRateTon = basic + thirty;
        } else {
            ourRateTon = basic + transport + unloading;
        }

        const OUR_RATE_SQFT = ourRateTon / density;

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
            qty: currentQty
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
                {results && (
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
                            {!results ? (
                                <motion.div
                                    key="input-form"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                >
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
                                                        isInvalid={!!errors.quantity}
                                                        {...register('quantity', { 
                                                            required: "Quantity is required",
                                                            min: { value: 1, message: "Minimum 1 required" }
                                                        })}
                                                    />
                                                    <Form.Control.Feedback type="invalid" className="small-error">
                                                        {errors.quantity?.message}
                                                    </Form.Control.Feedback>
                                                </div>
                                            )}
                                        </div>

                                        <div className="toggle-group shadow-sm secondary-toggle mb-3">
                                            <button
                                                className={`btn-toggle ${!isSqFt ? 'active' : ''}`}
                                                onClick={() => setIsSqFt(false)}
                                            >
                                                Rate/Ton
                                            </button>
                                            <button
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
                                                        isInvalid={!!errors.marketRate}
                                                        {...register('marketRate', { 
                                                            required: "Market rate is required",
                                                            min: { value: 1, message: "Must be > 0" }
                                                        })}
                                                    />
                                                    <Form.Control.Feedback type="invalid" className="small-error">
                                                        {errors.marketRate?.message}
                                                    </Form.Control.Feedback>
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
                            ) : (
                                <motion.div
                                    key="results-view"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <div className="results-section pt-0 border-0">
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
