import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashBoardLayout';
import WebsiteLayout from '@/layouts/WebsiteLayout';
import { UrlPath } from '@/constants/UrlPath';
import ProtectedRoute from '@/helpers/ProtectedRoute';
import { isLoggedIn } from '@/helpers/auth';

import HomePage from '@/container/public/HomePage';
import GanpatiListing from '@/container/public/GanpatiListing';
import GanpatiDetails from '@/container/public/GanpatiDetails';
import AboutPage from '@/container/public/AboutPage';
import ContactPage from '@/container/public/ContactPage';
import Login from '@/container/public/Login';
import GanpatiShareView from '@/container/public/GanpatiShareView';
import ReceiptView from '@/container/public/ReceiptView';

import AdminDashboard from '@/container/admin/AdminDashboard';
import GanpatiManagement from '@/container/admin/GanpatiManagement';
import CustomerManagement from '@/container/admin/CustomerManagement';
import BookingManagement from '@/container/admin/BookingManagement';
import Profile from '@/container/admin/Profile';
import Settings from '@/container/admin/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={UrlPath.HOME} element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="ganpati" element={<GanpatiListing />} />
        <Route path="ganpati/:id" element={<GanpatiDetails />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<Login />} />
        <Route path="view/:token" element={<GanpatiShareView />} />
        <Route path="receipt/:token" element={<ReceiptView />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="ganpati" element={<GanpatiManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isLoggedIn() ? UrlPath.ADMIN_DASHBOARD : UrlPath.HOME} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;