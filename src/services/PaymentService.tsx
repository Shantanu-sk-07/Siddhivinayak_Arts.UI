// src/services/paymentService.ts
import { apiClient } from './api';
import { PaymentResponseDto, ApiResponse } from '@/types';

export const paymentService = {
  // Payment history
  async getPaymentHistory(bookingId: string): Promise<ApiResponse<PaymentResponseDto[]>> {
    return apiClient<ApiResponse<PaymentResponseDto[]>>(`/customer/payments/${bookingId}`);
  },

  async getAllPayments(): Promise<ApiResponse<PaymentResponseDto[]>> {
    return apiClient<ApiResponse<PaymentResponseDto[]>>('/customer/payments/all');
  },

  // Offline payment
  async uploadOfflinePayment(bookingId: string, amount: number, screenshot: File, transactionId: string): Promise<ApiResponse<PaymentResponseDto>> {
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('amount', amount.toString());
    formData.append('transactionId', transactionId);
    formData.append('screenshot', screenshot);
    
    return apiClient<ApiResponse<PaymentResponseDto>>('/customer/payments/offline', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  // Online payment - Create order
  async createOrder(bookingId: string, amount: number): Promise<ApiResponse<{ order: { id: string; amount: number; currency: string } }>> {
    return apiClient<ApiResponse<{ order: { id: string; amount: number; currency: string } }>>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount }),
    });
  },

  // Online payment - Verify
  async verifyPayment(razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string, bookingId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return apiClient<ApiResponse<{ success: boolean; message?: string }>>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId }),
    });
  },

  // Get receipt
  async getReceipt(paymentId: string): Promise<ApiResponse<{ url: string }>> {
    return apiClient<ApiResponse<{ url: string }>>(`/payments/receipt/${paymentId}`);
  },
};