import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Spinner, Dropdown, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, ShoppingBag, MapPin, Users, HelpCircle, MessageSquare, LogOut, Star, Menu, Bell, Search, Hash, ChevronLeft } from 'lucide-react';
import NotificationDropdown from '../../components/Admin/NotificationDropdown';
import IdleTimer from '../../components/Admin/IdleTimer';

const AdminLayout = () => {
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Desktop toggle
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');

    // Toast Notifications
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState({ title: '', message: '', type: 'order' });

    useEffect(() => {
        checkUser();
        
        // Realtime Subscriptions for Popup Notifications
        const orderChannel = supabase.channel('layout-orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                setToastData({
                    title: 'New Order Received!',
                    message: `A new order has been placed by ${payload.new.customer_name || 'a customer'}.`,
                    type: 'order'
                });
                setShowToast(true);
            }).subscribe();

        const inquiryChannel = supabase.channel('layout-inquiries')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, (payload) => {
                setToastData({
                    title: 'New Inquiry!',
                    message: `You have a new inquiry from ${payload.new.name}.`,
                    type: 'inquiry'
                });
                setShowToast(true);
            }).subscribe();

        return () => {
            supabase.removeChannel(orderChannel);
            supabase.removeChannel(inquiryChannel);
        };
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/admin/login');
        } else {
            setUser(user);

            // Derive display name from metadata or email prefix
            const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
            if (metaName) {
                setUserName(metaName);
            } else {
                // Capitalise the part before @ in the email
                const prefix = user.email.split('@')[0];
                setUserName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
            }

            // Fetch Role - Robust Lookup
            const cleanEmail = user.email.trim().toLowerCase();
            const userId = user.id;
            
            console.log("🔐 Checking role for:", cleanEmail, "(ID:", userId, ")");

            // 1. Try fetching by ID first (most reliable)
            let { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            // 2. If not found by ID, try fetching by Email (fallback for manual entries)
            if (!data && !error) {
                console.log("ℹ️ No role found by ID, trying Email fallback...");
                const emailResult = await supabase
                    .from('user_roles')
                    .select('role')
                    .ilike('email', cleanEmail)
                    .maybeSingle();
                
                data = emailResult.data;
                error = emailResult.error;
            }

            if (error) {
                console.error("❌ Supabase role fetch error:", error.message);
            }

            if (data) {
                const role = data.role?.toLowerCase().trim();
                setUserRole(role);
                console.log("✅ Role applied:", role, "Raw data:", data);
            } else {
                console.warn("⚠️ No role entry found in 'user_roles' table for user. Defaulting to 'no access'.");
                setUserRole(null);
            }
        }
        setLoading(false);
    };

    // simplified redirect logic - only check if logged in
    useEffect(() => {
        if (!loading && !user && location.pathname !== '/admin/login') {
            navigate('/admin/login');
        }
    }, [location.pathname, user, loading]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100 bg-light"><Spinner animation="border" variant="primary" /></div>;

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
        return (
            <Nav.Link as={Link} to={to} className={`d-flex align-items-center px-4 py-3 text-decoration-none transition-all ${isActive ? 'text-white bg-primary bg-opacity-10 border-end border-4 border-primary' : 'text-secondary hover-bg-light'}`}>
                <Icon size={20} className={isActive ? 'text-primary' : 'text-secondary'} style={{ minWidth: '24px' }} />
                <span className={`ms-3 fw-medium ${isActive ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '0.95rem' }}>{label}</span>
            </Nav.Link>
        );
    };

    return (
        <div className="d-flex min-vh-100 bg-light font-sans">
            {/* Idle Monitor */}
            <IdleTimer onLogout={handleLogout} />
            {/* Mobile Overlay Backdrop */}
            {sidebarOpen && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1035 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-white border-end position-fixed h-100 start-0 top-0 transition-width shadow-sm ${sidebarOpen ? 'd-block' : 'd-none'} ${desktopSidebarOpen ? 'd-lg-block' : 'd-lg-none'}`}
                style={{ width: '260px', zIndex: 1040 }}
            >
                <div className="d-flex align-items-center justify-content-between px-4 py-4 border-bottom" style={{ height: '70px' }}>
                    <div className="d-flex align-items-center">
                        <div className="bg-primary rounded p-1 me-2 d-flex"><LayoutDashboard className="text-white" size={20} /></div>
                        <div>
                            <span className="fw-bold h5 mb-0 text-dark tracking-tight d-block">Slagsand<span className="text-primary">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ''}</span></span>
                        </div>
                    </div>
                    {/* Desktop Collapse Button (Inside Sidebar) */}
                    <Button
                        variant="link"
                        className="text-muted p-0 d-none d-lg-block"
                        onClick={() => setDesktopSidebarOpen(false)}
                    >
                        <ChevronLeft size={24} />
                    </Button>
                </div>

                <div className="py-4 overflow-auto h-100 pb-5">

                    {/* Dashboard - Visible to all roles but potentially with different views handled inside */}
                    <small className="text-uppercase text-muted fw-bold px-4 mb-2 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Overview</small>
                    <Nav className="flex-column mb-4">
                        <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
                    </Nav>
                    
                    <small className="text-uppercase text-muted fw-bold px-4 mb-2 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Management</small>
                    <Nav className="flex-column mb-4">
                        <NavItem to="/admin/orders" icon={ShoppingBag} label="Orders" />
                        <NavItem to="/admin/inquiries" icon={MessageSquare} label="Inquiries" />
                        
                        {/* Marketers - Admin & Executive only */}
                        {(userRole === 'admin' || userRole === 'executive') && (
                            <NavItem to="/admin/marketers" icon={Users} label="Marketers" />
                        )}
                        
                        {/* User Roles - Admin Only (Super Admin) */}
                        {userRole === 'admin' && (
                            <NavItem to="/admin/users" icon={Users} label="User Roles" />
                        )}
                    </Nav>
                    
                    {/* Content - Admin & Executive only */}
                    {(userRole === 'admin' || userRole === 'executive') && (
                        <>
                            <small className="text-uppercase text-muted fw-bold px-4 mb-2 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Content</small>
                            <Nav className="flex-column mb-4">
                                <NavItem to="/admin/pincodes" icon={MapPin} label="Pincodes & Pricing" />
                                <NavItem to="/admin/testimonials" icon={Star} label="Testimonials" />
                                <NavItem to="/admin/faqs" icon={HelpCircle} label="FAQs" />
                                <NavItem to="/admin/achievements" icon={Hash} label="Achievements" />
                            </Nav>
                        </>
                    )}
                    
                    {/* Staff Content - Limited set for staff role */}
                    {userRole === 'staff' && (
                        <>
                            <small className="text-uppercase text-muted fw-bold px-4 mb-2 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Information</small>
                            <Nav className="flex-column mb-4">
                                <NavItem to="/admin/pincodes" icon={MapPin} label="Pincodes" />
                            </Nav>
                        </>
                    )}
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div
                className={`flex-grow-1 d-flex flex-column ${desktopSidebarOpen ? 'admin-content-shifted' : ''}`}
            >

                {/* Header */}
                <header className="bg-white border-bottom sticky-top px-3 px-md-4 shadow-sm" style={{ height: '70px', zIndex: 1030 }}>
                    <div className="d-flex align-items-center justify-content-between h-100">
                        <div className="d-flex align-items-center gap-2">
                            {/* Mobile Toggle */}
                            <Button
                                variant="link"
                                className="p-0 d-lg-none text-dark"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu size={24} />
                            </Button>
                            {/* Desktop Expand Button (Visible only when sidebar is closed) */}
                            {!desktopSidebarOpen && (
                                <Button variant="link" className="text-dark p-0 me-3 d-none d-lg-block" onClick={() => setDesktopSidebarOpen(true)}>
                                    <Menu size={24} />
                                </Button>
                            )}
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            <div className="d-none d-lg-flex align-items-center bg-light rounded-pill px-3 py-2">
                                <Search size={16} className="text-muted me-2" />
                                <input type="text" className="border-0 bg-transparent small focus-ring-none" placeholder="Search..." style={{ outline: 'none', width: '150px' }} />
                            </div>

                            <NotificationDropdown />

                            <div className="vr mx-2 h-50 my-auto text-muted"></div>                            <Dropdown align="end">
                                <Dropdown.Toggle variant="white" className="d-flex align-items-center border-0 p-0 text-dark after-none">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-lg-2 fw-bold" style={{ width: '36px', height: '36px' }}>
                                        {user?.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="d-none d-lg-block text-start lh-1 me-2">
                                        <div className="fw-bold small">{userName ? userName.toUpperCase() : (userRole ? userRole.toUpperCase() : 'NO ACCESS')}</div>
                                        {/* Only show role if it's different from the name to avoid double text */}
                                        {userName && userName.toUpperCase() !== userRole?.toUpperCase() && (
                                            <div className="text-primary fw-bold" style={{ fontSize: '0.65rem' }}>{userRole?.toUpperCase()}</div>
                                        )}
                                        <div className="text-muted" style={{ fontSize: '0.6rem' }}>{user?.email}</div>
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="shadow border-0 mt-2 rounded-3 p-2" style={{ minWidth: '200px' }}>
                                    <Dropdown.Item onClick={handleLogout} className="text-danger rounded-2 d-flex align-items-center">
                                        <LogOut size={16} className="me-2" /> Sign Out
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow-1 p-3 p-md-4">
                    <Outlet context={{ userRole }} />
                </main>
            </div>

            {/* Real-time Popups */}
            <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide className="border-0 shadow-lg rounded-3">
                    <Toast.Header className={`bg-${toastData.type === 'order' ? 'primary' : 'info'} text-white border-0 rounded-top`}>
                        {toastData.type === 'order' ? <ShoppingBag size={16} className="me-2" /> : <MessageSquare size={16} className="me-2" />}
                        <strong className="me-auto">{toastData.title}</strong>
                    </Toast.Header>
                    <Toast.Body className="bg-white rounded-bottom">
                        {toastData.message}
                        <div className="mt-2 pt-2 border-top">
                            <Button size="sm" variant="link" className="p-0 text-decoration-none fw-bold" onClick={() => {
                                setShowToast(false);
                                navigate(toastData.type === 'order' ? '/admin/orders' : '/admin/inquiries');
                            }}>
                                View Details
                            </Button>
                        </div>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default AdminLayout;
