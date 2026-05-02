
import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { Plus, Trash2, Mail, Shield, Edit, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const UserManagement = () => {
    const { userRole } = useOutletContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', role: 'executive' });
    const [inviting, setInviting] = useState(false);
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ type: 'danger', text: 'Failed to fetch user list.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (email) => {
        if (!window.confirm(`Are you sure you want to remove access for ${email}? This will NOT delete their login, only their role entry.`)) return;

        try {
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('email', email);

            if (error) throw error;
            fetchUsers();
            setMessage({ type: 'success', text: `Access removed for ${email}` });
        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
        }
    };

    // Simplified: We only support creating new role entries or deleting them for now
    // Editing implies deleting and re-adding or we can add update logic if requested
    // For now, let's keep it simple: Add New User logic
    const [editingUser, setEditingUser] = useState(null); // null = creating, user object = editing

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({ 
            email: user.email, 
            password: '', // Keep empty unless changing
            role: user.role 
        });
        setShowModal(true);
    };

    const resetModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ email: '', password: '', role: 'executive' });
        setShowPassword(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setInviting(true);
        setMessage(null);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://slagsand.onrender.com';
            const endpoint = editingUser ? '/api/admin/update-user' : '/api/admin/create-user';
            
            const payload = {
                email: formData.email.trim().toLowerCase(),
                role: formData.role
            };

            if (editingUser) {
                payload.id = editingUser.id;
                if (formData.password) payload.password = formData.password;
            } else {
                payload.password = formData.password;
            }

            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to process request');

            setMessage({
                type: 'success',
                text: editingUser ? `User ${formData.email} updated successfully.` : `User ${formData.email} created successfully.`
            });

            resetModal();
            fetchUsers();
        } catch (error) {
            console.error('Error processing user:', error);
            setMessage({ type: 'danger', text: `Error: ${error.message}` });
        } finally {
            setInviting(false);
        }
    };

    const handleUpdateRole = async (email, newRole) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ role: newRole })
                .ilike('email', email.trim());

            if (error) throw error;

            setMessage({ type: 'success', text: `Role updated for ${email} to ${newRole.toUpperCase()}` });
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'danger', text: error.message });
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (userRole !== 'admin') return <Container className="p-5 text-center"><h3>Access Denied</h3><p>Please log in to manage users.</p></Container>;

    return (
        <Container fluid>
            {message && <Alert variant={message.type} className="mb-4" onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}

            {loading ? <Spinner animation="border" /> : (
                <>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <h4 className="fw-bold mb-0 fs-3">User Access Management</h4>
                        <Button variant="primary" onClick={() => setShowModal(true)} className="w-auto">
                            <Plus size={18} className="me-2" /> Add New User
                        </Button>
                    </div>

                    <div className="bg-white rounded-3 shadow-sm border mb-4">
                        <div className="table-responsive-wrapper">
                            <Table hover className="mb-0 align-middle text-nowrap">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 py-3 ps-4">Email Address</th>
                                        <th className="border-0 py-3">Role</th>
                                        <th className="border-0 py-3">Status</th>
                                        <th className="border-0 py-3 text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-light rounded-circle p-2 me-3 text-primary">
                                                            <Mail size={16} />
                                                        </div>
                                                        <span className="fw-medium">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Form.Select
                                                        size="sm"
                                                        value={user.role}
                                                        onChange={(e) => handleUpdateRole(user.email, e.target.value)}
                                                        className="w-auto border-0 bg-light fw-bold text-uppercase px-3 py-2 cursor-pointer"
                                                        style={{ fontSize: '0.75rem' }}
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="executive">Executive</option>
                                                        <option value="staff">Staff</option>
                                                    </Form.Select>
                                                </td>
                                                <td>
                                                    <Badge bg="success" className="bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                                        Active
                                                    </Badge>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Button
                                                        variant="link"
                                                        className="text-primary p-0 me-3"
                                                        onClick={() => handleEdit(user)}
                                                        title="Edit User"
                                                    >
                                                        <Edit size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0"
                                                        onClick={() => handleDelete(user.email)}
                                                        title="Revoke Access"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </>
            )}

            <Modal show={showModal} onHide={resetModal}>
                <Modal.Header closeButton><Modal.Title>{editingUser ? 'Edit User' : 'Create New User'}</Modal.Title></Modal.Header>
                <Modal.Body className="p-3 p-md-4">
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="colleague@company.com"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="admin">Admin (Super Admin - Full Access)</option>
                                <option value="executive">Executive (Business Manager)</option>
                                <option value="staff">Staff (Operational View-only)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password {editingUser && <small className="text-muted">(Leave blank to keep current)</small>}</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingUser ? "Enter new password" : "Set a strong password"}
                                    minLength={6}
                                    className="border-end-0"
                                />
                                <span
                                    className="input-group-text bg-white border-start-0 text-muted cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </Form.Group>

                        <Button type="submit" variant="primary" className="w-100" disabled={inviting}>
                            {inviting ? 'Processing...' : (editingUser ? 'Update User' : 'Create User')}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default UserManagement;
