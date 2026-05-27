export type UserRole = 'CUSTOMER' | 'SUPER_ADMIN';  // STAFF removed

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
}

export interface PickupStats {
  todayPickups: number;
  completedToday: number;
  pendingToday: number;
  totalPickups: number;
}

export interface CustomerResponseDto {
  totalBookings: number;
  totalSpent: number;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
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

export interface GanpatiResponseDto {
  id: string;
  name: string;
  height: string;
  price: number;
  material: string;
  colorTheme: string;
  description: string;
  images: string[];
  totalSlots: number;
  availableSlots: number;
  rating: number;
  achievements: string[];
  isActive: boolean;
  createdAt: string;
  confirmedBookings?: number; 
}

export interface BookingResponseDto {
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
  status: string;
  qrCode: string;
  bookingDate: string;
  pickupDate?: string;
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

export interface PaymentResponseDto {
  id: string;
  bookingId: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  screenshot?: string;
  createdAt: string;
}

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

export interface StaffResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedCounter?: string;
  isActive: boolean;
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

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  assignedCounter?: string;
  isActive: boolean;
  password?: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token: string;
}

export interface RegisterResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
}

export interface GanpatiFormData {
  name: string;
  height: string;
  price: number;
  material: string;
  colorTheme: string;
  description: string;
  totalSlots: number;
  images: (File | string)[];
  achievements: string[];
  isActive: boolean;
}

export interface BookingRequestDto {
  ganpatiId: string;
  advancePaid?: number;
}

export interface BookingUpdateRequestDto {
  status: string;
  advancePaid?: number;
}

export interface PaymentRequestDto {
  bookingId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

export interface PaymentUpdateRequestDto {
  status: 'VERIFIED' | 'REJECTED';
}

export interface CustomerUpdateRequestDto {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface PickupStats {
  todayPickups: number;
  completedToday: number;
  pendingToday: number;
  totalPickups: number;
}

export interface QRCodeData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  ganpatiName: string;
  totalAmount: number;
  advancePaid: number;
  remainingAmount: number;
  status: string;
  bookingDate: string;
  timestamp: string;
}

export interface InterestedCheckResponse {
  isInterested: boolean;
}

export interface ExistingBookingResponse {
  success: boolean;
  booking: BookingResponseDto | null;
}

export interface CustomerSummary {
  activeBookings: number;
  completedBookings: number;
  totalPaid: number;
  pendingAmount: number;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ReportData {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  completedPickups: number;
  revenueTrend: number;
  bookingTrend: number;
  monthlyData: Array<{ month: string; revenue: number; bookings: number }>;
  topGanpati: Array<{ name: string; bookings: number; revenue: number }>;
  paymentMethodBreakdown: Array<{ name: string; value: number }>;
}