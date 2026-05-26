import { Navigate } from 'react-router-dom';
import { UrlPath } from '@/constants/UrlPath';
import { useState, useEffect } from 'react';
import { showSnackbar } from '@/components/uncontrolled/ToastMessage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const isActive = data.data.isActive ?? data.data.active ?? true;
          
          if (isActive === false) {
            showSnackbar("warning", "Your account has been deactivated. Please contact super admin.");
            localStorage.clear();
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } else {
          localStorage.clear();
          setIsAuthenticated(false);
        }
      } catch {
        localStorage.clear();
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkUser();
  }, []);

  if (isChecking) return null;
  
  if (!isAuthenticated) {
    return <Navigate to={UrlPath.LOGIN} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
