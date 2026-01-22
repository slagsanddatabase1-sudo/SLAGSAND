import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import CustomNavbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingChat from './components/FloatingChat';
import SamplePopup from './components/SamplePopup';
import Home from './pages/Home';
import About from './pages/About';
import WorkWithUs from './pages/WorkWithUs';
import OrderNow from './pages/OrderNow';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminLogin from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import Pincodes from './pages/Admin/Pincodes';
import Inquiries from './pages/Admin/Inquiries';
import Orders from './pages/Admin/Orders';
import Marketers from './pages/Admin/Marketers';
import FAQs from './pages/Admin/FAQs';
import Testimonials from './pages/Admin/Testimonials';
import Counters from './pages/Admin/Counters';
import UserManagement from './pages/Admin/UserManagement';
import TestConnection from './pages/TestConnection';
import './App.css';

function App() {
  const [isSamplePopupOpen, setIsSamplePopupOpen] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <SamplePopup isOpen={isSamplePopupOpen} onClose={() => setIsSamplePopupOpen(false)} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div className="d-flex flex-column min-vh-100">
            <CustomNavbar
              isSamplePopupOpen={isSamplePopupOpen}
              onOpenSamplePopup={() => setIsSamplePopupOpen(true)}
              onCloseSamplePopup={() => setIsSamplePopupOpen(false)}
            />
            <main className="flex-grow-1">
              <Outlet context={{ openSamplePopup: () => setIsSamplePopupOpen(true) }} />
            </main>
            <FloatingChat />
            <Footer />
          </div>
        }>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="work-with-us" element={<WorkWithUs />} />
          <Route path="order-now" element={<OrderNow />} />
          <Route path="checkout/:orderId" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
          <Route path="test-connection" element={<TestConnection />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="pincodes" element={<Pincodes />} />
          <Route path="marketers" element={<Marketers />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="achievements" element={<Counters />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
