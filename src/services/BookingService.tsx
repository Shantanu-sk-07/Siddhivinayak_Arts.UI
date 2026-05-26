// src/services/bookingService.ts
import { Booking, ApiResponse } from '@/types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const bookingService = {
  async getMyBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await fetch(`${API_BASE}/customer/bookings`);
    return response.json();
  },

  async requestBooking(ganpatiId: string): Promise<ApiResponse<Booking>> {
    const response = await fetch(`${API_BASE}/customer/booking-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ganpatiId }),
    });
    return response.json();
  },

  async getBookingDetails(id: string): Promise<ApiResponse<Booking>> {
    const response = await fetch(`${API_BASE}/bookings/${id}`);
    return response.json();
  },

  async updateStatus(id: string, status: string): Promise<ApiResponse<Booking>> {
    const response = await fetch(`${API_BASE}/admin/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};