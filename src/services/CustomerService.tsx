// src/services/customerService.ts
import { apiClient } from './api';
import { CustomerResponseDto, ApiResponse, BookingResponseDto, PaymentResponseDto } from '@/types';

interface CustomerSummary {
  activeBookings: number;
  completedBookings: number;
  totalPaid: number;
  pendingAmount: number;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

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

interface InterestedCheckResponse {
  isInterested: boolean;
}

interface ExistingBookingResponse {
  success: boolean;
  booking: BookingResponseDto | null;
}

export const customerService = {
  async getProfile(): Promise<ApiResponse<CustomerResponseDto>> {
    return apiClient<ApiResponse<CustomerResponseDto>>('/customer/profile');
  },

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<CustomerResponseDto>> {
    return apiClient<ApiResponse<CustomerResponseDto>>('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getMyBookings(): Promise<ApiResponse<BookingResponseDto[]>> {
    return apiClient<ApiResponse<BookingResponseDto[]>>('/customer/bookings');
  },

  async getBookingDetails(bookingId: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>(`/customer/bookings/${bookingId}`);
  },

  async requestBooking(ganpatiId: string, advancePaid?: number): Promise<ApiResponse<BookingResponseDto>> {
    // Get token from localStorage
    const auth = localStorage.getItem('auth-storage');
    let token = '';
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        token = parsed.state?.token || parsed.token;
      } catch {
        token = '';
      }
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/customer/booking-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ganpatiId, advancePaid }),
    });
    
    return response.json();
  },

  async getQRCodeData(bookingId: string): Promise<ApiResponse<QRCodeData>> {
    return apiClient<ApiResponse<QRCodeData>>(`/customer/qr/${bookingId}`);
  },

  async getPayments(bookingId: string): Promise<ApiResponse<PaymentResponseDto[]>> {
    return apiClient<ApiResponse<PaymentResponseDto[]>>(`/customer/payments/${bookingId}`);
  },

  async getAllPayments(): Promise<ApiResponse<PaymentResponseDto[]>> {
    return apiClient<ApiResponse<PaymentResponseDto[]>>('/customer/payments/all');
  },

  async submitOfflinePayment(bookingId: string, amount: number, transactionId: string, screenshot: File): Promise<ApiResponse<PaymentResponseDto>> {
    const formData = new FormData();
    formData.append('bookingId', bookingId);
    formData.append('amount', amount.toString());
    formData.append('transactionId', transactionId);
    if (screenshot) formData.append('screenshot', screenshot);
    
    return apiClient<ApiResponse<PaymentResponseDto>>('/customer/payments/offline', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  async downloadReceipt(bookingId: string): Promise<Blob> {
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
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/customer/receipt/${bookingId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    return response.blob();
  },

  async getInterestedItems(): Promise<ApiResponse<string[]>> {
    return apiClient<ApiResponse<string[]>>('/customer/interested');
  },

  async checkInterested(ganpatiId: string): Promise<ApiResponse<InterestedCheckResponse>> {
    return apiClient<ApiResponse<InterestedCheckResponse>>(`/customer/interested/check/${ganpatiId}`);
  },

  async toggleInterested(ganpatiId: string): Promise<ApiResponse<void>> {
    return apiClient<ApiResponse<void>>('/customer/interested/toggle', {
      method: 'POST',
      body: JSON.stringify({ ganpatiId }),
    });
  },

  async checkExistingBooking(ganpatiId: string): Promise<ApiResponse<ExistingBookingResponse>> {
    return apiClient<ApiResponse<ExistingBookingResponse>>(`/customer/booking/check/${ganpatiId}`);
  },

  async getCustomerSummary(): Promise<ApiResponse<CustomerSummary>> {
    return apiClient<ApiResponse<CustomerSummary>>('/customer/summary');
  },
};