import { getToken, clearToken } from '@/helpers/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiClient = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      clearToken();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      const data = await response.json();
      throw new Error(data.message || 'Access denied. You do not have permission.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

export const apiFormData = async <T = unknown>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      method,
      headers,
      body: formData,
    });

    if (response.status === 401) {
      clearToken();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      const data = await response.json();
      throw new Error(data.message || 'Access denied. You do not have permission.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};