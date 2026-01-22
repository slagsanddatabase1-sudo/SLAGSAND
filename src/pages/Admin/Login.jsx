import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            navigate('/admin');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light position-relative">
            {/* Background Accent */}
            <div className="position-absolute w-100 h-50 top-0 bg-dark" style={{ zIndex: 0 }}></div>

            <Container className="position-relative" style={{ zIndex: 1, maxWidth: '450px' }}>
                <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
                    <Card.Body className="p-5">
                        <div className="text-center mb-5">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <Lock size={32} />
                            </div>
                            <h3 className="fw-bold text-dark">Welcome Back</h3>
                            <p className="text-muted small">Sign in to manage Slagsand Admin</p>
                        </div>

                        {error && (
                            <Alert variant="danger" className="d-flex align-items-center rounded-3 mb-4">
                                <small>{error}</small>
                            </Alert>
                        )}

                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-uppercase small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Email Address</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-muted"><Mail size={18} /></span>
                                    <Form.Control
                                        type="email"
                                        className="border-start-0 ps-0 shadow-none py-2"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ fontSize: '0.95rem' }}
                                    />
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-5">
                                <Form.Label className="text-uppercase small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Password</Form.Label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-muted"><Lock size={18} /></span>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        className="border-start-0 border-end-0 ps-0 shadow-none py-2"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ fontSize: '0.95rem' }}
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

                            <Button variant="dark" type="submit" className="w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center shadow-sm" disabled={loading}>
                                {loading ? <Spinner size="sm" animation="border" className="me-2" /> : 'Sign In'}
                                {!loading && <ArrowRight size={18} className="ms-2" />}
                            </Button>
                        </Form>
                    </Card.Body>
                    <Card.Footer className="bg-light py-3 text-center border-0">
                        <small className="text-muted">Protected by Supabase Auth</small>
                    </Card.Footer>
                </Card>
            </Container>
        </div>
    );
};

export default AdminLogin;
