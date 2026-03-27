import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Button, Modal, Row, Col } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { Eye, Mail, Phone, Calendar, Tag, Trash2 } from 'lucide-react';

const Inquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setInquiries(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            const { error } = await supabase.from('inquiries').delete().eq('id', id);
            if (error) throw error;
            setInquiries(inquiries.filter(i => i.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete inquiry');
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('WARNING: Are you sure you want to delete ALL inquiries? This action cannot be undone.')) return;
        try {
            const { error } = await supabase.from('inquiries').delete().neq('id', 0); // Delete all rows where id is not 0 (effectively all)
            if (error) throw error;
            setInquiries([]);
            alert('All inquiries have been deleted.');
        } catch (error) {
            console.error(error);
            alert('Failed to delete all inquiries');
        }
    };

    const handleViewDetails = (inq) => {
        setSelectedInquiry(inq);
        setShowModal(true);
    };

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h2 className="fw-bold m-0 fs-3">Inquiries & Leads</h2>
                <div className="d-flex gap-2">
                    {inquiries.length > 0 && (
                        <Button variant="outline-danger" size="sm" onClick={handleDeleteAll}>
                            <Trash2 size={16} className="me-1" /> Delete All
                        </Button>
                    )}
                    <Button variant="outline-primary" size="sm" onClick={fetchInquiries}>Refresh Data</Button>
                </div>
            </div>

            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                <div className="bg-white rounded-3 shadow-sm border mb-4">
                    <div className="table-responsive-wrapper">
                        <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Summary</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inq) => (
                                <tr key={inq.id}>
                                    <td><small className="text-muted">{new Date(inq.created_at).toLocaleDateString()}</small></td>
                                    <td>
                                        <Badge bg={inq.type === 'sample' ? 'info' : 'secondary'} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                                            {inq.type}
                                        </Badge>
                                    </td>
                                    <td className="fw-semibold">{inq.name}</td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{inq.contact}</div>
                                        <small className="text-muted">{inq.email}</small>
                                    </td>
                                    <td>
                                        <small className="text-muted text-truncate d-block" style={{ maxWidth: '300px' }}>
                                            {inq.type === 'sample'
                                                ? `Request for ${inq.details?.quantity || 'Sample'}`
                                                : inq.details?.message}
                                        </small>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button variant="link" className="p-0 text-primary" onClick={() => handleViewDetails(inq)}>
                                                <Eye size={18} />
                                            </Button>
                                            <Button variant="link" className="p-0 text-danger" onClick={() => handleDelete(inq.id)}>
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {inquiries.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No inquiries found.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
            )}

            {/* Inquiry Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">
                        {selectedInquiry?.type === 'sample' ? 'Sample Request Details' : 'Contact Message Details'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-3 p-md-4">
                    {selectedInquiry && (
                        <Row className="gy-4">
                            <Col md={6}>
                                <div className="mb-4">
                                    <label className="text-uppercase text-muted fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>Customer Info</label>
                                    <h5 className="fw-bold mb-1">{selectedInquiry.name}</h5>
                                    <div className="d-flex align-items-center text-muted mb-1 small">
                                        <Phone size={14} className="me-2" /> {selectedInquiry.contact}
                                    </div>
                                    <div className="d-flex align-items-center text-muted small">
                                        <Mail size={14} className="me-2" /> {selectedInquiry.email || 'N/A'}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-uppercase text-muted fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>Submission Info</label>
                                    <div className="d-flex align-items-center text-muted mb-1 small">
                                        <Calendar size={14} className="me-2" /> {new Date(selectedInquiry.created_at).toLocaleString()}
                                    </div>
                                    <div className="d-flex align-items-center text-muted small">
                                        <Tag size={14} className="me-2" /> Type: <Badge bg="light" text="dark" className="ms-1 border">{selectedInquiry.type}</Badge>
                                    </div>
                                </div>
                            </Col>

                            <Col md={6} className="bg-light rounded-3 p-3 p-md-4">
                                <label className="text-uppercase text-muted fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>
                                    {selectedInquiry.type === 'sample' ? 'Order Details' : 'Message Content'}
                                </label>

                                {selectedInquiry.type === 'sample' ? (
                                    <div className="small">
                                        <div className="mb-3">
                                            <span className="fw-bold d-block text-dark">Quantity:</span>
                                            <span className="text-primary fw-bold" style={{ fontSize: '1.1rem' }}>{selectedInquiry.details?.quantity}</span>
                                        </div>
                                        <div>
                                            <span className="fw-bold d-block text-dark mb-1">Delivery Address:</span>
                                            <p className="mb-0 text-secondary bg-white p-2 border rounded">
                                                {selectedInquiry.details?.address}<br />
                                                {selectedInquiry.details?.city}, {selectedInquiry.details?.state} - {selectedInquiry.details?.pincode}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-3 border rounded text-secondary" style={{ whiteSpace: 'pre-line', minHeight: '100px' }}>
                                        {selectedInquiry.details?.message}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => window.print()}>Print / Save PDF</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Inquiries;
