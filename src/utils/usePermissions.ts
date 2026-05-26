// src/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { rolePermissions, Permission } from '@/utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo((): Permission => {
    if (!user) {
      return {
        canViewDashboard: false,
        canManageGanpati: false,
        canManageBookings: false,
        canVerifyPayments: false,
        canManageStaff: false,
        canScanQR: false,
        canCompletePickup: false,
        canViewReports: false,
        canMakeBooking: false,
        canViewOwnBookings: false,
        canMakePayment: false,
        canDownloadReceipt: false,
      };
    }
    return rolePermissions[user.role];
  }, [user]);

  const hasPermission = useMemo(() => {
    return (permissionKey: keyof Permission): boolean => {
      return permissions[permissionKey];
    };
  }, [permissions]);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isStaff = user?.role === 'STAFF';
  const isCustomer = user?.role === 'CUSTOMER';

  return {
    permissions,
    hasPermission,
    isAdmin,
    isStaff,
    isCustomer,
    userRole: user?.role,
  };
};