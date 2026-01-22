
import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { Plus, Trash2, Mail, Shield, Edit, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', role: 'executive' });
    const [inviting, setInviting] = useState(false);
    const [message, setMessage] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        checkAdminAccess();
        fetchUsers();
    }, []);

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('user_roles').select('role').eq('email', user.email).single();
            if (data && data.role === 'admin') {
                setCurrentUserRole('admin');
            } else {
                setCurrentUserRole(data?.role || 'staff');
            }
        }
    };

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
    const handleEdit = (user) => {
        // Placeholder if we want edit
    };

    const resetModal = () => {
        setShowModal(false);
        setFormData({ email: '', password: '', role: 'executive' });
        setShowPassword(false);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setInviting(true);
        setMessage(null);
        try {
            // 1. Create User in Supabase Auth (Secondary Client)
            const tempSupabase = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            // 2. Insert into user_roles table
            // We use the main client (Admin) to insert into the table
            const { error: dbError } = await supabase.from('user_roles').insert([
                {
                    email: formData.email,
                    role: formData.role,
                    status: 'active' // Auto-activate
                }
            ]);

            if (dbError) {
                // If duplicate email in user_roles, maybe just update it?
                // For now, throw error
                throw dbError;
            }

            setMessage({
                type: 'success',
                text: `User ${formData.email} created successfully with role ${formData.role.toUpperCase()}.`
            });

            resetModal();
            fetchUsers(); // Refresh the list

        } catch (error) {
            console.error('Error creating user:', error);
            setMessage({ type: 'danger', text: `Failed to create user: ${error.message}` });
        } finally {
            setInviting(false);
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (currentUserRole !== 'admin') return <Container className="p-5 text-center"><h3>Access Denied</h3><p>Please log in to manage users.</p></Container>;

    return (
        <Container fluid>
            {message && <Alert variant={message.type} className="mb-4" onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}

            {loading ? <Spinner animation="border" /> : (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">User Access Management</h4>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} className="me-2" /> Add New User
                        </Button>
                    </div>

                    <div className="bg-white rounded shadow-sm border overflow-hidden">
                        <Table responsive hover className="mb-0 align-middle text-nowrap">
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
                                                <Badge bg={
                                                    user.role === 'admin' ? 'danger' :
                                                        user.role === 'executive' ? 'primary' : 'info'
                                                } className="text-uppercase px-3 py-2">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg="success" className="bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                                    Active
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
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
                </>
            )}

            <Modal show={showModal} onHide={resetModal}>
                <Modal.Header closeButton><Modal.Title>Create New User</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateUser}>


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
                                <option value="admin">Admin (Full Access)</option>
                                <option value="executive">Executive (Operations Manager)</option>
                                <option value="staff">Staff (Limited Access)</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Set a strong password"
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
                            {inviting ? 'Creating User...' : 'Create User'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default UserManagement;
