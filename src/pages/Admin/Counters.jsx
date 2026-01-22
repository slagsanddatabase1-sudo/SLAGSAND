import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { Save, Hash, ArrowUpRight, Edit, RotateCcw } from 'lucide-react';

const Counters = () => {
    const [counters, setCounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchCounters();
    }, []);

    const fetchCounters = async () => {
        try {
            const { data, error } = await supabase.from('counters').select('*');
            if (error) throw error;
            setCounters(data);
        } catch (error) {
            console.error('Error fetching counters:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (counter) => {
        setEditingKey(counter.key);
        setEditValue(counter.value);
    };

    const handleSave = async (key) => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('counters')
                .update({ value: parseInt(editValue) })
                .eq('key', key);

            if (error) throw error;

            setCounters(counters.map(c => c.key === key ? { ...c, value: parseInt(editValue) } : c));
            setEditingKey(null);
        } catch (error) {
            console.error('Error updating counter:', error);
            alert('Failed to update: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const formatKey = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Manage Achievements</h2>
                <Button variant="outline-primary" size="sm" onClick={fetchCounters} disabled={loading}>
                    Refresh Data
                </Button>
            </div>

            {loading ? (
                <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 text-secondary small text-uppercase">Achievement Stat</th>
                                <th className="px-4 py-3 text-secondary small text-uppercase" style={{ width: '250px' }}>Value</th>
                                <th className="px-4 py-3 text-secondary small text-uppercase text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counters.map((c) => (
                                <tr key={c.key}>
                                    <td className="px-4 py-3">
                                        <div className="fw-bold text-dark">{formatKey(c.key)}</div>
                                        <small className="text-muted">Key: {c.key}</small>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {editingKey === c.key ? (
                                            <Form.Control
                                                type="number"
                                                size="sm"
                                                className="fw-bold border-primary"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="fs-5 fw-bold text-primary">{c.value.toLocaleString()}+</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        {editingKey === c.key ? (
                                            <div className="d-flex gap-2 justify-content-end">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    className="d-flex align-items-center gap-1 px-3"
                                                    onClick={() => handleSave(c.key)}
                                                    disabled={updating}
                                                >
                                                    {updating ? <Spinner animation="border" size="sm" /> : <Save size={14} />} Save
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="d-flex align-items-center gap-1"
                                                    onClick={() => setEditingKey(null)}
                                                    disabled={updating}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="d-flex justify-content-end">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="d-flex align-items-center gap-2 px-3"
                                                    onClick={() => startEditing(c)}
                                                >
                                                    <Edit size={14} /> Edit
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Container>
    );
};

export default Counters;
