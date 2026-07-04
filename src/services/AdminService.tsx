import { getToken } from '@/helpers/auth';
import { apiClient, apiFormData } from './api';
import { 
  GanpatiResponseDto, 
  ApiResponse, 
  User, 
  ConfirmedBooking, 
  ConfirmedBookingRequest,
  CustomerFormData,
  RegistrationType,
  ShareCollectionResponse,
  ReceiptResponse
} from '@/types/MurtiType';

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

  async getAllCustomers(): Promise<ApiResponse<User[]>> {
    return apiClient<ApiResponse<User[]>>('/admin/customers');
  },

  async getCustomersByType(type: RegistrationType): Promise<ApiResponse<User[]>> {
    return apiClient<ApiResponse<User[]>>(`/admin/customers/type/${type}`);
  },

  async getCustomerById(id: string): Promise<ApiResponse<User>> {
    return apiClient<ApiResponse<User>>(`/admin/customers/${id}`);
  },

  async createCustomer(data: CustomerFormData): Promise<ApiResponse<User>> {
    const payload = {
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone || '',
      registrationType: data.registrationType,
      mandalName: data.mandalName || '',
      address: data.address || '',
      taluka: data.taluka || '',
      district: data.district || '',
      state: data.state || 'Maharashtra',
      city: data.city || '',
      ganpatiId: data.ganpatiId || '',
      contactPersons: data.contactPersons || [],
      adhyakshyaName: data.adhyakshyaName || '',
      adhyakshyaPhone: data.adhyakshyaPhone || '',
      contactPerson1Phone: data.contactPerson1Phone || '',
      contactPerson2Phone: data.contactPerson2Phone || '',
    };

    return apiClient<ApiResponse<User>>('/admin/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<ApiResponse<User>> {
    const payload = {
      name: data.name || '',
      phone: data.phone || '',
      alternatePhone: data.alternatePhone || '',
      registrationType: data.registrationType,
      mandalName: data.mandalName || '',
      address: data.address || '',
      taluka: data.taluka || '',
      district: data.district || '',
      state: data.state || 'Maharashtra',
      city: data.city || '',
      ganpatiId: data.ganpatiId || '',
      contactPersons: data.contactPersons || [],
      adhyakshyaName: data.adhyakshyaName || '',
      adhyakshyaPhone: data.adhyakshyaPhone || '',
      contactPerson1Phone: data.contactPerson1Phone || '',
      contactPerson2Phone: data.contactPerson2Phone || '',
    };

    return apiClient<ApiResponse<User>>(`/admin/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>(`/admin/customers/${id}`, {
      method: 'DELETE',
    });
  },

  async getAllBookings(): Promise<ApiResponse<ConfirmedBooking[]>> {
    return apiClient<ApiResponse<ConfirmedBooking[]>>('/admin/bookings');
  },

  async getBookingsByCustomer(customerId: string): Promise<ApiResponse<ConfirmedBooking[]>> {
    return apiClient<ApiResponse<ConfirmedBooking[]>>(`/admin/bookings/customer/${customerId}`);
  },

  async getBookingById(id: string): Promise<ApiResponse<ConfirmedBooking>> {
    return apiClient<ApiResponse<ConfirmedBooking>>(`/admin/bookings/${id}`);
  },

  async createBooking(data: ConfirmedBookingRequest): Promise<ApiResponse<ConfirmedBooking>> {
    const payload = {
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || '',
      customerAddress: data.customerAddress || '',
      customerTaluka: data.customerTaluka || '',
      customerDistrict: data.customerDistrict || '',
      mandalName: data.mandalName || '',
      additionalContacts: data.additionalContacts || [],
      ganpatiId: data.ganpatiId,
      advancePayment: data.advancePayment,
      remainingPayment: data.remainingPayment,
      totalPrice: data.totalPrice,
      bookingDate: data.bookingDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      status: data.status || 'CONFIRMED',
      createNewCustomer: data.createNewCustomer || false,
      customerRegistrationType: data.customerRegistrationType || 'HOME',
      customerContactPersons: data.customerContactPersons || [],
      installments: data.installments || []
    };

    return apiClient<ApiResponse<ConfirmedBooking>>('/admin/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async promoteCustomer(id: string): Promise<ApiResponse<User>> {
    return apiClient<ApiResponse<User>>(`/admin/customers/${id}/promote`, {
      method: 'POST',
    });
  },

  async unpromoteCustomer(id: string): Promise<ApiResponse<User>> {
    return apiClient<ApiResponse<User>>(`/admin/customers/${id}/unpromote`, {
      method: 'POST',
    });
  },

  async updateBooking(id: string, data: ConfirmedBookingRequest): Promise<ApiResponse<ConfirmedBooking>> {
    const payload = {
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || '',
      customerAddress: data.customerAddress || '',
      customerTaluka: data.customerTaluka || '',
      customerDistrict: data.customerDistrict || '',
      mandalName: data.mandalName || '',
      additionalContacts: data.additionalContacts || [],
      ganpatiId: data.ganpatiId,
      advancePayment: data.advancePayment,
      remainingPayment: data.remainingPayment,
      totalPrice: data.totalPrice,
      bookingDate: data.bookingDate || '',
      notes: data.notes || '',
      status: data.status || 'CONFIRMED',
      createNewCustomer: false,
      customerRegistrationType: data.customerRegistrationType || 'HOME',
      customerContactPersons: data.customerContactPersons || [],
      installments: data.installments || []
    };

    return apiClient<ApiResponse<ConfirmedBooking>>(`/admin/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteBooking(id: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>(`/admin/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  async sendReceiptToWhatsApp(id: string): Promise<ApiResponse<string>> {
    return apiClient<ApiResponse<string>>(`/admin/bookings/${id}/send-receipt`, {
      method: 'POST',
    });
  },

  async createShareCollection(data: { customerIds: string[], ganpatiIds: string[], expiryDays?: number }): Promise<ApiResponse<ShareCollectionResponse>> {
    const adminId = localStorage.getItem('userId') || '';
    return apiClient<ApiResponse<ShareCollectionResponse>>(`/share/collection?adminId=${adminId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // FIXED: correct backend path is /api/receipt/generate/{bookingId} (see ReceiptController.java)
  async generateReceipt(bookingId: string): Promise<ApiResponse<ReceiptResponse>> {
    return apiClient<ApiResponse<ReceiptResponse>>(`/receipt/generate/${bookingId}`, {
      method: 'POST',
    });
  },

  // FIXED: public endpoint, no auth needed, matches ReceiptController's GET /{token}
  async getReceiptByToken(token: string): Promise<ApiResponse<ReceiptResponse>> {
    return apiClient<ApiResponse<ReceiptResponse>>(`/receipt/${token}`, {
      method: 'GET',
      skipAuth: true,
    });
  },

  async sendReceiptsBatch(bookingIds: string[]): Promise<ApiResponse<Array<{
    bookingId: string;
    status: 'sent' | 'failed';
    message: string;
    phoneNumbers?: string[];
    receiptNumber?: string;
  }>>> {
    return apiClient<ApiResponse<Array<{
      bookingId: string;
      status: 'sent' | 'failed';
      message: string;
      phoneNumbers?: string[];
      receiptNumber?: string;
    }>>>('/admin/bookings/send-receipts-batch', {
      method: 'POST',
      body: JSON.stringify(bookingIds),
    });
  },

  async downloadReceiptPDF(id: string): Promise<Blob> {
    const token = getToken();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/download-pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    return response.blob();
  },
};