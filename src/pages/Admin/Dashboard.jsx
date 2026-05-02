import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Table, Badge } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { Users, ShoppingCart, MessageSquare, MapPin, ArrowRight, Eye, PlusCircle } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
    const { userRole } = useOutletContext();
    const [stats, setStats] = useState({
        orders: 0,
        inquiries: 0,
        marketers: 0,
        pincodes: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [publicCounters, setPublicCounters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
            const { count: inquiriesCount } = await supabase.from('inquiries').select('*', { count: 'exact', head: true });
            const { count: marketersCount } = await supabase.from('marketers').select('*', { count: 'exact', head: true });
            const { count: pincodesCount } = await supabase.from('pincodes').select('*', { count: 'exact', head: true });

            setStats({
                orders: ordersCount || 0,
                inquiries: inquiriesCount || 0,
                marketers: marketersCount || 0,
                pincodes: pincodesCount || 0
            });

            const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
            setRecentOrders(ordersData || []);

            const { data: inquiriesData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5);
            setRecentInquiries(inquiriesData || []);

            const { data: countersData } = await supabase.from('counters').select('*');
            setPublicCounters(countersData || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCounterUpdate = async (key, newValue) => {
        setUpdating(true);
        try {
            const { error } = await supabase.from('counters').update({ value: parseInt(newValue) }).eq('key', key);
            if (error) throw error;
            setPublicCounters(publicCounters.map(c => c.key === key ? { ...c, value: parseInt(newValue) } : c));
        } catch (error) {
            console.error('Error updating counter:', error);
            alert('Failed to update counter');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h2 className="fw-bold m-0 fs-3">Dashboard Overview</h2>
                <Button variant="primary" size="sm" onClick={fetchData} className="w-auto">Refresh Data</Button>
            </div>

            {/* Stat Cards */}
            <Row className="mb-4 gy-4 gx-3">
                <Col xs={12} sm={6} lg={3}>
                    <Card className="text-white bg-primary shadow-sm border-0 h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <div className="d-flex justify-content-between align-items-center">
                                <div><h6 className="opacity-75 mb-1">Total Orders</h6><h2 className="mb-0 fw-bold">{stats.orders}</h2></div>
                                <div className="bg-white bg-opacity-25 rounded p-3"><ShoppingCart size={24} /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="text-white bg-success shadow-sm border-0 h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <div className="d-flex justify-content-between align-items-center">
                                <div><h6 className="opacity-75 mb-1">Inquiries</h6><h2 className="mb-0 fw-bold">{stats.inquiries}</h2></div>
                                <div className="bg-white bg-opacity-25 rounded p-3"><MessageSquare size={24} /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="text-white bg-warning shadow-sm border-0 h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <div className="d-flex justify-content-between align-items-center">
                                <div><h6 className="opacity-75 mb-1">Marketers</h6><h2 className="mb-0 fw-bold">{stats.marketers}</h2></div>
                                <div className="bg-white bg-opacity-25 rounded p-3"><Users size={24} /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                    <Card className="text-white bg-info shadow-sm border-0 h-100">
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <div className="d-flex justify-content-between align-items-center">
                                <div><h6 className="opacity-75 mb-1">Active Pincodes</h6><h2 className="mb-0 fw-bold">{stats.pincodes}</h2></div>
                                <div className="bg-white bg-opacity-25 rounded p-3"><MapPin size={24} /></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4 gy-4">
                {/* Recent Orders */}
                <Col lg={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                            <h5 className="mb-0 fw-bold text-dark">Recent Orders</h5>
                            <Button as={Link} to="/admin/orders" variant="link" className="p-0 text-decoration-none small fw-bold">View All <ArrowRight size={14} /></Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 small">
                                <thead className="bg-light border-0">
                                    <tr><th>Customer</th><th>Item</th><th>Amount</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td className="fw-semibold">{order.user_details.name}</td>
                                            <td>{order.order_details.quantity} {order.order_details.measure}</td>
                                            <td className="fw-bold">₹{order.amount}</td>
                                            <td><Badge bg={order.status === 'paid' ? 'success' : 'warning'} className="text-uppercase" style={{ fontSize: '0.6rem' }}>{order.status}</Badge></td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">No orders yet.</td></tr>}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Quick Actions & Counters */}
                <Col lg={4}>
                    {(userRole === 'admin' || userRole === 'executive') && (
                        <Card className="shadow-sm border-0 mb-4 text-black bg-light">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Quick Actions</h5>
                                <div className="d-grid gap-2">
                                    <Button as={Link} to="/admin/testimonials" variant="outline-dark" className="text-start d-flex justify-content-between align-items-center border-opacity-25 mb-2 py-2">
                                        <span>Manage Testimonials</span>
                                        <PlusCircle size={18} />
                                    </Button>
                                    <Button as={Link} to="/admin/faqs" variant="outline-dark" className="text-start d-flex justify-content-between align-items-center border-opacity-25 py-2">
                                        <span>Manage FAQs</span>
                                        <PlusCircle size={18} />
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    <Card className="shadow-sm border-0 overflow-hidden">
                        <Card.Header className="bg-white py-3 border-bottom"><h5 className="mb-0 fw-bold">Public Stats</h5></Card.Header>
                        <Card.Body className="p-3">
                            {publicCounters.map((counter) => (
                                <div key={counter.key} className="mb-3 border-bottom pb-2">
                                    <Form.Label className="text-capitalize small text-muted mb-1">{counter.key.replace(/_/g, ' ')}</Form.Label>
                                    <div className="d-flex gap-2 align-items-center">
                                        <Form.Control
                                            size="sm"
                                            type="number"
                                            defaultValue={counter.value}
                                            readOnly={userRole === 'staff'}
                                            onBlur={(e) => {
                                                if (userRole !== 'staff') {
                                                    handleCounterUpdate(counter.key, e.target.value);
                                                }
                                            }}
                                            className={`border-0 bg-light fw-bold ${userRole === 'staff' ? 'cursor-not-allowed' : ''}`}
                                        />
                                        <div className="text-primary small fw-bold">LIVE</div>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Recent Inquiries */}
                <Col lg={12}>
                    <Card className="shadow-sm border-0 overflow-hidden">
                        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                            <h5 className="mb-0 fw-bold text-dark">Recent Inquiries & Leads</h5>
                            <Button as={Link} to="/admin/inquiries" variant="link" className="p-0 text-decoration-none small fw-bold">View All <ArrowRight size={14} /></Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 small">
                                <thead className="bg-light border-0">
                                    <tr><th>Date</th><th>Type</th><th>Name</th><th>Contact</th><th>Summary</th></tr>
                                </thead>
                                <tbody>
                                    {recentInquiries.map(inq => (
                                        <tr key={inq.id}>
                                            <td>{new Date(inq.created_at).toLocaleDateString()}</td>
                                            <td><Badge bg={inq.type === 'sample' ? 'info' : 'secondary'} className="text-uppercase" style={{ fontSize: '0.6rem' }}>{inq.type}</Badge></td>
                                            <td className="fw-semibold">{inq.name}</td>
                                            <td>{inq.contact}</td>
                                            <td className="text-truncate" style={{ maxWidth: '300px' }}>
                                                {inq.type === 'sample' ? `Request for ${inq.details?.quantity}` : inq.details?.message}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentInquiries.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No inquiries yet.</td></tr>}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
