import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Spinner, Badge } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit, Star } from 'lucide-react';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ client_name: '', content: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTestimonials(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this testimonial?')) return;
        try {
            const { error } = await supabase.from('testimonials').delete().eq('id', id);
            if (error) throw error;
            setTestimonials(testimonials.filter(t => t.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete testimonial');
        }
    };

    const handleEdit = (t) => {
        setFormData({ client_name: t.client_name, content: t.content });
        setEditingId(t.id);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({ client_name: '', content: '' });
        setEditingId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase.from('testimonials').update(formData).eq('id', editingId);
                if (error) throw error;
                setTestimonials(testimonials.map(t => t.id === editingId ? { ...t, ...formData } : t));
            } else {
                const { data, error } = await supabase.from('testimonials').insert([formData]).select();
                if (error) throw error;
                setTestimonials([data[0], ...testimonials]);
            }
            setShowModal(false);
        } catch (error) {
            console.error(error);
            alert('Operation failed. Please check if database columns are standardized.');
        }
    };

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Manage Testimonials</h2>
                <Button variant="success" size="sm" onClick={handleAdd}>
                    <Plus size={16} className="me-2" /> Add New Testimonial
                </Button>
            </div>

            {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                <div className="bg-white rounded shadow-sm overflow-hidden border">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Client Name</th>
                                <th>Testimonial Content</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map((t) => (
                                <tr key={t.id}>
                                    <td className="fw-bold">{t.client_name}</td>
                                    <td className="text-muted" style={{ whiteSpace: 'pre-line', maxWidth: '500px', fontSize: '0.9rem' }}>
                                        "{t.content.substring(0, 120)}{t.content.length > 120 ? '...' : ''}"
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button variant="link" className="p-0 text-primary" onClick={() => handleEdit(t)}>
                                                <Edit size={18} />
                                            </Button>
                                            <Button variant="link" className="p-0 text-danger" onClick={() => handleDelete(t.id)}>
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {testimonials.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted">
                                        No testimonials found. Click "Add New Testimonial" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Client Name</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={formData.client_name}
                                onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                                placeholder="e.g. John Doe"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Testimonial Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                required
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="What did the client say?"
                            />
                        </Form.Group>

                        <div className="d-flex gap-2 mt-4">
                            <Button variant="secondary" className="flex-grow-1" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" variant="success" className="flex-grow-1">
                                {editingId ? 'Update Testimonial' : 'Create Testimonial'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Testimonials;

