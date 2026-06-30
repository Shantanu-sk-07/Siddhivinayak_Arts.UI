// src/services/GanpatiService.ts
import { apiClient } from './api';
import { GanpatiResponseDto, ApiResponse } from '@/types/MurtiType';

export const ganpatiService = {
  async getAll(): Promise<ApiResponse<GanpatiResponseDto[]>> {
    return apiClient<ApiResponse<GanpatiResponseDto[]>>('/ganpati/all', {
      skipAuth: true
    });
  },
  
  async getFeatured(): Promise<ApiResponse<GanpatiResponseDto[]>> {
    return apiClient<ApiResponse<GanpatiResponseDto[]>>('/ganpati/featured', {
      skipAuth: true
    });
  },
  
  async getById(id: string): Promise<ApiResponse<GanpatiResponseDto>> {
    return apiClient<ApiResponse<GanpatiResponseDto>>(`/ganpati/${id}`, {
      skipAuth: true
    });
  },

  async toggleLike(id: string): Promise<ApiResponse<{ likes: number; likedBy: string[] }>> {
    const userId = localStorage.getItem('userId') || 'anonymous';
    return apiClient<ApiResponse<{ likes: number; likedBy: string[] }>>(`/ganpati/${id}/like?userId=${userId}`, {
      method: 'POST',
      skipAuth: true
    });
  }
};