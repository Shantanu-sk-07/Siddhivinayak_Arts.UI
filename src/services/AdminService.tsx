// src/services/adminService.ts
import { apiClient, apiFormData } from './api';
import { 
  GanpatiResponseDto, ApiResponse, BookingResponseDto, 
  PaymentResponseDto, StaffResponseDto, CustomerResponseDto, 
  DashboardStats, StaffFormData 
} from '@/types';

interface ReportData {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  completedPickups: number;
  revenueTrend: number;
  bookingTrend: number;
  monthlyData: Array<{ month: string; revenue: number; bookings: number }>;
  topGanpati: Array<{ name: string; bookings: number; revenue: number }>;
  paymentMethodBreakdown: Array<{ name: string; value: number }>;
}

export const adminService = {
  // Ganpati Management
  async getAllGanpati(): Promise<ApiResponse<GanpatiResponseDto[]>> {
    return apiClient<ApiResponse<GanpatiResponseDto[]>>('/admin/ganpati');
  },

  async createGanpati(formData: FormData): Promise<ApiResponse<GanpatiResponseDto>> {
    return apiFormData<ApiResponse<GanpatiResponseDto>>('/admin/ganpati', formData, 'POST');
  },

  async updateGanpati(id: string, formData: FormData): Promise<ApiResponse<GanpatiResponseDto>> {
    return apiFormData<ApiResponse<GanpatiResponseDto>>(`/admin/ganpati/${id}`, formData, 'PUT');
  },

  async deleteGanpati(id: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>(`/admin/ganpati/${id}`, {
      method: 'DELETE',
    });
  },

  // Booking Management
  async getAllBookings(): Promise<ApiResponse<BookingResponseDto[]>> {
    return apiClient<ApiResponse<BookingResponseDto[]>>('/admin/bookings');
  },

  async approveBooking(id: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>(`/admin/bookings/${id}/approve`, {
      method: 'POST',
    });
  },

  async rejectBooking(id: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>(`/admin/bookings/${id}/reject`, {
      method: 'POST',
    });
  },

  async updateBookingStatus(id: string, status: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Payment Management
  async getPendingPayments(): Promise<ApiResponse<PaymentResponseDto[]>> {
    return apiClient<ApiResponse<PaymentResponseDto[]>>('/admin/payments/pending');
  },

  async verifyPayment(paymentId: string, status: 'VERIFIED' | 'REJECTED'): Promise<ApiResponse<PaymentResponseDto>> {
    return apiClient<ApiResponse<PaymentResponseDto>>(`/admin/payments/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  // Staff Management
  async getAllStaff(): Promise<ApiResponse<StaffResponseDto[]>> {
    return apiClient<ApiResponse<StaffResponseDto[]>>('/admin/staff');
  },

  async addStaff(data: StaffFormData): Promise<ApiResponse<StaffResponseDto>> {
    return apiClient<ApiResponse<StaffResponseDto>>('/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStaff(id: string, data: StaffFormData): Promise<ApiResponse<StaffResponseDto>> {
    return apiClient<ApiResponse<StaffResponseDto>>(`/admin/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStaff(id: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>(`/admin/staff/${id}`, {
      method: 'DELETE',
    });
  },

  // Customer Management
  async getAllCustomers(): Promise<ApiResponse<CustomerResponseDto[]>> {
    return apiClient<ApiResponse<CustomerResponseDto[]>>('/admin/customers');
  },

  // Dashboard & Reports
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient<ApiResponse<DashboardStats>>('/admin/dashboard-stats');
  },

  async getReports(range: string): Promise<ApiResponse<ReportData>> {
    return apiClient<ApiResponse<ReportData>>(`/admin/reports?range=${range}`);
  },

  async exportReport(range: string): Promise<Blob> {
    const token = localStorage.getItem('auth-storage');
    let authToken = '';
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed.state?.token || parsed.token;
      } catch {
        authToken = '';
      }
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/reports/export?range=${range}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    return response.blob();
  },
};