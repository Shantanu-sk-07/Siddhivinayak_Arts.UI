// src/helpers/usePermissions.tsx
import { useMemo } from 'react';
import { isLoggedIn } from '@/helpers/auth';
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

const rolePermissions: Record<UserRole, Permission> = {
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

const noPermissions: Permission = {
  canViewDashboard: false,
  canManageGanpati: false,
  canManageBookings: false,
  canManageCustomers: false,
  canViewReports: false,
  canDownloadReceipt: false,
  canSendReceipt: false,
};

export const usePermissions = () => {
  // Since only SUPER_ADMIN can log in, if a token exists = SUPER_ADMIN
  const loggedIn = isLoggedIn();

  const permissions = useMemo((): Permission => {
    if (!loggedIn) return noPermissions;
    return rolePermissions['SUPER_ADMIN'];
  }, [loggedIn]);

  const hasPermission = useMemo(() => {
    return (permissionKey: keyof Permission): boolean => {
      return permissions[permissionKey];
    };
  }, [permissions]);

  const isAdmin = loggedIn;

  return {
    permissions,
    hasPermission,
    isAdmin,
    userRole: loggedIn ? 'SUPER_ADMIN' as UserRole : undefined,
  };
};