import { apiClient, apiFormData } from './api';
import { 
  GanpatiResponseDto, ApiResponse, BookingResponseDto, 
  PaymentResponseDto, StaffResponseDto, CustomerResponseDto, 
  DashboardStats, StaffFormData, PickupStats 
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

  async getPendingPayments(): Promise<ApiResponse<PaymentResponseDto[]>> {
    return apiClient<ApiResponse<PaymentResponseDto[]>>('/admin/payments/pending');
  },

  async verifyPayment(paymentId: string, status: 'VERIFIED' | 'REJECTED'): Promise<ApiResponse<PaymentResponseDto>> {
    return apiClient<ApiResponse<PaymentResponseDto>>(`/admin/payments/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

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

  async getAllCustomers(): Promise<ApiResponse<CustomerResponseDto[]>> {
    return apiClient<ApiResponse<CustomerResponseDto[]>>('/admin/customers');
  },

  async getTodaysPickups(): Promise<ApiResponse<BookingResponseDto[]>> {
    return apiClient<ApiResponse<BookingResponseDto[]>>('/admin/pickups/today');
  },

  async completePickup(bookingId: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>(`/admin/pickups/${bookingId}/complete`, {
      method: 'POST',
    });
  },

  async getPickupStats(): Promise<ApiResponse<PickupStats>> {
    return apiClient<ApiResponse<PickupStats>>('/admin/pickups/stats');
  },

  async searchByPhone(phone: string): Promise<ApiResponse<{ booking: BookingResponseDto }>> {
    return apiClient<ApiResponse<{ booking: BookingResponseDto }>>(`/admin/pickups/search?phone=${phone}`);
  },

  async verifyBooking(bookingId: string): Promise<ApiResponse<BookingResponseDto>> {
    return apiClient<ApiResponse<BookingResponseDto>>('/admin/pickups/verify-booking', {
      method: 'POST',
      body: JSON.stringify(bookingId),
    });
  },

  async printReceipt(bookingId: string): Promise<Blob> {
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
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/pickups/receipt/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    
    if (!response.ok) {
      throw new Error('Failed to print receipt');
    }
    return response.blob();
  },

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