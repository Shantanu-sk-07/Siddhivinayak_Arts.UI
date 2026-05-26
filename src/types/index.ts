export type UserRole = 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
}

export interface Ganpati {
  id: string;
  name: string;
  height: string;
  price: number;
  material: string;
  colorTheme: string;
  description: string;
  images: string[];
  availableSlots: number;
  totalSlots: number;
  rating: number;
  achievements: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingId: string;
  ganpatiId: string;
  ganpatiName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  advancePaid: number;
  remainingAmount: number;
  status: BookingStatus;
  qrCode: string;
  bookingDate: string;
  pickupDate?: string;
  createdAt: string;
}

export type BookingStatus = 
  | 'PENDING_REQUEST'
  | 'APPROVED'
  | 'CONFIRMED'
  | 'PICKUP_COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentType: 'ADVANCE' | 'INSTALLMENT' | 'FINAL';
  paymentMethod: 'ONLINE' | 'OFFLINE_CASH' | 'OFFLINE_UPI';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  transactionId?: string;
  screenshot?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'STAFF';
  assignedCounter?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalGanpati: number;
  pendingRequests: number;
  totalRevenue: number;
  pendingPayments: number;
  interestedUsers: number;
  festivalAnalytics: FestivalAnalytics;
}

export interface FestivalAnalytics {
  totalBookings: number;
  completedPickups: number;
  occupancyRate: number;
  peakHours: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}