import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Edit } from 'lucide-react';

const FAQs = () => {
    const { userRole } = useOutletContext();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ question: '', answer: '', priority: 0 });
    const [editingId, setEditingId] = useState(null);

    if (userRole === 'staff') {
        return (
            <Container className="p-5 text-center">
                <div className="bg-white p-5 rounded-4 shadow-sm border">
                    <h3 className="text-danger fw-bold">Access Denied</h3>
                    <p className="text-muted">You do not have permission to view this page. Contact your administrator.</p>
                </div>
            </Container>
        );
    }

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const { data, error } = await supabase.from('faqs').select('*').order('priority', { ascending: true });
            if (error) throw error;
            setFaqs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this FAQ?')) return;
        try {
            const { error } = await supabase.from('faqs').delete().eq('id', id);
            if (error) throw error;
            setFaqs(faqs.filter(f => f.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete FAQ');
        }
    };

    const handleEdit = (faq) => {
        setFormData({
            question: faq.question,
            answer: faq.answer,
            priority: faq.priority || 0
        });
        setEditingId(faq.id);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({ question: '', answer: '', priority: faqs.length + 1 });
        setEditingId(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { error } = await supabase.from('faqs').update(formData).eq('id', editingId);
                if (error) throw error;
                setFaqs(faqs.map(f => f.id === editingId ? { ...f, ...formData } : f));
            } else {
                const { data, error } = await supabase.from('faqs').insert([formData]).select();
                if (error) throw error;
                setFaqs([...faqs, data[0]].sort((a, b) => (a.priority || 0) - (b.priority || 0)));
            }
            setShowModal(false);
        } catch (error) {
            console.error('FAQ Operation Error:', error);
            const errorMessage = error.message.includes('permission denied')
                ? 'Permission denied. Ensure your role is set to "admin" in the user_roles table.'
                : `Operation failed: ${error.message}`;
            alert(errorMessage);
        }
    };

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h2 className="fw-bold m-0">Manage FAQs</h2>
                <Button variant="success" size="sm" onClick={handleAdd} className="w-auto">
                    <Plus size={16} className="me-2" /> Add New FAQ
                </Button>
            </div>

            {loading ? <div className="text-center p-5"><Spinner animation="border" /></div> : (
                <div className="bg-white rounded-3 shadow-sm border mb-4">
                    <div className="table-responsive-wrapper">
                        <Table hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: '80px' }}>Priority</th>
                                <th>Question</th>
                                <th>Answer</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faqs.map((f) => (
                                <tr key={f.id}>
                                    <td className="text-center fw-bold text-primary">{f.priority}</td>
                                    <td className="fw-bold">{f.question}</td>
                                    <td className="text-muted" style={{ whiteSpace: 'pre-line', maxWidth: '400px', fontSize: '0.9rem' }}>
                                        {f.answer.substring(0, 100)}{f.answer.length > 100 ? '...' : ''}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button variant="link" className="p-0 text-primary" onClick={() => handleEdit(f)}>
                                                <Edit size={18} />
                                            </Button>
                                            <Button variant="link" className="p-0 text-danger" onClick={() => handleDelete(f.id)}>
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {faqs.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-5 text-muted">
                                        No FAQs found. Click "Add New FAQ" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-3 p-md-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Question</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                placeholder="e.g. What is Slag Sand?"
                            />
                        </Form.Group>


                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Priority (Lower numbers show first)</Form.Label>
                            <Form.Control
                                type="number"
                                required
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Answer</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                required
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="Provide a detailed answer..."
                            />
                        </Form.Group>

                        <div className="d-flex gap-2 mt-4">
                            <Button variant="secondary" className="flex-grow-1" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button type="submit" variant="success" className="flex-grow-1">
                                {editingId ? 'Update FAQ' : 'Create FAQ'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default FAQs;
