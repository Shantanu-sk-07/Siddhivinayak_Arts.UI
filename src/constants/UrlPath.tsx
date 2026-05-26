export const UrlPath = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const;

export type UrlPathKeys = keyof typeof UrlPath;