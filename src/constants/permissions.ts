import { UserRole } from '@/types/MurtiType';

export interface Permission {
  canViewDashboard: boolean;
  canManageGanpati: boolean;
  canManageBookings: boolean;
  canManageCustomers: boolean;
  canViewReports: boolean;
  canDownloadReceipt: boolean;
  canSendReceipt: boolean;
}

export const rolePermissions: Record<UserRole, Permission> = {
  SUPER_ADMIN: {
    canViewDashboard: true,
    canManageGanpati: true,
    canManageBookings: true,
    canManageCustomers: true,
    canViewReports: true,
    canDownloadReceipt: true,
    canSendReceipt: true,
  },
};