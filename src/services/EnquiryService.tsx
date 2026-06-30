// src/services/EnquiryService.ts
import { apiClient } from './api';
import { ApiResponse, EnquiryFormData } from '@/types/MurtiType';

export const enquiryService = {
  async submitEnquiry(data: EnquiryFormData & { ganpatiId: string }): Promise<ApiResponse<{ customerId: string; message: string }>> {
    const payload = {
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone || '',
      city: data.city || '',
      taluka: data.taluka || '',
      district: data.district || '',
      address: data.address || '',
      state: data.state || 'Maharashtra',
      ganpatiId: data.ganpatiId || '',
      registrationType: data.registrationType || 'HOME',
      mandalName: data.mandalName || '',
      adhyakshyaName: data.adhyakshyaName || '',
      adhyakshyaPhone: data.adhyakshyaPhone || '',
      contactPerson1Phone: data.contactPerson1Phone || '',
      contactPerson2Phone: data.contactPerson2Phone || '',
      message: ''
    };

    try {
      const response = await apiClient<ApiResponse<{ customerId: string; message: string }>>('/customers/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true
      });
      return response;
    } catch (error) {
      console.error('Enquiry submission error:', error);
      return {
        success: false,
        data: {
          customerId: '',
          message: 'Failed to submit enquiry'
        },
        message: error instanceof Error ? error.message : 'Failed to submit enquiry'
      };
    }
  },

  async createCustomer(data: EnquiryFormData & { ganpatiId: string }): Promise<ApiResponse<{ customerId: string; message: string }>> {
    const payload = {
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone || '',
      city: data.city || '',
      taluka: data.taluka || '',
      district: data.district || '',
      address: data.address || '',
      state: data.state || 'Maharashtra',
      ganpatiId: data.ganpatiId || '',
      registrationType: data.registrationType || 'HOME',
      mandalName: data.mandalName || '',
      adhyakshyaName: data.adhyakshyaName || '',
      adhyakshyaPhone: data.adhyakshyaPhone || '',
      contactPerson1Phone: data.contactPerson1Phone || '',
      contactPerson2Phone: data.contactPerson2Phone || '',
      message: ''
    };

    try {
      const response = await apiClient<ApiResponse<{ customerId: string; message: string }>>('/admin/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Create customer error:', error);
      return {
        success: false,
        data: {
          customerId: '',
          message: 'Failed to create customer'
        },
        message: error instanceof Error ? error.message : 'Failed to create customer'
      };
    }
  },

  async updateCustomer(id: string, data: EnquiryFormData & { ganpatiId: string }): Promise<ApiResponse<{ customerId: string; message: string }>> {
    const payload = {
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone || '',
      city: data.city || '',
      taluka: data.taluka || '',
      district: data.district || '',
      address: data.address || '',
      state: data.state || 'Maharashtra',
      ganpatiId: data.ganpatiId || '',
      registrationType: data.registrationType || 'HOME',
      mandalName: data.mandalName || '',
      adhyakshyaName: data.adhyakshyaName || '',
      adhyakshyaPhone: data.adhyakshyaPhone || '',
      contactPerson1Phone: data.contactPerson1Phone || '',
      contactPerson2Phone: data.contactPerson2Phone || '',
    };

    try {
      const response = await apiClient<ApiResponse<{ customerId: string; message: string }>>(`/admin/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.error('Customer update error:', error);
      return {
        success: false,
        data: {
          customerId: '',
          message: 'Failed to update customer'
        },
        message: error instanceof Error ? error.message : 'Failed to update customer'
      };
    }
  }
};