// src/services/bookingService.ts
import { apiClient } from './api';
import { BookingResponseDto, ApiResponse } from '@/types';

interface QRCodeData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  ganpatiName: string;
  totalAmount: number;
  advancePaid: number;
  remainingAmount: number;
  status: string;
  bookingDate: string;
  timestamp: string;
}

export const bookingService = {
  async getMyBookings(): Promise<ApiResponse<BookingResponseDto[]>> {
    return apiClient<ApiResponse<BookingResponseDto[]>>('/customer/bookings');
  },

  async getBookingDetails(id: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>(`/customer/bookings/${id}`);
  },

  async requestBooking(ganpatiId: string, advancePaid?: number): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>('/customer/booking-request', {
      method: 'POST',
      body: JSON.stringify({ ganpatiId, advancePaid }),
    });
  },

  async getQRCodeData(bookingId: string): Promise<ApiResponse<QRCodeData>> {
    return apiClient<ApiResponse<QRCodeData>>(`/customer/qr/${bookingId}`);
  },
};