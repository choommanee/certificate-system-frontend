import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import SecurityUtils from '../utils/security';
import { User } from '../types/signer';

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  name: string;
  permissions: Permission[];
  hierarchy: number; // Higher number = more privileges
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;
  permissions: Permission[];
  role: Role | null;
  mfaRequired: boolean;
  mfaToken: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  hasPermission: (resource: string, action: string, conditions?: Record<string, any>) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  canAccess: (requiredPermissions: Permission[]) => boolean;
  verifyMFA: (code: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string; permissions: Permission[]; role: Role } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'REFRESH_FAILURE' }
  | { type: 'MFA_REQUIRED'; payload: string }
  | { type: 'MFA_SUCCESS' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  sessionExpiry: null,
  permissions: [],
  role: null,
  mfaRequired: false,
  mfaToken: null
};

// Role definitions
const ROLES: Record<string, Role> = {
  student: {
    name: 'student',
    hierarchy: 1,
    permissions: [
      { resource: 'certificates', action: 'view' },
      { resource: 'certificates', action: 'download' },
      { resource: 'profile', action: 'view' },
      { resource: 'profile', action: 'update' }
    ]
  },
  staff: {
    name: 'staff',
    hierarchy: 2,
    permissions: [
      { resource: 'certificates', action: 'view' },
      { resource: 'certificates', action: 'create' },
      { resource: 'certificates', action: 'update' },
      { resource: 'activities', action: 'view' },
      { resource: 'activities', action: 'create' },
      { resource: 'activities', action: 'update' },
      { resource: 'templates', action: 'view' },
      { resource: 'templates', action: 'create' },
      { resource: 'students', action: 'view' }
    ]
  },
  signer: {
    name: 'signer',
    hierarchy: 3,
    permissions: [
      { resource: 'documents', action: 'view' },
      { resource: 'documents', action: 'sign' },
      { resource: 'documents', action: 'reject' },
      { resource: 'signatures', action: 'view' },
      { resource: 'signatures', action: 'create' },
      { resource: 'signatures', action: 'update' },
      { resource: 'signatures', action: 'delete' },
      { resource: 'signing-history', action: 'view' },
      { resource: 'analytics', action: 'view' },
      { resource: 'notifications', action: 'view' },
      { resource: 'notifications', action: 'update' }
    ]
  },
  admin: {
    name: 'admin',
    hierarchy: 4,
    permissions: [
      { resource: '*', action: '*' } // Admin has all permissions
    ]
  }
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        permissions: action.payload.permissions,
        role: action.payload.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        mfaRequired: false,
        sessionExpiry: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };

    case 'REFRESH_START':
      return {
        ...state,
        isLoading: true
      };

    case 'REFRESH_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isLoading: false,
        sessionExpiry: Date.now() + (8 * 60 * 60 * 1000)
      };

    case 'REFRESH_FAILURE':
      return {
        ...initialState,
        isLoading: false
      };

    case 'MFA_REQUIRED':
      return {
        ...state,
        mfaRequired: true,
        mfaToken: action.payload,
        isLoading: false
      };

    case 'MFA_SUCCESS':
      return {
        ...state,
        mfaRequired: false,
        mfaToken: null
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = SecurityUtils.getSecureItem<string>('auth_token');
        const user = SecurityUtils.getSecureItem<User>('user_data');
        
        if (token && user && SecurityUtils.isSessionValid()) {
          const role = ROLES[user.role] || ROLES.student;
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user,
              token,
              refreshToken: SecurityUtils.getSecureItem<string>('refresh_token') || '',
              permissions: role.permissions,
              role
            }
          });
          
          SecurityUtils.logSecurityEvent('session_restored', { userId: user.id });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return;

    const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry
    const timeUntilRefresh = state.sessionExpiry - Date.now() - refreshBuffer;

    if (timeUntilRefresh > 0) {
      const timeout = setTimeout(() => {
        refreshAuth();
      }, timeUntilRefresh);

      return () => clearTimeout(timeout);
    }
  }, [state.sessionExpiry, state.isAuthenticated]);

  const login = useCallback(async (
    email: string, 
    password: string, 
    rememberMe = false
  ): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Rate limiting check
      if (!SecurityUtils.checkRateLimit(`login_${email}`, 5, 15)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Mock API call - replace with actual API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': SecurityUtils.generateCSRFToken()
        },
        body: JSON.stringify({ email, password, rememberMe })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Check if MFA is required
      if (data.mfaRequired) {
        dispatch({ type: 'MFA_REQUIRED', payload: data.mfaToken });
        return false;
      }

      const user: User = data.user;
      const role = ROLES[user.role] || ROLES.student;

      // Store secure session data
      const expirationMinutes = rememberMe ? 30 * 24 * 60 : 8 * 60; // 30 days or 8 hours
      SecurityUtils.setSecureItem('auth_token', data.token, expirationMinutes);
      SecurityUtils.setSecureItem('refresh_token', data.refreshToken, expirationMinutes);
      SecurityUtils.setSecureItem('user_data', user, expirationMinutes);
      SecurityUtils.initializeSecureSession();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: data.token,
          refreshToken: data.refreshToken,
          permissions: role.permissions,
          role
        }
      });

      SecurityUtils.logSecurityEvent('login_success', { 
        userId: user.id, 
        role: user.role,
        rememberMe 
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      
      SecurityUtils.logSecurityEvent('login_failure', { 
        email, 
        error: errorMessage 
      });
      
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    SecurityUtils.logSecurityEvent('logout', { userId: state.user?.id });
    
    // Clear all secure storage
    SecurityUtils.terminateSession();
    SecurityUtils.removeSecureItem('auth_token');
    SecurityUtils.removeSecureItem('refresh_token');
    SecurityUtils.removeSecureItem('user_data');
    
    dispatch({ type: 'LOGOUT' });
  }, [state.user?.id]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    if (!state.refreshToken) return false;

    dispatch({ type: 'REFRESH_START' });

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      SecurityUtils.setSecureItem('auth_token', data.token, 8 * 60);
      
      dispatch({
        type: 'REFRESH_SUCCESS',
        payload: {
          token: data.token,
          user: data.user || state.user!
        }
      });

      return true;
    } catch (error) {
      dispatch({ type: 'REFRESH_FAILURE' });
      SecurityUtils.logSecurityEvent('token_refresh_failed', { 
        userId: state.user?.id 
      });
      return false;
    }
  }, [state.refreshToken, state.user]);

  const verifyMFA = useCallback(async (code: string): Promise<boolean> => {
    if (!state.mfaToken) return false;

    try {
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.mfaToken}`
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('MFA verification failed');
      }

      const data = await response.json();
      const user: User = data.user;
      const role = ROLES[user.role] || ROLES.student;

      SecurityUtils.setSecureItem('auth_token', data.token, 8 * 60);
      SecurityUtils.setSecureItem('refresh_token', data.refreshToken, 8 * 60);
      SecurityUtils.setSecureItem('user_data', user, 8 * 60);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: data.token,
          refreshToken: data.refreshToken,
          permissions: role.permissions,
          role
        }
      });

      dispatch({ type: 'MFA_SUCCESS' });

      SecurityUtils.logSecurityEvent('mfa_success', { userId: user.id });
      return true;
    } catch (error) {
      SecurityUtils.logSecurityEvent('mfa_failure', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }, [state.mfaToken]);

  const hasPermission = useCallback((
    resource: string, 
    action: string, 
    conditions?: Record<string, any>
  ): boolean => {
    if (!state.isAuthenticated || !state.permissions) return false;

    // Admin has all permissions
    if (state.role?.name === 'admin') return true;

    return state.permissions.some(permission => {
      // Check wildcard permissions
      if (permission.resource === '*' && permission.action === '*') return true;
      if (permission.resource === resource && permission.action === '*') return true;
      if (permission.resource === '*' && permission.action === action) return true;
      
      // Check exact match
      if (permission.resource === resource && permission.action === action) {
        // Check conditions if provided
        if (conditions && permission.conditions) {
          return Object.entries(permission.conditions).every(([key, value]) => 
            conditions[key] === value
          );
        }
        return true;
      }
      
      return false;
    });
  }, [state.isAuthenticated, state.permissions, state.role]);

  const hasRole = useCallback((roleName: string): boolean => {
    return state.role?.name === roleName;
  }, [state.role]);

  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    return roleNames.includes(state.role?.name || '');
  }, [state.role]);

  const canAccess = useCallback((requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => 
      hasPermission(permission.resource, permission.action, permission.conditions)
    );
  }, [hasPermission]);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      SecurityUtils.setSecureItem('user_data', updatedUser, 8 * 60);
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      SecurityUtils.logSecurityEvent('profile_updated', { 
        userId: state.user.id,
        updatedFields: Object.keys(updates)
      });
      
      return true;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Profile update failed' 
      });
      return false;
    }
  }, [state.user, state.token]);

  const changePassword = useCallback(async (
    currentPassword: string, 
    newPassword: string
  ): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        throw new Error('Password change failed');
      }

      SecurityUtils.logSecurityEvent('password_changed', { 
        userId: state.user.id 
      });
      
      return true;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Password change failed' 
      });
      return false;
    }
  }, [state.user, state.token]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAuth,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    verifyMFA,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

// HOC for protecting routes with permissions
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[]
) => {
  return (props: P) => {
    const { canAccess, isAuthenticated, isLoading } = useEnhancedAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    if (!canAccess(requiredPermissions)) {
      return <div>You don't have permission to access this page.</div>;
    }

    return <Component {...props} />;
  };
};

// Hook for role-based rendering
export const useRoleAccess = () => {
  const { hasRole, hasAnyRole, hasPermission, canAccess } = useEnhancedAuth();

  return {
    hasRole,
    hasAnyRole,
    hasPermission,
    canAccess,
    isStudent: hasRole('student'),
    isStaff: hasRole('staff'),
    isSigner: hasRole('signer'),
    isAdmin: hasRole('admin')
  };
};

export default EnhancedAuthProvider;