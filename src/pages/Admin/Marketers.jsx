import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Modal, Row, Col, Card } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { Check, X, Eye, User, Mail, Phone, MapPin, Briefcase, Calendar, Trash2 } from 'lucide-react';

const Marketers = () => {
    const [marketers, setMarketers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMarketer, setSelectedMarketer] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchMarketers();
    }, []);

    const fetchMarketers = async () => {
        try {
            const { data, error } = await supabase.from('marketers').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setMarketers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this marketer?')) return;
        try {
            const { error } = await supabase.from('marketers').delete().eq('id', id);
            if (error) throw error;
            setMarketers(marketers.filter(m => m.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete marketer');
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('WARNING: Are you sure you want to delete ALL marketers? This action cannot be undone.')) return;
        try {
            const { error } = await supabase.from('marketers').delete().neq('id', 0); // Delete all rows checking against a non-existent id to match all
            if (error) throw error;
            setMarketers([]);
            alert('All marketers have been deleted.');
        } catch (error) {
            console.error(error);
            alert('Failed to delete all marketers');
        }
    };

    const handleStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this marketer?`)) return;
        try {
            const { error } = await supabase.from('marketers').update({ status }).eq('id', id);
            if (error) throw error;
            setMarketers(marketers.map(m => m.id === id ? { ...m, status } : m));
            if (showModal) setShowModal(false);
        } catch (error) {
            console.error(error);
            alert('Update failed');
        }
    };

    const handleViewDetails = (m) => {
        setSelectedMarketer(m);
        setShowModal(true);
    };

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h2 className="fw-bold m-0">Manage Marketers</h2>
                <div className="d-flex flex-wrap gap-2">
                    {marketers.length > 0 && (
                        <Button variant="outline-danger" size="sm" onClick={handleDeleteAll}>
                            <Trash2 size={16} className="me-1" /> Delete All
                        </Button>
                    )}
                    <Button variant="outline-primary" size="sm" onClick={fetchMarketers}>Refresh List</Button>
                </div>
            </div>

            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                <div className="bg-white rounded-3 shadow-sm border mb-4">
                    <div className="table-responsive-wrapper">
                        <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th style={{ width: '150px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marketers.map((m) => (
                                <tr key={m.id}>
                                    <td className="fw-semibold text-dark">{m.name}</td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>{m.contact}</div>
                                        <small className="text-muted">{m.email}</small>
                                    </td>
                                    <td><small className="text-muted">{m.location}</small></td>
                                    <td>
                                        <Badge bg={m.status === 'approved' ? 'success' : m.status === 'rejected' ? 'danger' : 'warning'} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                                            {m.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button variant="link" className="p-0 text-primary" onClick={() => handleViewDetails(m)}>
                                                <Eye size={18} />
                                            </Button>
                                            <Button variant="link" className="p-0 text-danger" onClick={() => handleDelete(m.id)}>
                                                <Trash2 size={18} />
                                            </Button>
                                            {m.status === 'pending' && (
                                                <>
                                                    <Button variant="link" className="p-0 text-success" onClick={() => handleStatus(m.id, 'approved')}>
                                                        <Check size={18} />
                                                    </Button>
                                                    <Button variant="link" className="p-0 text-danger" onClick={() => handleStatus(m.id, 'rejected')}>
                                                        <X size={18} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {marketers.length === 0 && (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No marketers found.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
            )}

            {/* Marketer Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Marketer Application</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-3 p-md-4">
                    {selectedMarketer && (
                        <Row className="gy-4">
                            <Col md={6}>
                                <div className="mb-4">
                                    <label className="text-uppercase text-muted fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>Applicant Info</label>
                                    <h4 className="fw-bold mb-1">{selectedMarketer.name}</h4>
                                    <div className="d-flex align-items-center text-muted mb-1 small">
                                        <Phone size={14} className="me-2" /> {selectedMarketer.contact}
                                    </div>
                                    <div className="d-flex align-items-center text-muted mb-1 small">
                                        <Mail size={14} className="me-2" /> {selectedMarketer.email}
                                    </div>
                                    <div className="d-flex align-items-center text-muted small">
                                        <MapPin size={14} className="me-2" /> {selectedMarketer.location}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-uppercase text-muted fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>Application Status</label>
                                    <div className="d-flex align-items-center mb-1 small">
                                        <Calendar size={14} className="me-2 text-muted" />
                                        <span className="text-muted me-2">Applied on:</span> {new Date(selectedMarketer.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="d-flex align-items-center small">
                                        <div className="me-2 text-muted">Status:</div>
                                        <Badge bg={selectedMarketer.status === 'approved' ? 'success' : selectedMarketer.status === 'rejected' ? 'danger' : 'warning'}>
                                            {selectedMarketer.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </Col>

                            <Col md={6}>
                                <div className="bg-light rounded-3 p-3 p-md-4 h-100">
                                    <label className="text-uppercase text-muted fw-bold mb-3 d-block" style={{ fontSize: '0.7rem' }}>
                                        <Briefcase size={14} className="me-1 mb-1" /> Experience & Background
                                    </label>
                                    <div className="bg-white p-3 border rounded text-secondary small" style={{ whiteSpace: 'pre-line', minHeight: '150px' }}>
                                        {selectedMarketer.experience || "No experience details provided."}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light rounded-bottom-4">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    {selectedMarketer?.status === 'pending' && (
                        <>
                            <Button variant="danger" onClick={() => handleStatus(selectedMarketer.id, 'rejected')}>Reject Application</Button>
                            <Button variant="success" onClick={() => handleStatus(selectedMarketer.id, 'approved')}>Approve Marketer</Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Marketers;
