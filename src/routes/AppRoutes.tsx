// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/utils/useAuth';
import DashboardLayout from '@/layouts/DashBoardLayout';
import WebsiteLayout from '@/layouts/WebsiteLayout';

// Auth Pages
import Login from '@/view/AuthPages/Login';
import Register from '@/view/AuthPages/Register';
import ForgotPassword from '@/view/AuthPages/ForgotPassword';

// Customer Pages
import CustomerDashboard from '@/view/DashboardPages/Customer/CustomerDashboard';
import GanpatiListing from '@/view/DashboardPages/Customer/GanpatiListing';
import GanpatiDetails from '@/view/DashboardPages/Customer/GanpatiDetails';
import MyBookings from '@/view/DashboardPages/Customer/MyBookings';
import PaymentHistory from '@/view/DashboardPages/Customer/PaymentHistory';
import QRScanPage from '@/view/DashboardPages/Customer/QRScanPage';

// Staff Pages
import StaffDashboard from '@/view/DashboardPages/Staff/StaffDashboard';
import QRScanVerification from '@/view/DashboardPages/Staff/QRScanVerification';
import PickupManagement from '@/view/DashboardPages/Staff/PickupManagement';

// Admin Pages
import AdminDashboard from '@/view/DashboardPages/SuperAdmin/AdminDashboard';
import GanpatiManagement from '@/view/DashboardPages/SuperAdmin/GanpatiManagement';
import BookingManagement from '@/view/DashboardPages/SuperAdmin/BookingManagement';
import PaymentVerification from '@/view/DashboardPages/SuperAdmin/PaymentVerification';
import StaffManagement from '@/view/DashboardPages/SuperAdmin/StaffManagement';
import CustomerManagement from '@/view/DashboardPages/SuperAdmin/CustomerManagement';
import Reports from '@/view/DashboardPages/SuperAdmin/Reports';

// Website Pages
import HomePage from '@/view/WebsitePages/HomePage';
import AboutUs from '@/view/WebsitePages/AboutUs';
import ContactUs from '@/view/WebsitePages/ContactUs';

// Profile & Settings Pages (create these if needed)
import Profile from '@/view/WebsitePages/Profile';
import Settings from '@/view/WebsitePages/Settings';

import { UrlPath } from '@/constants/UrlPath';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={UrlPath.LOGIN} replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <Navigate to={UrlPath.ADMIN_DASHBOARD} replace />;
      case 'STAFF':
        return <Navigate to={UrlPath.STAFF_DASHBOARD} replace />;
      case 'CUSTOMER':
        return <Navigate to={UrlPath.CUSTOMER_DASHBOARD} replace />;
      default:
        return <Navigate to={UrlPath.LOGIN} replace />;
    }
  }
  
  return <>{children}</>;
};

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return UrlPath.LOGIN;
    switch (user.role) {
      case 'SUPER_ADMIN': return UrlPath.ADMIN_DASHBOARD;
      case 'STAFF': return UrlPath.STAFF_DASHBOARD;
      case 'CUSTOMER': return UrlPath.CUSTOMER_DASHBOARD;
      default: return UrlPath.LOGIN;
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path={UrlPath.HOME} element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Common Protected Routes */}
      <Route path={UrlPath.PROFILE} element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'STAFF', 'CUSTOMER']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Profile />} />
      </Route>

      <Route path={UrlPath.SETTINGS} element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'STAFF', 'CUSTOMER']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Settings />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/customer" element={
        <ProtectedRoute allowedRoles={['CUSTOMER']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="ganpati" element={<GanpatiListing />} />
        <Route path="ganpati/:id" element={<GanpatiDetails />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="qr/:bookingId" element={<QRScanPage />} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['STAFF']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="scan" element={<QRScanVerification />} />
        <Route path="pickup" element={<PickupManagement />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="ganpati" element={<GanpatiManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="payments" element={<PaymentVerification />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? getDashboardPath() : UrlPath.HOME} replace />} />
    </Routes>
  );
}