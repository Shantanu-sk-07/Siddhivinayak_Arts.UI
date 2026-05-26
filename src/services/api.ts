const API_BASE_URL = 'http://localhost:8080/api';

const getToken = () => {
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
};

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response.json();
};