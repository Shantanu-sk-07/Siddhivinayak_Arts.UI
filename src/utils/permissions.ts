// src/constants/permissions.ts
import { UserRole } from '@/types';

export interface Permission {
  canViewDashboard: boolean;
  canManageGanpati: boolean;
  canManageBookings: boolean;
  canVerifyPayments: boolean;
  canManageStaff: boolean;
  canScanQR: boolean;
  canCompletePickup: boolean;
  canViewReports: boolean;
  canMakeBooking: boolean;
  canViewOwnBookings: boolean;
  canMakePayment: boolean;
  canDownloadReceipt: boolean;
}

export const rolePermissions: Record<UserRole, Permission> = {
  SUPER_ADMIN: {
    canViewDashboard: true,
    canManageGanpati: true,
    canManageBookings: true,
    canVerifyPayments: true,
    canManageStaff: true,
    canScanQR: true,
    canCompletePickup: true,
    canViewReports: true,
    canMakeBooking: true,
    canViewOwnBookings: true,
    canMakePayment: true,
    canDownloadReceipt: true,
  },
  STAFF: {
    canViewDashboard: true,
    canManageGanpati: false,
    canManageBookings: false,
    canVerifyPayments: true,
    canManageStaff: false,
    canScanQR: true,
    canCompletePickup: true,
    canViewReports: false,
    canMakeBooking: false,
    canViewOwnBookings: false,
    canMakePayment: false,
    canDownloadReceipt: true,
  },
  CUSTOMER: {
    canViewDashboard: true,
    canManageGanpati: false,
    canManageBookings: false,
    canVerifyPayments: false,
    canManageStaff: false,
    canScanQR: false,
    canCompletePickup: false,
    canViewReports: false,
    canMakeBooking: true,
    canViewOwnBookings: true,
    canMakePayment: true,
    canDownloadReceipt: true,
  },
};