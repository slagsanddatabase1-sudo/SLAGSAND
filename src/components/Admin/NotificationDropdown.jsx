import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner, ListGroup, Button } from 'react-bootstrap';
import { Bell, ShoppingBag, UserPlus, MessageSquare, Clock, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dismissedIds, setDismissedIds] = useState(() => {
        const saved = localStorage.getItem('dismissed_notifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [lastOpened, setLastOpened] = useState(() => {
        return localStorage.getItem('notifications_last_opened') || new Date(0).toISOString();
    });

    const fetchNotifications = async () => {
        try {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // Fetch Recent Orders (Increase limit to show scroll)
            const { data: orders } = await supabase
                .from('orders')
                .select('id, amount, created_at, user_details')
                .gt('created_at', yesterday)
                .order('created_at', { ascending: false })
                .limit(5);

            // Fetch Recent Users
            const { data: users } = await supabase
                .from('user_roles')
                .select('email, role, created_at')
                .gt('created_at', yesterday)
                .order('created_at', { ascending: false })
                .limit(5);

            // Fetch Recent Inquiries
            const { data: inquiries } = await supabase
                .from('inquiries')
                .select('id, name, created_at')
                .gt('created_at', yesterday)
                .order('created_at', { ascending: false })
                .limit(5);

            const allNotifications = [
                ...(orders || []).map(o => ({
                    id: `order-${o.id}`,
                    type: 'order',
                    title: 'New Order',
                    description: `${o.user_details?.name || 'Customer'} placed an order for ₹${o.amount}`,
                    time: new Date(o.created_at),
                    link: '/admin/orders'
                })),
                ...(users || []).map(u => ({
                    id: `user-${u.email}`,
                    type: 'user',
                    title: 'New User Registered',
                    description: `${u.email} joined as ${u.role}`,
                    time: new Date(u.created_at),
                    link: '/admin/users'
                })),
                ...(inquiries || []).map(i => ({
                    id: `inquiry-${i.id}`,
                    type: 'inquiry',
                    title: 'New Inquiry',
                    description: `New message from ${i.name}`,
                    time: new Date(i.created_at),
                    link: '/admin/inquiries'
                }))
            ]
                .filter(n => !dismissedIds.includes(n.id))
                .sort((a, b) => b.time - a.time);

            setNotifications(allNotifications);

            // Unread count = notifications newer than the last time we opened the dropdown
            const newCount = allNotifications.filter(n => n.time.toISOString() > lastOpened).length;
            setUnreadCount(newCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to Realtime changes
        const ordersChannel = supabase
            .channel('orders-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
                fetchNotifications();
            })
            .subscribe();

        const inquiriesChannel = supabase
            .channel('inquiries-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, () => {
                fetchNotifications();
            })
            .subscribe();

        const usersChannel = supabase
            .channel('users-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_roles' }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(inquiriesChannel);
            supabase.removeChannel(usersChannel);
        };
    }, [dismissedIds, lastOpened]);

    const handleToggle = (isOpen) => {
        if (isOpen) {
            // When opening, reset the "unread" status
            const now = new Date().toISOString();
            setLastOpened(now);
            localStorage.setItem('notifications_last_opened', now);
            setUnreadCount(0);
        }
    };

    const handleDismiss = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        const updatedIds = [...dismissedIds, id];
        setDismissedIds(updatedIds);
        localStorage.setItem('dismissed_notifications', JSON.stringify(updatedIds));

        // Remove from current UI state
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const formatTime = (date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        if (diffInMinutes < 1) return 'now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingBag size={14} className="text-primary" />;
            case 'user': return <UserPlus size={14} className="text-success" />;
            case 'inquiry': return <MessageSquare size={14} className="text-info" />;
            default: return <Bell size={14} />;
        }
    };

    return (
        <Dropdown align="end" onToggle={handleToggle}>
            <Dropdown.Toggle variant="light" className="rounded-circle p-2 position-relative text-secondary border-0 after-none">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span
                        className="position-absolute translate-middle bg-danger border border-light rounded-circle fw-bold text-white d-flex align-items-center justify-content-center animate-pulse"
                        style={{ top: '5px', left: '85%', fontSize: '0.6rem', padding: '1px 4px', minWidth: '16px', zIndex: 10 }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg border-0 mt-2 rounded-4 p-0 overflow-hidden" style={{ width: '330px' }}>
                <div className="px-4 py-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Notifications</h6>
                    {unreadCount > 0 && <Badge bg="primary" pill>{unreadCount} New</Badge>}
                </div>

                <div
                    className="notification-scroll-area"
                    style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    {loading ? (
                        <div className="p-5 text-center"><Spinner size="sm" animation="border" variant="primary" /></div>
                    ) : notifications.length > 0 ? (
                        <ListGroup variant="flush">
                            {notifications.map((n) => (
                                <ListGroup.Item
                                    key={n.id}
                                    as={Link}
                                    to={n.link}
                                    className="px-4 py-3 transition-all list-group-item-action border-bottom position-relative notification-item"
                                >
                                    <div className="d-flex align-items-start pe-4">
                                        <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                                            {getTypeIcon(n.type)}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <small className="fw-bold text-dark">{n.title}</small>
                                                <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                                                    <Clock size={10} className="me-1" /> {formatTime(n.time)}
                                                </small>
                                            </div>
                                            <p className="mb-0 text-muted small lh-sm">{n.description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="position-absolute top-50 end-0 translate-middle-y text-muted p-2 me-2 border-0 opacity-50 transition-all dismiss-btn"
                                        onClick={(e) => handleDismiss(e, n.id)}
                                        style={{ zIndex: 5, visibility: 'hidden' }}
                                    >
                                        <X size={14} />
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <div className="p-5 text-center text-muted">
                            <Bell size={40} className="mb-3 opacity-25" />
                            <p className="small mb-0">No active notifications</p>
                        </div>
                    )}
                </div>

                <Link to="/admin" className="d-block text-center py-3 text-primary fw-bold small text-decoration-none bg-light border-top border-opacity-10 transition-all hover-bg-dark hover-text-white">
                    View Complete Dashboard
                </Link>
            </Dropdown.Menu>

            <style>{`
                .notification-scroll-area::-webkit-scrollbar {
                    width: 6px;
                }
                .notification-scroll-area::-webkit-scrollbar-track {
                    background: transparent;
                }
                .notification-scroll-area::-webkit-scrollbar-thumb {
                    background: #e0e0e0;
                    border-radius: 10px;
                }
                .notification-scroll-area::-webkit-scrollbar-thumb:hover {
                    background: #d0d0d0;
                }
                .notification-item:hover .dismiss-btn {
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                .notification-item:hover {
                    background-color: #f8f9fa !important;
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                }
                .hover-bg-dark:hover {
                    background-color: #212529 !important;
                    color: white !important;
                }
            `}</style>
        </Dropdown>
    );
};

export default NotificationDropdown;
