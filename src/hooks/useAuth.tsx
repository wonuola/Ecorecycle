// ============================================================================
// AUTHENTICATION HOOK & CONTEXT
// ============================================================================

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole, LoginCredentials } from '@/types';
import { db } from '@/services/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

type Permission = 
  | 'view_dashboard'
  | 'view_vendors'
  | 'create_vendor'
  | 'edit_vendor'
  | 'view_lots'
  | 'create_lot'
  | 'edit_lot'
  | 'view_batches'
  | 'create_batch'
  | 'edit_batch'
  | 'view_sorting'
  | 'create_sorting'
  | 'view_workers'
  | 'create_worker'
  | 'view_wages'
  | 'create_wage'
  | 'view_expenses'
  | 'create_expense'
  | 'view_dispatches'
  | 'create_dispatch'
  | 'edit_dispatch'
  | 'view_trips'
  | 'create_trip'
  | 'view_handling'
  | 'create_handling'
  | 'view_reports'
  | 'view_audit_logs'
  | 'manage_users'
  | 'approve_edits'
  | 'view_tickets'
  | 'create_ticket'
  | 'manage_tickets';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard', 'view_vendors', 'create_vendor', 'edit_vendor',
    'view_lots', 'create_lot', 'edit_lot',
    'view_batches', 'create_batch', 'edit_batch',
    'view_sorting', 'create_sorting',
    'view_workers', 'create_worker',
    'view_wages', 'create_wage',
    'view_expenses', 'create_expense',
    'view_dispatches', 'create_dispatch', 'edit_dispatch',
    'view_trips', 'create_trip',
    'view_handling', 'create_handling',
    'view_reports', 'view_audit_logs', 'manage_users', 'approve_edits',
    'view_tickets', 'create_ticket', 'manage_tickets'
  ],
  owner: [
    'view_dashboard', 'view_vendors', 'create_vendor', 'edit_vendor',
    'view_lots', 'create_lot', 'edit_lot',
    'view_batches', 'create_batch', 'edit_batch',
    'view_sorting', 'create_sorting',
    'view_workers', 'create_worker',
    'view_wages', 'create_wage',
    'view_expenses', 'create_expense',
    'view_dispatches', 'create_dispatch', 'edit_dispatch',
    'view_trips', 'create_trip',
    'view_handling', 'create_handling',
    'view_reports', 'view_audit_logs', 'manage_users', 'approve_edits',
    'view_tickets', 'create_ticket', 'manage_tickets'
  ],
  procurement: [
    'view_dashboard', 'view_vendors', 'create_vendor', 'edit_vendor',
    'view_lots', 'create_lot',
    'view_batches',
    'view_trips', 'create_trip',
    'view_handling', 'create_handling',
    'view_tickets', 'create_ticket'
  ],
  warehouse_officer: [
    'view_dashboard',
    'view_lots',
    'view_batches', 'create_batch', 'edit_batch',
    'view_handling', 'create_handling',
    'view_tickets', 'create_ticket'
  ],
  sorting_supervisor: [
    'view_dashboard',
    'view_batches',
    'view_sorting', 'create_sorting',
    'view_workers',
    'view_wages', 'create_wage',
    'view_tickets', 'create_ticket'
  ],
  production_supervisor: [
    'view_dashboard',
    'view_batches', 'edit_batch',
    'view_sorting',
    'view_expenses', 'create_expense',
    'view_tickets', 'create_ticket', 'manage_tickets'
  ],
  logistics_officer: [
    'view_dashboard',
    'view_trips', 'create_trip',
    'view_handling', 'create_handling',
    'view_dispatches', 'create_dispatch',
    'view_tickets', 'create_ticket'
  ],
  finance: [
    'view_dashboard',
    'view_lots', 'edit_lot',
    'view_expenses', 'create_expense',
    'view_dispatches', 'edit_dispatch',
    'view_wages',
    'view_reports',
    'view_tickets'
  ],
  auditor: [
    'view_dashboard',
    'view_vendors', 'view_lots', 'view_batches',
    'view_sorting', 'view_workers', 'view_wages',
    'view_expenses', 'view_dispatches', 'view_trips',
    'view_handling', 'view_reports', 'view_audit_logs',
    'view_tickets'
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await db.login(credentials);
      if (user) {
        setUser(user);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    db.logout();
    setUser(null);
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
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
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth(roles?: UserRole[]) {
  const { user, isAuthenticated, hasRole } = useAuth();
  
  const hasAccess = isAuthenticated && (!roles || hasRole(roles));
  
  return {
    user,
    isAuthenticated,
    hasAccess,
  };
}
