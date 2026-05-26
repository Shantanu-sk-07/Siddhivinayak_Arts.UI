import { User, ApiResponse } from '@/types';

interface LoginResponseData extends User {
  token: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponseData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch {
      return {
        success: false,
        data: null as unknown as LoginResponseData,
        message: 'Network error. Please check if backend is running.',
      };
    }
  },

  async register(userData: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch {
      return {
        success: false,
        data: null as unknown as User,
        message: 'Registration failed. Please try again.',
      };
    }
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch {
      return {
        success: false,
        data: null,
        message: 'Failed to send reset link.',
      };
    }
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      return await response.json();
    } catch {
      return {
        success: false,
        data: null,
        message: 'Failed to reset password.',
      };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth-storage');
  },
};