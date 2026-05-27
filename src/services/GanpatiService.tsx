// src/services/ganpatiService.ts
import { apiClient } from './api';
import { GanpatiResponseDto, ApiResponse } from '@/types';

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
};