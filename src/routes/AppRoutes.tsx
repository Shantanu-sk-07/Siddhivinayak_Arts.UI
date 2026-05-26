import { useRoutes, Navigate } from 'react-router-dom';
import { UrlPath } from '@/constants/UrlPath';
import DashboardLayout from '@/layouts/DashBoardLayout';
import WebsiteLayout from '@/layouts/WebsiteLayout';
import Login from '@/view/auth/Login';
import Register from '@/view/auth/Register';
import ProtectedRoute from '@/helpers/ProtectedRoute';

const AppRoutes = () => {
  const token = localStorage.getItem('token');

  return useRoutes([
    {
      path: '/',
      element: token ? <Navigate to={UrlPath.DASHBOARD} replace /> : <WebsiteLayout />,
    },
    {
      path: UrlPath.LOGIN,
      element: token ? <Navigate to={UrlPath.DASHBOARD} replace /> : <Login />,
    },
    {
      path: UrlPath.REGISTER,
      element: token ? <Navigate to={UrlPath.DASHBOARD} replace /> : <Register />,
    },
    {
      path: UrlPath.DASHBOARD,
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
    },
  ]);
};

export default AppRoutes;