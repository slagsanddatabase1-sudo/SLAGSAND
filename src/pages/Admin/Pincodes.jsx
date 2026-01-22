import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Modal, Form, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { MapPin, Plus, Edit2, Trash2, Upload, Download, Search, ToggleLeft, ToggleRight, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

const Pincodes = () => {
    const [pincodes, setPincodes] = useState([]);
    const [filteredPincodes, setFilteredPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const [currentPincode, setCurrentPincode] = useState({
        pincode: '',
        city: '',
        district: '',
        division: '',
        deliverystatus: 'Delivery',
        slag_basicrate: '',
        transportation_rate: '',
        unloading_charges: '',
        final_price: '',
        is_active: true
    });

    useEffect(() => {
        fetchPincodes();
    }, []);

    useEffect(() => {
        // Filter pincodes based on search term
        let result = [];
        if (searchTerm) {
            result = pincodes.filter(p =>
                p.pincode.toString().includes(searchTerm) ||
                p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.district?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } else {
            result = pincodes;
        }
        setFilteredPincodes(result);
        setCurrentPage(1); // Reset to first page on search
    }, [searchTerm, pincodes]);

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


    const fetchPincodes = async () => {
        try {
            setLoading(true);
            // Fetch up to 5000 records to handle large datasets
            // For production with >10000 records, server-side pagination would be better
            // but this works for the current scale of 2000+
            const { data, error } = await supabase
                .from('pincodes')
                .select('*')
                .order('pincode', { ascending: true })
                .range(0, 4999);

            if (error) throw error;
            setPincodes(data || []);
            setFilteredPincodes(data || []);
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
                // Ensure all fields have values (not null)
                city: pincode.city || '',
                district: pincode.district || '',
                division: pincode.division || '',
                deliverystatus: pincode.deliverystatus || 'Delivery',
                slag_basicrate: pincode.slag_basicrate || '',
                transportation_rate: pincode.transportation_rate || '',
                unloading_charges: pincode.unloading_charges || '',
                final_price: pincode.final_price || ''
            });
        } else {
            setEditMode(false);
            setCurrentPincode({
                pincode: '',
                city: '',
                district: '',
                division: '',
                deliverystatus: 'Delivery',
                slag_basicrate: '',
                transportation_rate: '',
                unloading_charges: '',
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
                deliverystatus: currentPincode.deliverystatus || 'Delivery',
                slag_basicrate: parseFloat(currentPincode.slag_basicrate) || 0,
                transportation_rate: parseFloat(currentPincode.transportation_rate) || 0,
                unloading_charges: parseFloat(currentPincode.unloading_charges) || 0,
                final_price: parseFloat(currentPincode.final_price) || 0,
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
                        .map(row => ({
                            pincode: row.pincode.toString().trim(),
                            city: row.city?.trim() || null,
                            district: row.district?.trim() || null,
                            division: row.division?.trim() || null,
                            deliverystatus: row.deliverystatus?.trim() || row.deliverystatus?.trim() || 'Delivery',
                            slag_basicrate: parseFloat(row.slag_basicrate || 0),
                            transportation_rate: parseFloat(row.transportation_rate || 0),
                            unloading_charges: parseFloat(row.unloading_charges || 0),
                            final_price: parseFloat(row.final_price || 0)
                            // is_active will use database default (true)
                        }));

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
            deliverystatus: p.deliverystatus || 'Delivery',
            district: p.district || '',
            division: p.division || '',
            slag_basicrate: p.slag_basicrate || 0,
            transportation_rate: p.transportation_rate || 0,
            unloading_charges: p.unloading_charges || 0,
            final_price: p.final_price || 0,
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Pincodes & Pricing</h2>
                    <div className="d-flex align-items-center gap-2">
                        <p className="text-muted small mb-0">Manage delivery locations and pricing</p>
                        <Badge bg="secondary" pill className="small">Total: {pincodes.length}</Badge>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-danger" size="sm" onClick={handleDeleteAll}>
                        <Trash2 size={16} className="me-1" /> Delete All
                    </Button>
                    <Button variant="outline-success" size="sm" onClick={handleCSVExport}>
                        <Download size={16} className="me-1" /> Export CSV
                    </Button>
                    <Button variant="outline-primary" size="sm" as="label" style={{ cursor: 'pointer' }}>
                        <Upload size={16} className="me-1" /> Import CSV
                        <input type="file" accept=".csv" onChange={handleCSVImport} style={{ display: 'none' }} />
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
                        <Plus size={16} className="me-1" /> Add Pincode
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-3">
                <div className="position-relative" style={{ maxWidth: '400px' }}>
                    <Search size={18} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <Form.Control
                        type="text"
                        placeholder="Search by pincode, city, or district..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ps-5"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <div className="bg-white rounded shadow-sm overflow-hidden border">
                    <div className="table-responsive">
                        <Table hover responsive className="align-middle shadow-sm rounded">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="border-0 font-weight-bold">City</th>
                                    <th className="border-0 font-weight-bold">Pincode</th>
                                    <th className="border-0 font-weight-bold">Delivery Status</th>
                                    <th className="border-0 font-weight-bold">District</th>
                                    <th className="border-0 font-weight-bold">Division</th>
                                    <th className="border-0 font-weight-bold text-end">Basic Rate</th>
                                    <th className="border-0 font-weight-bold text-end">Transport</th>
                                    <th className="border-0 font-weight-bold text-end">Unloading</th>
                                    <th className="border-0 font-weight-bold text-end">Final Price</th>
                                    <th className="border-0 font-weight-bold text-center">Active</th>
                                    <th className="border-0 font-weight-bold text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPincodes.length > 0 ? (
                                    currentPincodes.map((p) => (
                                        <tr key={p.id}>
                                            <td className="fw-medium text-dark">{p.city || '-'}</td>
                                            <td>
                                                <Badge bg="light" text="dark" className="border">
                                                    {p.pincode}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg={p.deliverystatus === 'Delivery' ? 'success' : 'secondary'} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                                                    {p.deliverystatus || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="text-muted small">{p.district || '-'}</td>
                                            <td className="text-muted small">{p.division || '-'}</td>
                                            <td className="text-end text-muted">₹{(p.slag_basicrate || 0).toLocaleString()}</td>
                                            <td className="text-end text-muted">₹{(p.transportation_rate || 0).toLocaleString()}</td>
                                            <td className="text-end text-muted">₹{(p.unloading_charges || 0).toLocaleString()}</td>
                                            <td className="text-end fw-bold text-success">₹{(p.final_price || 0).toLocaleString()}</td>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="switch"
                                                    id={`switch-${p.id}`}
                                                    checked={p.is_active}
                                                    onChange={() => handleToggleActive(p.id, p.is_active)}
                                                />
                                            </td>
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
                <Modal.Body className="p-4">
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
                                                value={currentPincode.deliverystatus}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, deliverystatus: e.target.value })}
                                            >
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
                                                type="number"
                                                placeholder="0"
                                                value={currentPincode.slag_basicrate}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, slag_basicrate: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Transportation Rate (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
                                                value={currentPincode.transportation_rate}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, transportation_rate: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Unloading Charges (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
                                                value={currentPincode.unloading_charges}
                                                onChange={(e) => setCurrentPincode({ ...currentPincode, unloading_charges: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Final Price (₹)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="0"
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
