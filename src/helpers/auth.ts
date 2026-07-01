// src/helpers/auth.ts
const TOKEN_KEY = 'auth_token';

export const API_BASE_URLS = {
  local: 'http://localhost:8080/api',
  production: 'https://siddhivinayak-arts-api.onrender.com/api'
};

export const FRONTEND_URLS = {
  local: 'http://localhost:2929',
  production: 'https://siddhivinayak-arts.onrender.com'
};

export const getApiBaseUrl = (): string => {
  // const env = import.meta.env.VITE_API_ENV || 'production';
   const env = import.meta.env.VITE_API_ENV || 'local';
  return env === 'local' ? API_BASE_URLS.local : API_BASE_URLS.production;
};

export const getFrontendUrl = (): string => {
  // const env = import.meta.env.VITE_API_ENV || 'production';
   const env = import.meta.env.VITE_API_ENV || 'local';
  return env === 'local' ? FRONTEND_URLS.local : FRONTEND_URLS.production;
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token && token.length > 0;
};

export const isLoggedIn = (): boolean => {
  return isAuthenticated();
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getCorsHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

export const getFullHeaders = (): Record<string, string> => ({
  ...getCorsHeaders(),
  ...getAuthHeaders(),
});

export const getPublicEndpoints = (): string[] => [
  '/auth/login',
  '/ganpati/all',
  '/ganpati/featured',
  '/ganpati/',
  '/customers/register'
];

export const isPublicEndpoint = (endpoint: string): boolean => {
  return getPublicEndpoints().some(publicEndpoint => 
    endpoint.startsWith(publicEndpoint)
  );
};

export const getUserRole = (): string | null => {
  return localStorage.getItem('userRole') || null;
};

export const getUserId = (): string | null => {
  return localStorage.getItem('userId') || null;
};

export const getUserName = (): string | null => {
  return localStorage.getItem('userName') || null;
};

export const setUserData = (userId: string, userName: string, role?: string): void => {
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', userName);
  if (role) {
    localStorage.setItem('userRole', role);
  }
};

export const clearUserData = (): void => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
};

export const logout = (): void => {
  clearToken();
  clearUserData();
};