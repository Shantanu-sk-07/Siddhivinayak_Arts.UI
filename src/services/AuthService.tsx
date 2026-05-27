import { apiClient } from './api';
import { ApiResponse, LoginResponse, RegisterResponseDto, RegisterRequest } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponseDto>> {
    return apiClient<ApiResponse<RegisterResponseDto>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  logout(): void {
    localStorage.removeItem('auth-storage');
  },
};