// src/services/AuthService.ts
import { apiClient } from './api';
import { setToken, clearToken } from '@/helpers/auth';
import { ApiResponse, LoginResponse } from '@/types/MurtiType';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient<ApiResponse<LoginResponse>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      });

      if (response.success && response.data?.token) {
        setToken(response.data.token);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('userName', response.data.name);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        data: {} as LoginResponse,
        message: error instanceof Error ? error.message : 'Login failed. Please try again.',
      };
    }
  },

  logout(): void {
    clearToken();
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
  }
};