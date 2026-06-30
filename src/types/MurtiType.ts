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