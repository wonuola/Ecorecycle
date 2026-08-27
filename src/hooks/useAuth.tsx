// ============================================================================
// AUTHENTICATION HOOK — Restructured Permissions
// ============================================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db } from '@/services/database';
import type { User, UserRole, LoginCredentials, Permission } from '@/types';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard', 'view_vendors', 'create_vendor', 'edit_vendor',
    'view_supply_chain', 'create_lot', 'edit_lot',
    'view_operations', 'create_batch', 'edit_batch',
    'view_production', 'run_production',
    'view_finance', 'create_expense', 'create_dispatch',
    'view_tickets', 'create_ticket', 'manage_tickets',
    'view_reports', 'view_audit_logs', 'manage_users', 'approve_edits',
  ],
  owner: [
    'view_dashboard', 'view_vendors', 'create_vendor', 'edit_vendor',
    'view_supply_chain', 'create_lot', 'edit_lot',
    'view_operations', 'create_batch', 'edit_batch',
    'view_production', 'run_production',
    'view_finance', 'create_expense', 'create_dispatch',
    'view_tickets', 'create_ticket', 'manage_tickets',
    'view_reports', 'view_audit_logs', 'manage_users', 'approve_edits',
  ],
  procurement: [
    'view_dashboard', 'view_vendors', 'create_vendor',
    'view_supply_chain', 'create_lot',
    'view_operations', 'create_batch',
    'view_production',
    'view_finance', 'create_expense',
    'view_tickets', 'create_ticket',
    'view_reports',
  ],
  warehouse_officer: [
    'view_dashboard',
    'view_operations', 'create_batch', 'edit_batch',
    'view_production',
    'view_tickets', 'create_ticket',
  ],
  sorting_supervisor: [
    'view_dashboard',
    'view_operations',
    'view_production', 'run_production',
    'view_tickets', 'create_ticket',
  ],
  production_supervisor: [
    'view_dashboard',
    'view_operations',
    'view_production', 'run_production',
    'view_tickets', 'create_ticket',
  ],
  logistics_officer: [
    'view_dashboard',
    'view_supply_chain',
    'view_operations',
    'view_finance', 'create_expense',
    'view_tickets', 'create_ticket',
  ],
  finance: [
    'view_dashboard', 'view_vendors',
    'view_supply_chain',
    'view_operations',
    'view_production',
    'view_finance', 'create_expense', 'create_dispatch',
    'view_tickets',
    'view_reports', 'view_audit_logs',
  ],
  auditor: [
    'view_dashboard', 'view_vendors',
    'view_supply_chain',
    'view_operations',
    'view_production',
    'view_finance',
    'view_tickets',
    'view_reports', 'view_audit_logs',
  ],
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  canDelete: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  hasRole: () => false,
  hasPermission: () => false,
  canDelete: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ecorecycle_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem('ecorecycle_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    const result = await db.login(credentials);
    if (result) {
      setUser(result as User);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    db.logout();
    setUser(null);
    localStorage.removeItem('ecorecycle_user');
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  }, [user]);

  const canDelete = useCallback((): boolean => {
    return user?.role === 'owner';
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole,
      hasPermission,
      canDelete,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
