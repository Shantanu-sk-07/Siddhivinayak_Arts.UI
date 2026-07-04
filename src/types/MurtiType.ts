// src/types/MurtiType.ts
export type UserRole = 'SUPER_ADMIN';

export type RegistrationType = 'HOME' | 'MANDAL';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  isPromoted?: boolean;
  registrationType?: RegistrationType;
  mandalName?: string;
  address?: string;
  taluka?: string;
  district?: string;
  state?: string;
  city?: string;
  contactPersons?: ContactPerson[];
  ganpatiId?: string;
  ganpatiName?: string;
  ganpatiHeight?: string;
  ganpatiPrice?: number;
  ganpatiImage?: string;
  alternatePhone?: string;
  adhyakshyaName?: string;
  adhyakshyaPhone?: string;
}

export interface ContactPerson {
  name: string;
  phone: string;
  designation: string;
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
  totalSlots: number;
  availableSlots: number;
  rating: number;
  achievements: string[];
  isActive: boolean;
  createdAt: string;
  likes: number;
  likedBy: string[];
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
  likes: number;
  likedBy: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token: string;
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

export interface BookingContact {
  name: string;
  phone: string;
  designation: string;
}

export interface PaymentRecord {
  amount: number;
  paymentDate: string;
  paymentType: string;
  notes: string;
  remainingAfterPayment: number;
}

export interface ConfirmedBooking {
  id: string;
  customerId?: string;
  customer?: User;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerVillage?: string;
  customerTaluka?: string;
  customerDistrict?: string;
  mandalName?: string;
  additionalContacts?: BookingContact[];
  ganpati?: GanpatiResponseDto;
  ganpatiId?: string;
  advancePayment: number;
  remainingPayment: number;
  totalPrice: number;
  totalPaidSoFar?: number;
  paymentHistory?: PaymentRecord[];
  bookingDate?: string;
  actualPickupDate?: string;
  notes?: string;
  status: string;
  receiptNumber?: string;
  receiptSent?: boolean;
  receiptSentAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  alternatePhone?: string;
  phone: string;
  registrationType: RegistrationType;
  mandalName?: string;
  address?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  city?: string;
  ganpatiId?: string;
  contactPersons?: ContactPerson[];
  adhyakshyaName?: string;
  adhyakshyaPhone?: string;
  contactPerson1Phone?: string;
  contactPerson2Phone?: string;
}

export interface InstallmentDto {
  id: number;
  remainingAmount: number;
  paidAmount: number;
  newRemaining: number;
  date: string;
  isFinal: boolean;
}

export interface ConfirmedBookingRequest {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerVillage?: string;
  customerTaluka?: string;
  customerDistrict?: string;
  mandalName?: string;
  additionalContacts?: BookingContact[];
  ganpatiId: string;
  advancePayment: number;
  remainingPayment: number;
  totalPrice: number;
  bookingDate?: string;
  notes?: string;
  status?: string;
  createNewCustomer?: boolean;
  customerRegistrationType?: RegistrationType;
  customerContactPersons?: ContactPerson[];
  installments?: InstallmentDto[];
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerVillage?: string;
  customerTaluka?: string;
  customerDistrict?: string;
  mandalName?: string;
  ganpatiName: string;
  ganpatiHeight: string;
  ganpatiPrice: number;
  advancePayment: number;
  remainingPayment: number;
  totalPrice: number;
  totalPaidSoFar?: number;
  bookingDate: string;
  status: string;
  contactNumbers: string[];
  paymentHistory?: Array<{
    amount: number;
    date: string;
    type: string;
    notes: string;
    remainingAfter: number;
  }>;
}

export interface EnquiryFormData {
  name: string;
  phone: string;
  alternatePhone?: string;
  state: string;
  district: string;
  taluka: string;
  city?: string;
  address: string;
  registrationType: RegistrationType;
  mandalName?: string;
  adhyakshyaName?: string;
  adhyakshyaPhone?: string;
  contactPerson1Phone?: string;
  contactPerson2Phone?: string;
  ganpatiId?: string;
}

export interface EnquiryResponse {
  customerId: string;
  message: string;
}

// ==================== Booking Management Types ====================
export interface BookingFormData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerTaluka: string;
  customerDistrict: string;
  mandalName: string;
  ganpatiId: string;
  advancePayment: number;
  remainingPayment: number;
  totalPrice: number;
  bookingDate: string;
  notes: string;
  status: string;
  registrationType: string;
  contactPerson1Name: string;
  contactPerson1Phone: string;
  contactPerson1Designation: string;
  contactPerson2Name: string;
  contactPerson2Phone: string;
  contactPerson2Designation: string;
}

export interface BookingRecord extends Record<string, unknown> {
  id: string;
  customerName?: string;
  customer?: { name: string; registrationType?: string };
  ganpati?: { name: string; images?: string[] };
  totalPrice?: number;
  advancePayment?: number;
  remainingPayment?: number;
  status: string;
  registrationType?: string;
}

export interface ViewBookingData {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerTaluka: string;
  customerDistrict: string;
  mandalName: string;
  ganpatiName: string;
  ganpatiHeight: string;
  ganpatiPrice: number;
  ganpatiImages: string[];
  advancePayment: number;
  remainingPayment: number;
  totalPrice: number;
  totalPaidSoFar: number;
  bookingDate: string;
  actualPickupDate: string;
  notes: string;
  status: string;
  createdAt: string;
  contactPersons: Array<{ name: string; phone: string; designation: string }>;
  paymentHistory: Array<{ amount: number; date: string; type: string; notes: string; remainingAfter: number }>;
}

export interface InstallmentData {
  id: number;
  remainingAmount: number;
  paidAmount: number;
  newRemaining: number;
  date: string;
  isFinal: boolean;
}

// ==================== Customer Management Types ====================
export interface CustomerRecord extends Record<string, unknown> {
  id: string;
  name: string;
  phone: string;
  registrationType?: string;
  mandalName?: string;
  isPromoted?: boolean;
  createdAt: string;
  ganpatiName?: string;
  ganpatiImage?: string;
}

export interface ViewCustomerData {
  id: string;
  name: string;
  phone: string;
  alternatePhone: string;
  registrationType: string;
  mandalName: string;
  address: string;
  city: string;
  taluka: string;
  district: string;
  state: string;
  isPromoted: boolean;
  createdAt: string;
  ganpatiName: string;
  ganpatiImage: string;
  contactPersons: Array<{ name: string; phone: string; designation: string }>;
}

export interface PromoteFormData {
  ganpatiId: string;
  totalPrice: number;
  advancePayment: number;
  remainingPayment: number;
  bookingDate: string;
  notes: string;
}

export interface ShareCollectionResponse {
  id: string;
  token: string;
  shareUrl: string;
  createdBy: string;
  createdDate: string;
  expiryDate: string | null;
  isActive: boolean;
  ganpatiIds: string[];
  customerIds: string[];
}

export interface ReceiptResponse {
  id: string;
  token: string;
  receiptUrl: string;
  bookingId: string;
  pdfPath: string;
  createdDate: string;
  isActive: boolean;
}


// ==================== Ganpati Management Types ====================
export interface GanpatiRecord extends Record<string, unknown> {
  id: string;
  name: string;
  height: string;
  price: number;
  availableSlots: number;
  isActive: boolean;
  images: string[];
}

// Height, Material, Color options
export interface DropdownOption {
  value: string;
  label: string;
}

export const heightOptions: DropdownOption[] = [
  { value: '2ft', label: '2 Feet' },
  { value: '3ft', label: '3 Feet' },
  { value: '4ft', label: '4 Feet' },
  { value: '5ft', label: '5 Feet' },
  { value: '6ft', label: '6 Feet' },
  { value: '7ft', label: '7 Feet' },
];

export const materialOptions: DropdownOption[] = [
  { value: 'Eco Friendly', label: 'Eco Friendly' },
  { value: 'Clay', label: 'Clay' },
  { value: 'Plaster of Paris', label: 'Plaster of Paris' },
];

export const colorOptions: DropdownOption[] = [
  { value: 'Traditional', label: 'Traditional' },
  { value: 'Modern', label: 'Modern' },
  { value: 'Royal', label: 'Royal' },
  { value: 'Premium', label: 'Premium' },
];
export interface GanpatiRecord extends Record<string, unknown> {
  id: string;
  name: string;
  height: string;
  price: number;
  availableSlots: number;
  isActive: boolean;
  images: string[];
}

// ==================== Dashboard Types ====================
export interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export interface DashboardStats {
  totalCustomers: number;
  mandalCustomers: number;
  totalGanpati: number;
  totalBookings: number;
  newThisMonth: number;
}