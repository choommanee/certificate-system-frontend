import { renderHook, act, waitFor } from '@testing-library/react';
import { useEnhancedAuth } from '../useEnhancedAuth';
import EnhancedAuthManager from '../../utils/enhancedAuth';
import SecurityUtils from '../../utils/security';

// Mock dependencies
jest.mock('../../utils/enhancedAuth');
jest.mock('../../utils/security');

const mockEnhancedAuthManager = EnhancedAuthManager as jest.Mocked<typeof EnhancedAuthManager>;
const mockSecurityUtils = SecurityUtils as jest.Mocked<typeof SecurityUtils>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useEnhancedAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockEnhancedAuthManager.getSession.mockReturnValue(null);
    mockEnhancedAuthManager.updateSessionActivity.mockImplementation(() => {});
    mockEnhancedAuthManager.isAccountLocked.mockReturnValue({ locked: false });
    mockEnhancedAuthManager.recordLoginAttempt.mockImplementation(() => {});
    mockEnhancedAuthManager.createSession.mockReturnValue({
      userId: 'user-123',
      role: 'signer',
      permissions: ['documents:view', 'documents:sign'],
      loginTime: Date.now(),
      lastActivity: Date.now(),
      deviceFingerprint: 'mock-fingerprint',
      mfaVerified: true,
      sessionToken: 'mock-token'
    });
    
    mockSecurityUtils.setSecureItem.mockImplementation(() => {});
    mockSecurityUtils.removeSecureItem.mockImplementation(() => {});
    mockSecurityUtils.generateCSRFToken.mockReturnValue('csrf-token');
  });

  describe('Initialization', () => {
    test('should initialize with no session', () => {
      const { result } = renderHook(() => useEnhancedAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    test('should initialize with existing session', () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);

      const { result } = renderHook(() => useEnhancedAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.session).toEqual(mockSession);
    });

    test('should handle initialization errors', () => {
      mockEnhancedAuthManager.getSession.mockImplementation(() => {
        throw new Error('Session error');
      });

      const { result } = renderHook(() => useEnhancedAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Failed to initialize authentication');
    });
  });

  describe('Login', () => {
    test('should login successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          user: {
            id: 'user-123',
            role: 'signer',
            email: 'test@example.com',
            name: 'Test User'
          },
          mfaVerified: true
        })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useEnhancedAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toEqual({ success: true });
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockEnhancedAuthManager.recordLoginAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          success: true
        })
      );
    });

    test('should handle MFA requirement', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          user: {
            id: 'user-123',
            role: 'signer',
            email: 'test@example.com',
            name: 'Test User'
          },
          mfaVerified: false
        })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);
      mockEnhancedAuthManager.requiresMFA.mockReturnValue(true);

      const { result } = renderHook(() => useEnhancedAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toEqual({
        success: false,
        requiresMFA: true
      });
      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'mfa_temp_user',
        expect.any(Object),
        10
      );
    });

    test('should handle account lockout', async () => {
      mockEnhancedAuthManager.isAccountLocked.mockReturnValue({
        locked: true,
        unlockTime: Date.now() + 15 * 60 * 1000
      });

      const { result } = renderHook(() => useEnhancedAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toEqual({
        success: false,
        error: expect.stringContaining('บัญชีถูกล็อก'),
        lockoutTime: expect.any(Number)
      });
    });

    test('should handle login failure', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          message: 'Invalid credentials',
          reason: 'invalid_credentials'
        })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useEnhancedAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
      expect(mockEnhancedAuthManager.recordLoginAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          success: false,
          failureReason: 'invalid_credentials'
        })
      );
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEnhancedAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Network error'
      });
      expect(mockEnhancedAuthManager.recordLoginAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          success: false,
          failureReason: 'network_error'
        })
      );
    });
  });

  describe('Logout', () => {
    test('should logout successfully', () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);
      mockEnhancedAuthManager.terminateSession.mockImplementation(() => {});

      const { result } = renderHook(() => useEnhancedAuth());

      act(() => {
        result.current.logout();
      });

      expect(mockEnhancedAuthManager.terminateSession).toHaveBeenCalledWith('manual_logout');
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.session).toBeNull();
    });
  });

  describe('MFA Verification', () => {
    test('should verify MFA successfully', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'signer',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockUser);

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useEnhancedAuth());

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyMFA('123456');
      });

      expect(verifyResult).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockSecurityUtils.removeSecureItem).toHaveBeenCalledWith('mfa_temp_user');
    });

    test('should handle MFA verification failure', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'signer',
        email: 'test@example.com',
        name: 'Test User'
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockUser);

      const mockResponse = {
        ok: false,
        json: async () => ({ message: 'Invalid MFA code' })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useEnhancedAuth());

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyMFA('000000');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.error).toBe('Invalid MFA code');
    });

    test('should handle expired MFA session', async () => {
      mockSecurityUtils.getSecureItem.mockReturnValue(null);

      const { result } = renderHook(() => useEnhancedAuth());

      let verifyResult;
      await act(async () => {
        verifyResult = await result.current.verifyMFA('123456');
      });

      expect(verifyResult).toBe(false);
      expect(result.current.error).toBe('MFA session expired');
    });
  });

  describe('Permission Checks', () => {
    test('should check permissions correctly', () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view', 'documents:sign'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);
      mockEnhancedAuthManager.hasPermission
        .mockReturnValueOnce(true)  // documents:view
        .mockReturnValueOnce(false); // admin:delete

      const { result } = renderHook(() => useEnhancedAuth());

      expect(result.current.hasPermission('documents:view')).toBe(true);
      expect(result.current.hasPermission('admin:delete')).toBe(false);
    });

    test('should check roles correctly', () => {
      mockEnhancedAuthManager.hasRole
        .mockReturnValueOnce(true)  // signer
        .mockReturnValueOnce(false); // admin

      const { result } = renderHook(() => useEnhancedAuth());

      expect(result.current.hasRole('signer')).toBe(true);
      expect(result.current.hasRole('admin')).toBe(false);
    });

    test('should check multiple roles', () => {
      mockEnhancedAuthManager.hasAnyRole.mockReturnValue(true);

      const { result } = renderHook(() => useEnhancedAuth());

      expect(result.current.hasAnyRole(['signer', 'admin'])).toBe(true);
    });
  });

  describe('Session Management', () => {
    test('should refresh session', () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);

      const { result } = renderHook(() => useEnhancedAuth());

      act(() => {
        result.current.refreshSession();
      });

      expect(result.current.session).toEqual(mockSession);
    });

    test('should update activity', () => {
      const { result } = renderHook(() => useEnhancedAuth());

      act(() => {
        result.current.updateActivity();
      });

      expect(mockEnhancedAuthManager.updateSessionActivity).toHaveBeenCalled();
    });

    test('should get session info', () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);

      const { result } = renderHook(() => useEnhancedAuth());

      const sessionInfo = result.current.getSessionInfo();
      expect(sessionInfo).toEqual(mockSession);
    });
  });

  describe('Password Management', () => {
    test('should change password successfully', async () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);
      mockEnhancedAuthManager.validatePassword.mockReturnValue({
        valid: true,
        errors: []
      });

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useEnhancedAuth());

      let changeResult;
      await act(async () => {
        changeResult = await result.current.changePassword('oldpass', 'newpass123!');
      });

      expect(changeResult).toBe(true);
    });

    test('should reject weak passwords', async () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);
      mockEnhancedAuthManager.validatePassword.mockReturnValue({
        valid: false,
        errors: ['Password too weak']
      });

      const { result } = renderHook(() => useEnhancedAuth());

      let changeResult;
      await act(async () => {
        changeResult = await result.current.changePassword('oldpass', 'weak');
      });

      expect(changeResult).toBe(false);
      expect(result.current.error).toBe('Password too weak');
    });
  });

  describe('MFA Management', () => {
    test('should enable MFA successfully', async () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);

      const mockResponse = {
        ok: true,
        json: async () => ({
          secret: 'JBSWY3DPEHPK3PXP',
          qrCode: 'data:image/png;base64,mock-qr-code',
          backupCodes: ['ABCD1234', 'EFGH5678']
        })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useEnhancedAuth());

      let mfaData;
      await act(async () => {
        mfaData = await result.current.enableMFA();
      });

      expect(mfaData).toEqual({
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,mock-qr-code',
        backupCodes: ['ABCD1234', 'EFGH5678']
      });
    });

    test('should disable MFA successfully', async () => {
      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession.mockReturnValue(mockSession);

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true })
      };

      mockFetch.mockResolvedValue(mockResponse as Response);

      const { result } = renderHook(() => useEnhancedAuth());

      let disableResult;
      await act(async () => {
        disableResult = await result.current.disableMFA('password123');
      });

      expect(disableResult).toBe(true);
    });
  });

  describe('Risk Assessment', () => {
    test('should get login risk assessment', () => {
      const mockRisk = {
        risk: 'medium' as const,
        factors: ['Multiple failed attempts']
      };

      mockEnhancedAuthManager.assessLoginRisk.mockReturnValue(mockRisk);

      const { result } = renderHook(() => useEnhancedAuth());

      const risk = result.current.getLoginRisk('test@example.com');
      expect(risk).toEqual(mockRisk);
    });

    test('should get security health check', () => {
      const mockHealth = {
        score: 85,
        issues: ['Session timeout too long'],
        recommendations: ['Reduce session timeout']
      };

      mockEnhancedAuthManager.performSecurityHealthCheck.mockReturnValue(mockHealth);

      const { result } = renderHook(() => useEnhancedAuth());

      const health = result.current.getSecurityHealth();
      expect(health).toEqual(mockHealth);
    });
  });

  describe('Error Handling', () => {
    test('should clear errors', () => {
      const { result } = renderHook(() => useEnhancedAuth());

      // Set an error first
      act(() => {
        result.current.login('invalid', 'credentials');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Session Auto-refresh', () => {
    test('should handle session expiry during auto-refresh', async () => {
      jest.useFakeTimers();

      const mockSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-fingerprint',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockEnhancedAuthManager.getSession
        .mockReturnValueOnce(mockSession)  // Initial load
        .mockReturnValueOnce(null);        // After timeout

      const { result } = renderHook(() => useEnhancedAuth());

      expect(result.current.isAuthenticated).toBe(true);

      // Fast-forward time to trigger session check
      act(() => {
        jest.advanceTimersByTime(60000); // 1 minute
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.error).toBe('Session expired');
      });

      jest.useRealTimers();
    });
  });
});