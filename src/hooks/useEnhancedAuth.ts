import { useState, useEffect, useCallback } from 'react';
import EnhancedAuthManager, { AuthSession, LoginAttempt } from '../utils/enhancedAuth';
import SecurityUtils from '../utils/security';
import { User } from '../types/signer';

export interface UseEnhancedAuthReturn {
  // Session state
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  
  // Authentication methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{
    success: boolean;
    requiresMFA?: boolean;
    error?: string;
    lockoutTime?: number;
  }>;
  logout: () => void;
  verifyMFA: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  
  // Session management
  refreshSession: () => void;
  updateActivity: () => void;
  getSessionInfo: () => AuthSession | null;
  
  // Security features
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  enableMFA: () => Promise<{ secret: string; qrCode: string; backupCodes: string[] }>;
  disableMFA: (password: string) => Promise<boolean>;
  
  // Risk assessment
  getLoginRisk: (email: string) => { risk: 'low' | 'medium' | 'high'; factors: string[] };
  getSecurityHealth: () => { score: number; issues: string[]; recommendations: string[] };
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useEnhancedAuth = (): UseEnhancedAuthReturn => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentSession = EnhancedAuthManager.getSession();
        setSession(currentSession);
        setIsLoading(false);
        
        if (currentSession) {
          EnhancedAuthManager.updateSessionActivity();
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to initialize authentication');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh session activity
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      EnhancedAuthManager.updateSessionActivity();
      const updatedSession = EnhancedAuthManager.getSession();
      
      if (!updatedSession) {
        setSession(null);
        setError('Session expired');
      } else {
        setSession(updatedSession);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session]);

  // Login function
  const login = useCallback(async (
    email: string, 
    password: string, 
    rememberMe = false
  ): Promise<{
    success: boolean;
    requiresMFA?: boolean;
    error?: string;
    lockoutTime?: number;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if account is locked
      const lockStatus = EnhancedAuthManager.isAccountLocked(email);
      if (lockStatus.locked) {
        const lockoutTime = lockStatus.unlockTime || 0;
        const remainingTime = Math.ceil((lockoutTime - Date.now()) / 60000);
        
        EnhancedAuthManager.recordLoginAttempt({
          email,
          timestamp: Date.now(),
          success: false,
          userAgent: navigator.userAgent,
          failureReason: 'account_locked'
        });

        return {
          success: false,
          error: `บัญชีถูกล็อก กรุณารอ ${remainingTime} นาที`,
          lockoutTime
        };
      }

      // Simulate API call for authentication
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
        
        // Record failed attempt
        EnhancedAuthManager.recordLoginAttempt({
          email,
          timestamp: Date.now(),
          success: false,
          userAgent: navigator.userAgent,
          failureReason: errorData.reason || 'invalid_credentials'
        });

        return {
          success: false,
          error: errorData.message || 'เข้าสู่ระบบไม่สำเร็จ'
        };
      }

      const data = await response.json();
      const user: User = data.user;

      // Check if MFA is required
      if (EnhancedAuthManager.requiresMFA(user) && !data.mfaVerified) {
        // Store temporary session for MFA verification
        SecurityUtils.setSecureItem('mfa_temp_user', user, 10); // 10 minutes
        
        return {
          success: false,
          requiresMFA: true
        };
      }

      // Create session
      const newSession = EnhancedAuthManager.createSession(user, data.mfaVerified || false);
      setSession(newSession);

      // Record successful attempt
      EnhancedAuthManager.recordLoginAttempt({
        email,
        timestamp: Date.now(),
        success: true,
        userAgent: navigator.userAgent
      });

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError(errorMessage);
      
      // Record failed attempt
      EnhancedAuthManager.recordLoginAttempt({
        email,
        timestamp: Date.now(),
        success: false,
        userAgent: navigator.userAgent,
        failureReason: 'network_error'
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    EnhancedAuthManager.terminateSession('manual_logout');
    setSession(null);
    setError(null);
  }, []);

  // MFA verification
  const verifyMFA = useCallback(async (code: string, isBackupCode = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const tempUser = SecurityUtils.getSecureItem<User>('mfa_temp_user');
      if (!tempUser) {
        setError('MFA session expired');
        return false;
      }

      // Simulate MFA verification API call
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: tempUser.id, 
          code, 
          isBackupCode 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'MFA verification failed');
        return false;
      }

      // Create authenticated session
      const newSession = EnhancedAuthManager.createSession(tempUser, true);
      setSession(newSession);

      // Clear temporary user data
      SecurityUtils.removeSecureItem('mfa_temp_user');

      EnhancedAuthManager.logSecurityEvent('mfa_verified', {
        userId: tempUser.id,
        method: isBackupCode ? 'backup_code' : 'totp'
      });

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MFA verification failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Permission checks
  const hasPermission = useCallback((permission: string): boolean => {
    return EnhancedAuthManager.hasPermission(permission);
  }, [session]);

  const hasRole = useCallback((role: string): boolean => {
    return EnhancedAuthManager.hasRole(role);
  }, [session]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return EnhancedAuthManager.hasAnyRole(roles);
  }, [session]);

  // Session management
  const refreshSession = useCallback(() => {
    const currentSession = EnhancedAuthManager.getSession();
    setSession(currentSession);
  }, []);

  const updateActivity = useCallback(() => {
    EnhancedAuthManager.updateSessionActivity();
  }, []);

  const getSessionInfo = useCallback((): AuthSession | null => {
    return EnhancedAuthManager.getSession();
  }, []);

  // Password change
  const changePassword = useCallback(async (
    currentPassword: string, 
    newPassword: string
  ): Promise<boolean> => {
    if (!session) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Validate new password
      const validation = EnhancedAuthManager.validatePassword(newPassword);
      if (!validation.valid) {
        setError(validation.errors.join(', '));
        return false;
      }

      // Simulate API call
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.sessionToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to change password');
        return false;
      }

      EnhancedAuthManager.logSecurityEvent('password_changed', {
        userId: session.userId
      });

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Enable MFA
  const enableMFA = useCallback(async (): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> => {
    if (!session) throw new Error('Not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/enable-mfa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.sessionToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to enable MFA');
      }

      const data = await response.json();
      
      EnhancedAuthManager.logSecurityEvent('mfa_enabled', {
        userId: session.userId
      });

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable MFA';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Disable MFA
  const disableMFA = useCallback(async (password: string): Promise<boolean> => {
    if (!session) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/disable-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.sessionToken}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to disable MFA');
        return false;
      }

      EnhancedAuthManager.logSecurityEvent('mfa_disabled', {
        userId: session.userId
      });

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable MFA';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Risk assessment
  const getLoginRisk = useCallback((email: string) => {
    return EnhancedAuthManager.assessLoginRisk(email);
  }, []);

  const getSecurityHealth = useCallback(() => {
    return EnhancedAuthManager.performSecurityHealthCheck();
  }, []);

  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Derived state
  const isAuthenticated = !!session;
  const user = session ? {
    id: session.userId,
    role: session.role,
    // Add other user properties as needed
  } as User : null;

  return {
    // Session state
    session,
    isAuthenticated,
    isLoading,
    user,
    
    // Authentication methods
    login,
    logout,
    verifyMFA,
    
    // Permission checks
    hasPermission,
    hasRole,
    hasAnyRole,
    
    // Session management
    refreshSession,
    updateActivity,
    getSessionInfo,
    
    // Security features
    changePassword,
    enableMFA,
    disableMFA,
    
    // Risk assessment
    getLoginRisk,
    getSecurityHealth,
    
    // Error handling
    error,
    clearError
  };
};

export default useEnhancedAuth;