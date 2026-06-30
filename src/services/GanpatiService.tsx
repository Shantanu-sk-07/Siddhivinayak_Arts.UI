// src/services/GanpatiService.tsx
import { apiClient } from './api';
import { GanpatiResponseDto, ApiResponse } from '@/types/MurtiType';

export const ganpatiService = {
  async getAll(): Promise<ApiResponse<GanpatiResponseDto[]>> {
    return apiClient<ApiResponse<GanpatiResponseDto[]>>('/ganpati/all');
  },
  
  async getFeatured(): Promise<ApiResponse<GanpatiResponseDto[]>> {
    return apiClient<ApiResponse<GanpatiResponseDto[]>>('/ganpati/featured');
  },
  
  async getById(id: string): Promise<ApiResponse<GanpatiResponseDto>> {
    return apiClient<ApiResponse<GanpatiResponseDto>>(`/ganpati/${id}`);
  },

  async toggleLike(id: string): Promise<ApiResponse<{ likes: number; likedBy: string[] }>> {
    const userId = localStorage.getItem('userId') || 'anonymous';
    return apiClient<ApiResponse<{ likes: number; likedBy: string[] }>>(`/ganpati/${id}/like?userId=${userId}`, {
      method: 'POST',
    });
  },
};