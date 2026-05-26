// src/routes/urlpath.ts
export const UrlPath = {
  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Website Routes
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Customer Routes
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_GANPATI: '/customer/ganpati',
  CUSTOMER_GANPATI_DETAILS: '/customer/ganpati/:id',
  CUSTOMER_BOOKINGS: '/customer/bookings',
  CUSTOMER_PAYMENTS: '/customer/payments',
  CUSTOMER_QR: '/customer/qr/:bookingId',
  
  // Staff Routes
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_SCAN: '/staff/scan',
  STAFF_PICKUP: '/staff/pickup',
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_GANPATI: '/admin/ganpati',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_STAFF: '/admin/staff',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_REPORTS: '/admin/reports',
  
  // Common Routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
} as const;

export type UrlPathKeys = keyof typeof UrlPath;