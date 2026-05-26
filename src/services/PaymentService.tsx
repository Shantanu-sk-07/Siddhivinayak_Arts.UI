// src/services/paymentService.ts
import { Payment, ApiResponse } from '@/types';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const paymentService = {
  async makePayment(bookingId: string, amount: number, method: string): Promise<ApiResponse<Payment>> {
    const response = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, amount, method }),
    });
    return response.json();
  },

  async uploadOfflinePayment(bookingId: string, amount: number, screenshot: File): Promise<ApiResponse<Payment>> {
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('amount', amount.toString());
    formData.append('screenshot', screenshot);
    
    const response = await fetch(`${API_BASE}/payments/offline`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async getPaymentHistory(bookingId: string): Promise<ApiResponse<Payment[]>> {
    const response = await fetch(`${API_BASE}/payments/booking/${bookingId}`);
    return response.json();
  },
};