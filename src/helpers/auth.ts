export const getToken = (): string | null => {
  return localStorage.getItem('auth-token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth-token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('userId');
};

export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('auth-token');
};