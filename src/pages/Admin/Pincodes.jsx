import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Modal, Form, Row, Col, Alert, Tabs, Tab, Card } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, Upload, Download, Search, ToggleLeft, ToggleRight, Info, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import Papa from 'papaparse';

const Pincodes = () => {
    const { userRole } = useOutletContext();
    const [pincodes, setPincodes] = useState([]);
    const [filteredPincodes, setFilteredPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [districtFilter, setDistrictFilter] = useState('All');
    const [globalRates, setGlobalRates] = useState({
        slag_basicrate: '',
        transportation_by_truck: '',
        unloading_charges: '',
        km: '',
        forty_ton_hydraulic: '',
        thirty_ton_hydraulic: ''
    });
    const [districts, setDistricts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [updateTarget, setUpdateTarget] = useState('all'); // 'all' or 'selected'

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const currentIds = currentPincodes.map(p => p.id);
            setSelectedIds(prev => [...new Set([...prev, ...currentIds])]);
        } else {
            const currentIds = currentPincodes.map(p => p.id);
            setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleGlobalUpdate = async () => {
        const targetCount = updateTarget === 'all' ? filteredPincodes.length : selectedIds.length;
        
        if (updateTarget === 'selected' && selectedIds.length === 0) {
            alert('Please select at least one pincode from the table.');
            return;
        }

        if (!window.confirm(`This will update specified rates for ${updateTarget === 'all' ? 'ALL' : selectedIds.length} ${updateTarget === 'all' ? 'matched' : ''} pincodes. Are you sure?`)) return;

        try {
            setLoading(true);

            // 1. Save to global_configs table (only if updating all)
            if (updateTarget === 'all') {
                const configUpdates = Object.entries(globalRates)
                    .filter(([key, value]) => value !== '')
                    .map(([key, value]) => ({ key, value }));

                if (configUpdates.length > 0) {
                    const { error: configError } = await supabase
                        .from('global_configs')
                        .upsert(configUpdates);
                    if (configError) throw configError;
                }
            }

            // 2. Prepare update data
            const updateData = {};
            if (globalRates.slag_basicrate !== '') updateData.slag_basicrate = globalRates.slag_basicrate;
            if (globalRates.transportation_by_truck !== '') updateData.transportation_by_truck = globalRates.transportation_by_truck;
            if (globalRates.unloading_charges !== '') updateData.unloading_charges = globalRates.unloading_charges;
            if (globalRates.km !== '') updateData.km = globalRates.km;
            if (globalRates.forty_ton_hydraulic !== '') updateData.forty_ton_hydraulic = globalRates.forty_ton_hydraulic;
            if (globalRates.thirty_ton_hydraulic !== '') updateData.thirty_ton_hydraulic = globalRates.thirty_ton_hydraulic;

            if (Object.keys(updateData).length === 0) {
                alert('Please enter at least one value to update');
                setLoading(false);
                return;
            }

            // 3. Update pincodes in database
            let query = supabase.from('pincodes').update(updateData);
            
            if (updateTarget === 'all') {
                // If there are filters applied, we should probably only update filtered ones?
                // The original code used .neq('id', 0) which is "all".
                // But the user might expect it to apply to the CURRENTLY FILTERED list if they are looking at it.
                // However, "Apply to All" usually means "Everything".
                // I'll stick to 'all' = all matching filters or all in DB?
                // The original code was: .neq('id', 0) -> update ALL in DB.
                // I will maintain that for 'all', but add filter if updateTarget is 'selected'.
                query = query.neq('id', 0);
            } else {
                query = query.in('id', selectedIds);
            }

            const { error } = await query;
            if (error) throw error;

            // 4. Re-calculate final prices for affected pincodes
            let fetchQuery = supabase.from('pincodes').select('*');
            if (updateTarget === 'selected') {
                fetchQuery = fetchQuery.in('id', selectedIds);
            }

            const { data: affectedPincodes, error: fetchError } = await fetchQuery;
            if (fetchError) throw fetchError;

            for (const p of affectedPincodes) {
                const basic = parseFloat(p.slag_basicrate) || 0;
                const transport = parseFloat(p.transportation_by_truck) || 0;
                const unloading = parseFloat(p.unloading_charges) || 0;
                const final = basic + transport + unloading;

                await supabase.from('pincodes').update({ final_price: final.toFixed(2).toString() }).eq('id', p.id);
            }

            alert(`${updateTarget === 'all' ? 'Global' : 'Selected'} rates updated and final prices recalculated!`);
            setSelectedIds([]); // Clear selection after update
            fetchPincodes();
        } catch (error) {
            console.error('Error in global update:', error);
            alert('Global update failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateCurrentPincodeWithAutoCalc = (updates) => {
        const next = { ...currentPincode, ...updates };

        // Auto Calc Formula: Final = Basic + Transport + Unloading
        const basic = parseFloat(next.slag_basicrate) || 0;
        const transport = parseFloat(next.transportation_by_truck) || 0;
        const unloading = parseFloat(next.unloading_charges) || 0;

        const final = basic + transport + unloading;
        next.final_price = final > 0 ? final.toFixed(2) : next.final_price;

        setCurrentPincode(next);
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const [currentPincode, setCurrentPincode] = useState({
        pincode: '',
        city: '',
        district: '',
        division: '',
        delivery_status: '',
        slag_basicrate: '',
        transportation_by_truck: '',
        unloading_charges: '',
        km: '',
        forty_ton_hydraulic: '',
        thirty_ton_hydraulic: '',
        final_price: '',
        is_active: true
    });

    useEffect(() => {
        fetchPincodes();
    }, []);

    useEffect(() => {
        // Filter pincodes based on search term and filters
        let result = pincodes;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                (p.pincode?.toString() || '').includes(term) ||
                (p.city || '').toLowerCase().includes(term) ||
                (p.district || '').toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'All') {
            result = result.filter(p => (p.delivery_status || p.deliverystatus) === statusFilter);
        }

        if (districtFilter !== 'All') {
            result = result.filter(p => (p.district || p.District) === districtFilter);
        }

        setFilteredPincodes(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, districtFilter, pincodes]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPincodes = filteredPincodes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPincodes.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // ... (fetchPincodes and others remain same until return) ...
    // Note: I will use previous tool output for those functions.
    // I need to skip re-declaring them here as I'm replacing the top part ONLY if I use view_file.
    // BUT replace_file_content replaces a block.
    // I need to replace the imports and state definition, and the rendering at the bottom.
    // The previous edit replaced the functions.
    // I will replace ONLY from imports to useEffect, and then the render part.
    // This tool call below targets lines 4 to 44.

    // WAIT, I need to wrap this in a valid Step.
    // I'll execute the replacement for the import and state part now.


    const fetchGlobalConfigs = async () => {
        try {
            const { data, error } = await supabase.from('global_configs').select('*');
            if (error) throw error;

            const rates = { ...globalRates };
            data.forEach(config => {
                if (rates.hasOwnProperty(config.key)) {
                    rates[config.key] = config.value;
                }
            });
            setGlobalRates(rates);
            return rates;
        } catch (error) {
            console.error('Error fetching global configs:', error);
            return globalRates;
        }
    };

    const fetchPincodes = async () => {
        try {
            setLoading(true);
            await fetchGlobalConfigs();
            const { data, error } = await supabase
                .from('pincodes')
                .select('*')
                .order('city', { ascending: true });

            if (error) throw error;
            setPincodes(data || []);
            setFilteredPincodes(data || []);

            const uniqueDistricts = [...new Set((data || []).map(p => p.district || p.District).filter(Boolean))].sort();
            setDistricts(uniqueDistricts);
        } catch (error) {
            console.error('Error fetching pincodes:', error);
            alert('Failed to fetch pincodes');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (pincode = null) => {
        if (pincode) {
            setEditMode(true);
            setCurrentPincode({
                ...pincode,
                city: pincode.city || pincode.City || '',
                pincode: pincode.pincode || pincode.Pincode || '',
                district: pincode.district || pincode.District || '',
                division: pincode.division || pincode.Division || '',
                delivery_status: pincode.delivery_status || pincode.deliverystatus || '',
                slag_basicrate: pincode.slag_basicrate || '',
                transportation_by_truck: pincode.transportation_by_truck || pincode.transport_rate || pincode['transportation By truck'] || '',
                unloading_charges: pincode.unloading_charges || '',
                km: pincode.km || pincode['Km '] || '',
                forty_ton_hydraulic: pincode.forty_ton_hydraulic || pincode.forty_ton_hydraulic_type || pincode['40 Ton hydrallic Type'] || '',
                thirty_ton_hydraulic: pincode.thirty_ton_hydraulic || pincode.thirty_ton_hydraulic_type || pincode['30 Ton hydrallic type'] || '',
                final_price: pincode.final_price || ''
            });
        } else {
            setEditMode(false);
            // Pre-fill with global rates for new pincode
            setCurrentPincode({
                pincode: '',
                city: '',
                district: '',
                division: '',
                delivery_status: 'Delivery',
                slag_basicrate: globalRates.slag_basicrate || '',
                transportation_by_truck: globalRates.transportation_by_truck || '',
                unloading_charges: globalRates.unloading_charges || '',
                km: '',
                forty_ton_hydraulic: '',
                thirty_ton_hydraulic: '',
                final_price: '',
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            // Validate inputs
            if (!currentPincode.pincode || currentPincode.pincode.length !== 6) {
                alert('Please enter a valid 6-digit pincode');
                return;
            }

            const pincodeData = {
                pincode: currentPincode.pincode,
                city: currentPincode.city || null,
                district: currentPincode.district || null,
                division: currentPincode.division || null,
                delivery_status: currentPincode.delivery_status || null,
                slag_basicrate: currentPincode.slag_basicrate?.toString() || null,
                transportation_by_truck: currentPincode.transportation_by_truck?.toString() || null,
                unloading_charges: currentPincode.unloading_charges?.toString() || null,
                km: currentPincode.km?.toString() || null,
                forty_ton_hydraulic: currentPincode.forty_ton_hydraulic?.toString() || null,
                thirty_ton_hydraulic: currentPincode.thirty_ton_hydraulic?.toString() || null,
                final_price: currentPincode.final_price?.toString() || null,
                is_active: currentPincode.is_active
            };

            if (editMode) {
                const { error } = await supabase
                    .from('pincodes')
                    .update(pincodeData)
                    .eq('id', currentPincode.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('pincodes')
                    .insert([pincodeData]);

                if (error) throw error;
            }

            setShowModal(false);
            fetchPincodes();
        } catch (error) {
            console.error('Error saving pincode:', error);
            alert('Failed to save pincode: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pincode?')) return;

        try {
            const { error } = await supabase
                .from('pincodes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchPincodes();
        } catch (error) {
            console.error('Error deleting pincode:', error);
            alert('Failed to delete pincode');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('pincodes')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchPincodes();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status');
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('ARE YOU SURE? This will delete ALL pincodes permanently!')) return;
        if (!window.confirm('Really delete everything? This cannot be undone.')) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('pincodes')
                .delete()
                .neq('id', 0); // Delete all rows where ID is not 0 (which is all rows)

            if (error) throw error;

            alert('All pincodes have been deleted.');
            fetchPincodes();
        } catch (error) {
            console.error('Error deleting all pincodes:', error);
            alert('Failed to delete all pincodes: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCSVImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    setLoading(true);
                    const validData = results.data
                        .filter(row => row.pincode && row.pincode.toString().trim())
                        .map(row => {
                            const p = row.pincode || row.Pincode || row.PINCODE;
                            return {
                                pincode: p?.toString().trim(),
                                city: (row.city || row.City)?.trim() || null,
                                district: (row.district || row.District)?.trim() || null,
                                division: (row.division || row.Division)?.trim() || null,
                                delivery_status: (row.delivery_status || row.deliverystatus || row['Delivery Status'] || row['delivery_status'])?.trim() || null,
                                slag_basicrate: (row.slag_basicrate || row.Slag_basicrate || row['Slag Basicrate'] || row['slag_basicrate'])?.toString() || null,
                                transportation_by_truck: (row.transportation_by_truck || row.transport_rate || row.transportation_rate || row['transportation By truck'] || row['Transportation by truck'])?.toString() || null,
                                unloading_charges: (row.unloading_charges || row['Unloading charges'] || row['unloading_charges'])?.toString() || null,
                                km: (row.km || row.KM || row.Km || row['Km '] || row['km'])?.toString() || null,
                                forty_ton_hydraulic: (row.forty_ton_hydraulic || row.forty_ton_hydraulic_type || row['40 Ton hydrallic Type'] || row['40 Ton'])?.toString() || null,
                                thirty_ton_hydraulic: (row.thirty_ton_hydraulic || row.thirty_ton_hydraulic_type || row['30 Ton hydrallic type'] || row['30 Ton'])?.toString() || null,
                                final_price: (row.final_price || row['Final Price'] || row['final_price'])?.toString() || null
                            };
                        });

                    if (validData.length === 0) {
                        alert('No valid data found in CSV');
                        setLoading(false);
                        return;
                    }

                    // SKIP deduplication as requested by user
                    // const uniqueDataMap = new Map();
                    // validData.forEach(item => {
                    //     uniqueDataMap.set(item.pincode, item);
                    // });
                    // const uniqueData = Array.from(uniqueDataMap.values());

                    // if (uniqueData.length < validData.length) {
                    //     console.log(`Removed ${validData.length - uniqueData.length} duplicate pincodes from CSV.`);
                    // }

                    // Batch processing
                    const BATCH_SIZE = 100;
                    let successCount = 0;

                    for (let i = 0; i < validData.length; i += BATCH_SIZE) {
                        const batch = validData.slice(i, i + BATCH_SIZE);

                        // Use insert instead of upsert to allow duplicates
                        const { error } = await supabase
                            .from('pincodes')
                            .insert(batch);

                        if (error) {
                            console.error(`Error importing batch ${i / BATCH_SIZE + 1}:`, error);
                            // We continue with other batches even if one fails
                        } else {
                            successCount += batch.length;
                        }
                    }

                    alert(`Import Complete!\n\nTotal Rows in CSV: ${results.data.length}\nValid Rows: ${validData.length}\nSuccessfully Imported: ${successCount}`);
                    fetchPincodes();
                } catch (error) {
                    console.error('Error importing CSV:', error);
                    alert('Failed to import CSV: ' + error.message);
                    setLoading(false);
                }
            },
            error: (error) => {
                console.error('CSV parsing error:', error);
                alert('Failed to parse CSV file');
                setLoading(false);
            }
        });

        // Reset file input
        event.target.value = '';
    };

    const handleCSVExport = () => {
        const csvData = pincodes.map(p => ({
            city: p.city || '',
            pincode: p.pincode,
            deliverystatus: p.deliverystatus || '',
            district: p.district || '',
            division: p.division || '',
            slag_basicrate: p.slag_basicrate || '',
            'transportation By truck': p['transportation By truck'] || '',
            unloading_charges: p.unloading_charges || '',
            'Km ': p['Km '] || '',
            '40 Ton hydrallic Type': p['40 Ton hydrallic Type'] || '',
            '30 Ton hydrallic type': p['30 Ton hydrallic type'] || '',
            final_price: p.final_price || '',
            is_active: p.is_active
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pincodes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div className="text-start">
                    <h2 className="fw-bold mb-1 fs-3">Pincodes & Pricing</h2>
                    <div className="d-flex align-items-center gap-2">
                        <p className="text-muted small mb-0">Manage delivery locations and pricing</p>
                        <Badge bg="secondary" pill className="small">Total: {pincodes.length}</Badge>
                    </div>
                </div>
                <div className="d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
                    {(userRole === 'admin' || userRole === 'executive') && (
                        <>
                            <Button variant="outline-danger" size="sm" onClick={handleDeleteAll} className="px-3">
                                <Trash2 size={16} className="me-1" /> Delete All
                            </Button>
                            <Button variant="outline-success" size="sm" onClick={handleCSVExport} className="px-3">
                                <Download size={16} className="me-1" /> Export
                            </Button>
                            <Button variant="outline-primary" size="sm" as="label" style={{ cursor: 'pointer' }} className="px-3">
                                <Upload size={16} className="me-1" /> Import
                                <input type="file" accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => handleOpenModal()} className="px-3">
                                <Plus size={16} className="me-1" /> Add New
                            </Button>
                        </>
                    )}
                    {userRole === 'staff' && (
                        <Button variant="outline-success" size="sm" onClick={handleCSVExport} className="px-3">
                            <Download size={16} className="me-1" /> Export List
                        </Button>
                    )}
                </div>
            </div>

            {/* Global Pricing Update Section */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 bg-light">
                <Card.Body className="p-3 p-md-4">
                    <h5 className="fw-bold mb-3 d-flex flex-wrap align-items-center gap-2">
                        <Calculator size={20} className="text-primary" /> 
                        <span>Global Pricing Settings</span>
                        <small className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>(All pincodes)</small>
                    </h5>
                    <Row className="g-3 align-items-end">
                        <Col xs={12} sm={4} lg={2}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-muted">Basic Rate (₹)</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Basic" value={globalRates.slag_basicrate} onChange={(e) => setGlobalRates({ ...globalRates, slag_basicrate: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={4} lg={2}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-muted">Transport (₹)</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Transport" value={globalRates.transportation_by_truck} onChange={(e) => setGlobalRates({ ...globalRates, transportation_by_truck: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={4} lg={2}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-muted">Unloading (₹)</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Unloading" value={globalRates.unloading_charges} onChange={(e) => setGlobalRates({ ...globalRates, unloading_charges: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={4} lg={2}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-muted">Km</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Enter Kilometers" value={globalRates.km} onChange={(e) => setGlobalRates({ ...globalRates, km: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={4} lg={2}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-muted">40 Ton (₹)</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Enter Tons" value={globalRates.forty_ton_hydraulic} onChange={(e) => setGlobalRates({ ...globalRates, forty_ton_hydraulic: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} sm={4} lg={2}>
                            <Form.Group>
                                <Form.Label className="x-small fw-bold text-muted">30 Ton (₹)</Form.Label>
                                <Form.Control size="sm" type="text" placeholder="Enter Tons" value={globalRates.thirty_ton_hydraulic} onChange={(e) => setGlobalRates({ ...globalRates, thirty_ton_hydraulic: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} lg={4}>
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex gap-3 mb-1">
                                    <Form.Check 
                                        type="radio"
                                        label="All Pincodes"
                                        name="updateTarget"
                                        id="target-all"
                                        checked={updateTarget === 'all'}
                                        onChange={() => setUpdateTarget('all')}
                                        className="small fw-bold cursor-pointer"
                                    />
                                    <Form.Check 
                                        type="radio"
                                        label={`Selected Pincodes (${selectedIds.length})`}
                                        name="updateTarget"
                                        id="target-selected"
                                        checked={updateTarget === 'selected'}
                                        onChange={() => setUpdateTarget('selected')}
                                        className="small fw-bold cursor-pointer"
                                    />
                                </div>
                                <Button variant="dark" size="sm" onClick={handleGlobalUpdate} disabled={loading || userRole === 'staff'} className="w-100 py-2 fw-bold">
                                    {loading ? <Spinner animation="border" size="sm" /> : 
                                     userRole === 'staff' ? 'Updating pricing restricted' :
                                     updateTarget === 'all' ? 'Apply to ALL Pincodes & Recalculate' : 
                                     `Apply to ${selectedIds.length} Selected Pincodes & Recalculate`}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Filters Section */}
            <div className="bg-white p-3 rounded shadow-sm border mb-4">
                <Row className="g-3">
                    <Col xs={12} md={4}>
                        <Form.Label className="small fw-bold text-muted">Search</Form.Label>
                        <div className="position-relative">
                            <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <Form.Control
                                type="text"
                                placeholder="Pincode, City, District..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="ps-5"
                            />
                        </div>
                    </Col>
                    <Col xs={6} md={3}>
                        <Form.Label className="small fw-bold text-muted">District</Form.Label>
                        <Form.Select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
                            <option value="All">All Districts</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </Form.Select>
                    </Col>
                    <Col xs={6} md={3}>
                        <Form.Label className="small fw-bold text-muted">Status</Form.Label>
                        <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Delivery">Delivery</option>
                            <option value="No Delivery">No Delivery</option>
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={2} className="d-flex align-items-end">
                        <Button variant="outline-secondary" className="w-100" onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('All');
                            setDistrictFilter('All');
                        }}>Reset</Button>
                    </Col>
                </Row>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <div className="bg-white rounded-3 shadow-sm border mb-4">
                    <div className="table-responsive-wrapper" style={{ maxHeight: '600px' }}>
                        <Table hover className="align-middle mb-0" style={{ minWidth: '1200px' }}>
                            <thead className="bg-light text-secondary">
                                <tr>
                                    {updateTarget === 'selected' && (
                                        <th className="border-0 font-weight-bold" style={{ width: '40px' }}>
                                            <Form.Check 
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={currentPincodes.length > 0 && currentPincodes.every(p => selectedIds.includes(p.id))}
                                                indeterminate={selectedIds.length > 0 && !currentPincodes.every(p => selectedIds.includes(p.id))}
                                            />
                                        </th>
                                    )}
                                    <th className="border-0 font-weight-bold">City</th>
                                    <th className="border-0 font-weight-bold">Pincode</th>
                                    <th className="border-0 font-weight-bold">Status</th>
                                    <th className="border-0 font-weight-bold">District</th>
                                    <th className="border-0 font-weight-bold">Basic Rate</th>
                                    <th className="border-0 font-weight-bold">Transport</th>
                                    <th className="border-0 font-weight-bold">Unloading</th>
                                    <th className="border-0 font-weight-bold">Km</th>
                                    <th className="border-0 font-weight-bold text-end">40 Ton</th>
                                    <th className="border-0 font-weight-bold text-end">30 Ton</th>
                                    <th className="border-0 font-weight-bold text-end">Final Price</th>
                                    <th className="border-0 font-weight-bold text-center">Active</th>
                                    {(userRole === 'admin' || userRole === 'executive') && (
                                        <th className="border-0 font-weight-bold text-end">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {currentPincodes.length > 0 ? (
                                    currentPincodes.map((p) => (
                                        <tr key={p.id} className={updateTarget === 'selected' && selectedIds.includes(p.id) ? 'table-primary' : ''}>
                                            {updateTarget === 'selected' && (
                                                <td>
                                                    <Form.Check 
                                                        type="checkbox"
                                                        checked={selectedIds.includes(p.id)}
                                                        onChange={() => handleSelectRow(p.id)}
                                                    />
                                                </td>
                                            )}
                                            <td className="fw-medium text-dark">{p.city || p.City || '-'}</td>
                                            <td>
                                                <Badge bg="light" text="dark" className="border">
                                                    {p.pincode || p.Pincode || p.PINCODE || '-'}
                                                </Badge>
                                            </td>
                                            <td>
                                                {(() => {
                                                    const status = p.delivery_status || p.deliverystatus || p['Delivery Status'] || p.Status;
                                                    return (
                                                        <Badge bg={status === 'Delivery' ? 'success' : 'secondary'} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                                                            {status || 'N/A'}
                                                        </Badge>
                                                    );
                                                })()}
                                            </td>
                                            <td className="text-muted small">{p.district || p.District || '-'}</td>
                                            <td className="text-muted">{p.slag_basicrate || p.Slag_basicrate || p['Slag Basicrate'] || p.slag_basicrate || '-'}</td>
                                            <td className="text-muted">{p.transportation_by_truck || p.transport_rate || p.transportation_rate || p['transportation By truck'] || p['Transportation by truck'] || '-'}</td>
                                            <td className="text-muted">{p.unloading_charges || p['Unloading charges'] || p.unloading_charges || '-'}</td>
                                            <td className="text-muted">{p.km || p.KM || p.Km || p['Km '] || p.km || '-'}</td>
                                            <td className="text-end text-muted">
                                                {(() => {
                                                    const basic = parseFloat(p.slag_basicrate) || 0;
                                                    const val = parseFloat(p.forty_ton_hydraulic || p.forty_ton_hydraulic_type || p['40 Ton hydrallic Type'] || p['40 Ton Hydraulic Type'] || p['40 Ton']) || 0;
                                                    return val > 0 ? (basic + val).toFixed(2) : '-';
                                                })()}
                                            </td>
                                            <td className="text-end text-muted">
                                                {(() => {
                                                    const basic = parseFloat(p.slag_basicrate) || 0;
                                                    const val = parseFloat(p.thirty_ton_hydraulic || p.thirty_ton_hydraulic_type || p['30 Ton hydrallic type'] || p['30 Ton Hydraulic type'] || p['30 Ton']) || 0;
                                                    return val > 0 ? (basic + val).toFixed(2) : '-';
                                                })()}
                                            </td>
                                            <td className="text-end fw-bold text-success">
                                                {(() => {
                                                    const basic = parseFloat(p.slag_basicrate) || 0;
                                                    const transport = parseFloat(p.transportation_by_truck || p.transport_rate || p.transportation_rate || p['transportation By truck'] || p['Transportation by truck']) || 0;
                                                    const unloading = parseFloat(p.unloading_charges || p['Unloading charges'] || p.unloading_charges) || 0;
                                                    return (basic + transport + unloading).toFixed(2);
                                                })()}
                                            </td>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="switch"
                                                    id={`switch-${p.id}`}
                                                    checked={p.is_active}
                                                    disabled={userRole === 'staff'}
                                                    onChange={() => handleToggleActive(p.id, p.is_active)}
                                                />
                                            </td>
                                            {(userRole === 'admin' || userRole === 'executive') && (
                                                <td className="text-end">
                                                    <Button variant="link" size="sm" className="me-2 text-primary p-0" onClick={() => handleOpenModal(p)}>
                                                        <Edit2 size={16} />
                                                    </Button>
                                                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this pincode?')) {
                                                            handleDelete(p.id);
                                                        }
                                                    }}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="text-center py-5 text-muted">
                                            <div className="d-flex flex-column align-items-center">
                                                <Search size={32} className="mb-3 opacity-50" />
                                                <p className="mb-0">No pincodes found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                        {/* Pagination Controls */}
                        {filteredPincodes.length > itemsPerPage && (
                            <div className="d-flex justify-content-between align-items-center p-3 bg-white border-top">
                                <span className="text-muted small">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPincodes.length)} of {filteredPincodes.length} entries
                                </span>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={16} /> Previous
                                    </Button>
                                    <span className="align-self-center px-2 text-muted small">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{editMode ? 'Edit Pincode' : 'Add New Pincode'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-3 p-md-4">
                    <Tabs defaultActiveKey="basic" className="mb-3">
                        <Tab eventKey="basic" title="Basic Info">
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Pincode *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter 6-digit pincode"
                                                value={currentPincode.pincode}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, pincode: e.target.value })}
                                                disabled={editMode}
                                                maxLength={6}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter city name"
                                                value={currentPincode.city}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, city: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">District</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter district"
                                                value={currentPincode.district}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, district: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Division</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter division"
                                                value={currentPincode.division}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, division: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Delivery Status</Form.Label>
                                            <Form.Select
                                                value={currentPincode.delivery_status}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, delivery_status: e.target.value })}
                                            >
                                                <option value="">Select Status</option>
                                                <option value="Delivery">Delivery</option>
                                                <option value="No Delivery">No Delivery</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                label="Active"
                                                checked={currentPincode.is_active}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, is_active: e.target.checked })}
                                                className="mt-4"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Tab>

                        <Tab eventKey="pricing" title="Pricing">
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Slag Basic Rate (₹)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="0 or NA"
                                                value={currentPincode.slag_basicrate}
                                                onChange={(e) => updateCurrentPincodeWithAutoCalc({ slag_basicrate: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Transport Rate (₹)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="0 or NA"
                                                value={currentPincode.transportation_by_truck}
                                                onChange={(e) => updateCurrentPincodeWithAutoCalc({ transportation_by_truck: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Unloading Charges (₹)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="0 or NA"
                                                value={currentPincode.unloading_charges}
                                                onChange={(e) => updateCurrentPincodeWithAutoCalc({ unloading_charges: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Km</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="0 or NA"
                                                value={currentPincode.km}
                                                onChange={(e) => updateCurrentPincodeWithAutoCalc({ km: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">40 Ton Hydraulic (₹)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="0 or NA"
                                                value={currentPincode.forty_ton_hydraulic}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, forty_ton_hydraulic: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">30 Ton Hydraulic (₹)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="0 or NA"
                                                value={currentPincode.thirty_ton_hydraulic}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, thirty_ton_hydraulic: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Final Price (₹)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Auto-calculated"
                                                value={currentPincode.final_price}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, final_price: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>


                            </Form>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editMode ? 'Update' : 'Add'} Pincode
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Pincodes;
