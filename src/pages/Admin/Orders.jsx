import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Button, Modal, Row, Col, Card, Form } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { Eye, User, ShoppingBag, MapPin, CreditCard, Calendar, Trash2, Edit } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showPincodeModal, setShowPincodeModal] = useState(false);
    const [editingPincode, setEditingPincode] = useState(null);
    const [pincodeFormData, setPincodeFormData] = useState({ price_ton: '', price_brass: '', price_foot: '' });
    const [updatingPincode, setUpdatingPincode] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        try {
            const { error } = await supabase.from('orders').delete().eq('id', orderId);
            if (error) throw error;
            setOrders(orders.filter(order => order.id !== orderId));
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        }
    };

    const handleDeleteAllOrders = async () => {
        if (!window.confirm('WARNING: Are you sure you want to DELETE ALL ORDERS? This action is irreversible and will wipe the entire orders database.')) return;

        try {
            // Using a not-equal filter that should match everything, assuming positive IDs
            const { error } = await supabase.from('orders').delete().neq('id', -1);
            if (error) throw error;
            setOrders([]);
            alert('All orders have been successfully deleted.');
        } catch (error) {
            console.error('Error deleting all orders:', error);
            alert('Failed to delete all orders. Please try again.');
        }
    };

    const handleEditPincode = async (pincode) => {
        try {
            const { data, error } = await supabase.from('pincodes').select('*').eq('pincode', pincode).single();
            if (error) throw error;
            setEditingPincode(data);
            setPincodeFormData({
                price_ton: data.price_ton,
                price_brass: data.price_brass,
                price_foot: data.price_foot
            });
            setShowPincodeModal(true);
        } catch (error) {
            console.error('Error fetching pincode:', error);
            alert('Pincode details not found in database.');
        }
    };

    const handlePincodeSubmit = async (e) => {
        e.preventDefault();
        setUpdatingPincode(true);
        try {
            const { error } = await supabase.from('pincodes').update(pincodeFormData).eq('pincode', editingPincode.pincode);
            if (error) throw error;
            setShowPincodeModal(false);
            alert('Pincode pricing updated successfully!');
        } catch (error) {
            console.error('Error updating pincode:', error);
            alert('Failed to update pincode pricing.');
        } finally {
            setUpdatingPincode(false);
        }
    };

    return (
        <Container fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Manage Orders</h2>
                <div>
                    <Button variant="outline-danger" size="sm" className="me-2" onClick={handleDeleteAllOrders}>Delete All Orders</Button>
                    <Button variant="outline-primary" size="sm" onClick={fetchOrders}>Refresh Orders</Button>
                </div>
            </div>

            {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
                <div className="bg-white rounded shadow-sm overflow-hidden border">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td><span className="text-primary fw-bold">#{order.id}</span></td>
                                    <td><small className="text-muted">{new Date(order.created_at).toLocaleDateString()}</small></td>
                                    <td>
                                        <div className="fw-semibold">{order.user_details.name}</div>
                                        <small className="text-muted">{order.user_details.contact}</small>
                                    </td>
                                    <td>
                                        <div>{order.order_details.quantity} {order.order_details.measure}</div>
                                        <div className="d-flex align-items-center gap-1">
                                            <small className="text-muted">Pincode: {order.user_details.pincode}</small>
                                            <Button variant="link" className="p-0 text-primary" onClick={() => handleEditPincode(order.user_details.pincode)}>
                                                <Edit size={12} />
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="fw-bold">₹{order.amount.toLocaleString()}</td>
                                    <td>
                                        <div className="d-flex flex-column gap-1">
                                            <Badge bg={order.status === 'paid' ? 'success' : 'warning'} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                                                {order.status}
                                            </Badge>
                                            <Badge bg="light" text="dark" className="border text-uppercase" style={{ fontSize: '0.65rem' }}>
                                                {order.payment_method || 'Online'}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button variant="link" className="p-0 text-primary" onClick={() => handleViewDetails(order)}>
                                                <Eye size={18} />
                                            </Button>
                                            <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteOrder(order.id)}>
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No orders found.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Order Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Order Details #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedOrder && (
                        <Row className="gy-4">
                            <Col md={6}>
                                <Card className="border-0 bg-light h-100 p-3">
                                    <label className="text-uppercase text-muted fw-bold mb-3 d-block" style={{ fontSize: '0.7rem' }}>
                                        <User size={14} className="me-1 mb-1" /> Customer Information
                                    </label>
                                    <h5 className="fw-bold mb-2">{selectedOrder.user_details.name}</h5>
                                    <p className="text-muted mb-3 small">{selectedOrder.user_details.contact}</p>

                                    <div className="mt-auto">
                                        <label className="text-uppercase text-muted fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>
                                            <MapPin size={14} className="me-1 mb-1" /> Shipping Address
                                        </label>
                                        <p className="mb-0 small text-dark bg-white p-2 border rounded">
                                            {selectedOrder.user_details.address}<br />
                                            {selectedOrder.user_details.city}, {selectedOrder.user_details.state} - {selectedOrder.user_details.pincode}
                                        </p>
                                    </div>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="border-0 bg-light h-100 p-3">
                                    <label className="text-uppercase text-muted fw-bold mb-3 d-block" style={{ fontSize: '0.7rem' }}>
                                        <ShoppingBag size={14} className="me-1 mb-1" /> Order Configuration
                                    </label>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small text-muted">Quantity:</span>
                                        <span className="fw-bold">{selectedOrder.order_details.quantity} {selectedOrder.order_details.measure}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
                                        <span className="small text-muted">Unit Rate:</span>
                                        <span className="fw-bold">₹{selectedOrder.order_details.unit_price}</span>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-uppercase text-muted fw-bold mb-2 d-block" style={{ fontSize: '0.7rem' }}>
                                            <CreditCard size={14} className="me-1 mb-1" /> Payment Details
                                        </label>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="small text-muted">Total Amount:</span>
                                            <span className="h4 mb-0 fw-bold text-success">₹{selectedOrder.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="small text-muted">Status:</span>
                                            <Badge bg={selectedOrder.status === 'paid' ? 'success' : 'warning'}>{selectedOrder.status.toUpperCase()}</Badge>
                                        </div>
                                        {selectedOrder.payment_id && (
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="small text-muted">Payment ID:</span>
                                                <code className="small">{selectedOrder.payment_id}</code>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <div className="d-flex align-items-center text-muted small">
                                            <Calendar size={14} className="me-2" /> Placed on: {new Date(selectedOrder.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => window.print()}>Invoice / Print</Button>
                </Modal.Footer>
            </Modal>

            {/* Pincode Edit Modal */}
            <Modal show={showPincodeModal} onHide={() => setShowPincodeModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Edit Pricing: {editingPincode?.pincode}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePincodeSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Price per Ton (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                required
                                value={pincodeFormData.price_ton}
                                onChange={e => setPincodeFormData({ ...pincodeFormData, price_ton: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price per Brass (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                required
                                value={pincodeFormData.price_brass}
                                onChange={e => setPincodeFormData({ ...pincodeFormData, price_brass: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price per Foot (₹)</Form.Label>
                            <Form.Control
                                type="number"
                                required
                                value={pincodeFormData.price_foot}
                                onChange={e => setPincodeFormData({ ...pincodeFormData, price_foot: e.target.value })}
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100" disabled={updatingPincode}>
                            {updatingPincode ? 'Updating...' : 'Update Pricing'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Orders;
