// src/services/staffService.ts
import { apiClient } from './api';
import { BookingResponseDto, ApiResponse, PickupStats } from '@/types';

export const staffService = {
  // Pickup endpoints
  async getTodaysPickups(): Promise<ApiResponse<BookingResponseDto[]>> {
    return apiClient<ApiResponse<BookingResponseDto[]>>('/staff/todays-pickups');
  },

  async completePickup(bookingId: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>(`/staff/complete-pickup/${bookingId}`, {
      method: 'POST',
    });
  },

  async verifyBooking(bookingId: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>('/staff/verify-booking', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  },

  // Stats endpoint
  async getPickupStats(): Promise<ApiResponse<PickupStats>> {
    return apiClient<ApiResponse<PickupStats>>('/staff/pickup-stats');
  },

  // Search endpoints
  async searchPickupByPhone(phone: string): Promise<ApiResponse<{ booking: BookingResponseDto }>> {
    return apiClient<ApiResponse<{ booking: BookingResponseDto }>>(`/staff/search-pickup?phone=${phone}`);
  },

  async searchBookingByPhone(phone: string): Promise<ApiResponse<{ booking: BookingResponseDto }>> {
    return apiClient<ApiResponse<{ booking: BookingResponseDto }>>(`/staff/search-booking?phone=${phone}`);
  },

  // Payment verification
  async verifyPayment(bookingId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient<ApiResponse<{ success: boolean; message: string }>>(`/staff/verify-payment/${bookingId}`, {
      method: 'POST',
    });
  },

  // Pickups list
  async getAllPickups(): Promise<ApiResponse<BookingResponseDto[]>> {
    return apiClient<ApiResponse<BookingResponseDto[]>>('/staff/pickups');
  },

  // Receipt endpoint
  async printReceipt(bookingId: string): Promise<Blob> {
    const auth = localStorage.getItem('auth-storage');
    let authToken = '';
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        authToken = parsed.state?.token || parsed.token;
      } catch {
        authToken = '';
      }
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/staff/receipt/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to print receipt');
    }
    return response.blob();
  },

  // General search
  async searchByPhone(phone: string): Promise<ApiResponse<{ booking: BookingResponseDto }>> {
    return apiClient<ApiResponse<{ booking: BookingResponseDto }>>(`/staff/search?phone=${phone}`);
  },
};