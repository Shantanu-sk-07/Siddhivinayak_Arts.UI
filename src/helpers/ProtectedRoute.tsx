import { Navigate } from 'react-router-dom';
import { UrlPath } from '@/constants/UrlPath';
import { isLoggedIn } from '@/helpers/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isLoggedIn()) {
    return <Navigate to={UrlPath.LOGIN} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;