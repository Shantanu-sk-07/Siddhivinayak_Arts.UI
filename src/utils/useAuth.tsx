import { useAuthStore } from '@/store/AuthStore';
import { useCallback } from 'react';
import { ApiResponse, User } from '@/types';
import { authService } from '@/services/AuthService';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();

  const loginUser = useCallback(async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.data) {
        const { token: authToken, ...userData } = response.data;
        login(userData as User, authToken);
      }
      return response as ApiResponse<User>;
    } catch  {
      return {
        success: false,
        data: null as unknown as User,
        message: 'Login failed',
      };
    }
  }, [login]);

  const logoutUser = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, [logout]);

  return {
    user,
    token,
    isAuthenticated,
    login: loginUser,
    logout: logoutUser,
    updateUser,
  };
};