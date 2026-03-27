import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Spinner, Dropdown, Badge } from 'react-bootstrap';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, ShoppingBag, MapPin, Users, HelpCircle, MessageSquare, LogOut, Star, Menu, Bell, Search, Hash, ChevronLeft } from 'lucide-react';
import NotificationDropdown from '../../components/Admin/NotificationDropdown';

const AdminLayout = () => {
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Desktop toggle
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        checkUser();
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

            // Fetch Role
            const { data, error } = await supabase
                .from('user_roles')
                .select('role, name')
                .eq('email', user.email)
                .single();

            if (data) {
                setUserRole(data.role);
                if (data.name) setUserName(data.name); // Use DB name if available
            } else {
                // FALLBACK TO ADMIN TEMPORARILY
                // This ensures you are not locked out while setting up roles.
                console.warn("No role found for user, defaulting to ADMIN access.");
                setUserRole('admin');
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
                        <span className="fw-bold h5 mb-0 text-dark tracking-tight">Slagsand<span className="text-primary">Admin</span></span>
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

                    {/* Dashboard - Visible to Admin & Executive */}
                    {(userRole === 'admin' || userRole === 'executive' || userRole === 'staff') && (
                        <>
                            <small className="text-uppercase text-muted fw-bold px-4 mb-2 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Overview</small>
                            <Nav className="flex-column mb-4">
                                <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
                            </Nav>
                        </>
                    )}

                    <small className="text-uppercase text-muted fw-bold px-4 mb-2 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Management</small>
                    <Nav className="flex-column mb-4">
                        <NavItem to="/admin/orders" icon={ShoppingBag} label="Orders" />
                        <NavItem to="/admin/inquiries" icon={MessageSquare} label="Inquiries" />
                        {/* Marketers - Admin & Executive only */}
                        {(userRole === 'admin' || userRole === 'executive' || userRole === 'staff') && (
                            <NavItem to="/admin/marketers" icon={Users} label="Marketers" />
                        )}
                        {/* Users - Admin Only */}
                        {userRole === 'admin' && (
                            <NavItem to="/admin/users" icon={Users} label="User Roles" />
                        )}
                    </Nav>

                    {/* Content - Admin & Executive only */}
                    {(userRole === 'admin' || userRole === 'executive' || userRole === 'staff') && (
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
                                        <div className="fw-bold small">{userName ? userName.toUpperCase() : userRole?.toUpperCase()}</div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{user?.email}</div>
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
        </div>
    );
};

export default AdminLayout;
