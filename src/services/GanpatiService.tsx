import { apiClient } from './api';

export const ganpatiService = {
  async getAll() {
    return apiClient('/ganpati/all');
  },
  
  async getFeatured() {
    return apiClient('/ganpati/featured');
  },
  
  async getById(id: string) {
    return apiClient(`/ganpati/${id}`);
  },
  
  async create(data: FormData) {
    const token = getToken();
    const response = await fetch('http://localhost:8080/api/admin/ganpati', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });
    return response.json();
  },
  
  async update(id: string, data: FormData) {
    const token = getToken();
    const response = await fetch(`http://localhost:8080/api/admin/ganpati/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });
    return response.json();
  },
  
  async delete(id: string) {
    return apiClient(`/admin/ganpati/${id}`, { method: 'DELETE' });
  },
};

function getToken() {
  const auth = localStorage.getItem('auth-storage');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed.state.token;
    } catch {
      return null;
    }
  }
  return null;
}