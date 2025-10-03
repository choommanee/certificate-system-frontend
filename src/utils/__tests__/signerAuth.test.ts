import {
  SignerAuthValidator,
  SignerAuditLogger,
  SignerSessionManager,
  SIGNER_PERMISSIONS
} from '../signerAuth';
import SecurityUtils from '../security';
import { User } from '../../types/signer';

// Mock SecurityUtils
jest.mock('../security');
const mockSecurityUtils = SecurityUtils as jest.Mocked<typeof SecurityUtils>;

// Mock useEnhancedAuth hook
jest.mock('../../hooks/useEnhancedAuth', () => ({
  useEnhancedAuth: jest.fn()
}));

describe('SIGNER_PERMISSIONS', () => {
  test('should define all required permissions', () => {
    expect(SIGNER_PERMISSIONS.VIEW_DOCUMENTS).toEqual({
      resource: 'documents',
      action: 'view'
    });
    expect(SIGNER_PERMISSIONS.SIGN_DOCUMENTS).toEqual({
      resource: 'documents',
      action: 'sign'
    });
    expect(SIGNER_PERMISSIONS.REJECT_DOCUMENTS).toEqual({
      resource: 'documents',
      action: 'reject'
    });
    expect(SIGNER_PERMISSIONS.MANAGE_SIGNATURES).toEqual({
      resource: 'signatures',
      action: 'manage'
    });
    expect(SIGNER_PERMISSIONS.VIEW_HISTORY).toEqual({
      resource: 'signing-history',
      action: 'view'
    });
    expect(SIGNER_PERMISSIONS.VIEW_ANALYTICS).toEqual({
      resource: 'analytics',
      action: 'view'
    });
    expect(SIGNER_PERMISSIONS.EXPORT_REPORTS).toEqual({
      resource: 'reports',
      action: 'export'
    });
  });
});

describe('SignerAuthValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSignerAccess', () => {
    test('should allow signer role', () => {
      const user: User = {
        id: 'user-123',
        role: 'signer',
        email: 'signer@example.com',
        name: 'Test Signer'
      };

      expect(SignerAuthValidator.validateSignerAccess(user)).toBe(true);
    });

    test('should allow admin role', () => {
      const user: User = {
        id: 'admin-123',
        role: 'admin',
        email: 'admin@example.com',
        name: 'Test Admin'
      };

      expect(SignerAuthValidator.validateSignerAccess(user)).toBe(true);
    });

    test('should reject other roles', () => {
      const user: User = {
        id: 'staff-123',
        role: 'staff',
        email: 'staff@example.com',
        name: 'Test Staff'
      };

      expect(SignerAuthValidator.validateSignerAccess(user)).toBe(false);
    });

    test('should reject null user', () => {
      expect(SignerAuthValidator.validateSignerAccess(null)).toBe(false);
    });
  });

  describe('validateDocumentAccess', () => {
    const signerUser: User = {
      id: 'signer-123',
      role: 'signer',
      email: 'signer@example.com',
      name: 'Test Signer'
    };

    test('should allow signer to access documents', () => {
      expect(SignerAuthValidator.validateDocumentAccess(signerUser, 'doc-123', 'view')).toBe(true);
      expect(SignerAuthValidator.validateDocumentAccess(signerUser, 'doc-123', 'sign')).toBe(true);
      expect(SignerAuthValidator.validateDocumentAccess(signerUser, 'doc-123', 'reject')).toBe(true);
    });

    test('should reject non-signer users', () => {
      const staffUser: User = {
        id: 'staff-123',
        role: 'staff',
        email: 'staff@example.com',
        name: 'Test Staff'
      };

      expect(SignerAuthValidator.validateDocumentAccess(staffUser, 'doc-123', 'view')).toBe(false);
    });

    test('should reject null user', () => {
      expect(SignerAuthValidator.validateDocumentAccess(null, 'doc-123', 'view')).toBe(false);
    });
  });

  describe('validateSignatureAccess', () => {
    const signerUser: User = {
      id: 'signer-123',
      role: 'signer',
      email: 'signer@example.com',
      name: 'Test Signer'
    };

    const adminUser: User = {
      id: 'admin-123',
      role: 'admin',
      email: 'admin@example.com',
      name: 'Test Admin'
    };

    test('should allow users to manage their own signatures', () => {
      expect(SignerAuthValidator.validateSignatureAccess(signerUser, 'signer-123', 'view')).toBe(true);
      expect(SignerAuthValidator.validateSignatureAccess(signerUser, 'signer-123', 'create')).toBe(true);
      expect(SignerAuthValidator.validateSignatureAccess(signerUser, 'signer-123', 'update')).toBe(true);
      expect(SignerAuthValidator.validateSignatureAccess(signerUser, 'signer-123', 'delete')).toBe(true);
    });

    test('should prevent users from managing other users signatures', () => {
      expect(SignerAuthValidator.validateSignatureAccess(signerUser, 'other-user', 'view')).toBe(false);
      expect(SignerAuthValidator.validateSignatureAccess(signerUser, 'other-user', 'update')).toBe(false);
      expect(SignerAuthValidator.validateSignatureAccess(signerUser, 'other-user', 'delete')).toBe(false);
    });

    test('should allow admin to manage any signatures', () => {
      expect(SignerAuthValidator.validateSignatureAccess(adminUser, 'any-user', 'view')).toBe(true);
      expect(SignerAuthValidator.validateSignatureAccess(adminUser, 'any-user', 'update')).toBe(true);
      expect(SignerAuthValidator.validateSignatureAccess(adminUser, 'any-user', 'delete')).toBe(true);
    });

    test('should reject non-signer users', () => {
      const staffUser: User = {
        id: 'staff-123',
        role: 'staff',
        email: 'staff@example.com',
        name: 'Test Staff'
      };

      expect(SignerAuthValidator.validateSignatureAccess(staffUser, 'staff-123', 'view')).toBe(false);
    });
  });

  describe('validateBatchSigning', () => {
    const signerUser: User = {
      id: 'signer-123',
      role: 'signer',
      email: 'signer@example.com',
      name: 'Test Signer'
    };

    beforeEach(() => {
      mockSecurityUtils.checkRateLimit.mockReturnValue(true);
    });

    test('should allow small batches', () => {
      const result = SignerAuthValidator.validateBatchSigning(signerUser, 50);
      expect(result.allowed).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test('should warn for medium batches', () => {
      const result = SignerAuthValidator.validateBatchSigning(signerUser, 150);
      expect(result.allowed).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('จำนวนผู้รับมาก'));
    });

    test('should warn for large batches', () => {
      const result = SignerAuthValidator.validateBatchSigning(signerUser, 600);
      expect(result.allowed).toBe(true);
      expect(result.warnings).toContain(expect.stringContaining('จำนวนผู้รับมากเกินไป'));
    });

    test('should reject when rate limited', () => {
      mockSecurityUtils.checkRateLimit.mockReturnValue(false);
      
      const result = SignerAuthValidator.validateBatchSigning(signerUser, 50);
      expect(result.allowed).toBe(false);
      expect(result.warnings).toContain(expect.stringContaining('เกินขีดจำกัด'));
    });

    test('should reject non-signer users', () => {
      const staffUser: User = {
        id: 'staff-123',
        role: 'staff',
        email: 'staff@example.com',
        name: 'Test Staff'
      };

      const result = SignerAuthValidator.validateBatchSigning(staffUser, 50);
      expect(result.allowed).toBe(false);
      expect(result.warnings).toContain('ไม่มีสิทธิ์ในการลงนาม');
    });
  });

  describe('validateSigningSession', () => {
    const signerUser: User = {
      id: 'signer-123',
      role: 'signer',
      email: 'signer@example.com',
      name: 'Test Signer'
    };

    test('should validate active session', () => {
      mockSecurityUtils.isSessionValid.mockReturnValue(true);
      
      expect(SignerAuthValidator.validateSigningSession(signerUser)).toBe(true);
    });

    test('should reject invalid session', () => {
      mockSecurityUtils.isSessionValid.mockReturnValue(false);
      mockSecurityUtils.logSecurityEvent.mockImplementation(() => {});
      
      expect(SignerAuthValidator.validateSigningSession(signerUser)).toBe(false);
      expect(mockSecurityUtils.logSecurityEvent).toHaveBeenCalledWith(
        'invalid_signing_session',
        { userId: 'signer-123' }
      );
    });

    test('should reject non-signer users', () => {
      const staffUser: User = {
        id: 'staff-123',
        role: 'staff',
        email: 'staff@example.com',
        name: 'Test Staff'
      };

      expect(SignerAuthValidator.validateSigningSession(staffUser)).toBe(false);
    });
  });
});

describe('SignerAuditLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityUtils.logSecurityEvent.mockImplementation(() => {});
    
    // Mock navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 Test Browser',
      configurable: true
    });
  });

  describe('logSigningAction', () => {
    test('should log signing action with details', () => {
      const details = {
        userId: 'signer-123',
        documentId: 'doc-456',
        recipientCount: 25,
        processingTime: 5000
      };

      SignerAuditLogger.logSigningAction('sign', details);

      expect(mockSecurityUtils.logSecurityEvent).toHaveBeenCalledWith(
        'signer_sign',
        expect.objectContaining({
          ...details,
          timestamp: expect.any(String),
          userAgent: 'Mozilla/5.0 Test Browser',
          ipAddress: 'client-side'
        })
      );
    });

    test('should log different action types', () => {
      const actions: Array<'sign' | 'reject' | 'view' | 'upload_signature'> = [
        'sign', 'reject', 'view', 'upload_signature'
      ];

      actions.forEach(action => {
        SignerAuditLogger.logSigningAction(action, { userId: 'test-user' });
        expect(mockSecurityUtils.logSecurityEvent).toHaveBeenCalledWith(
          `signer_${action}`,
          expect.any(Object)
        );
      });
    });
  });

  describe('logSecurityViolation', () => {
    test('should log security violation', () => {
      const details = {
        userId: 'signer-123',
        attemptedAction: 'unauthorized_access',
        resource: 'documents',
        severity: 'high' as const
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      SignerAuditLogger.logSecurityViolation('Unauthorized access attempt', details);

      expect(mockSecurityUtils.logSecurityEvent).toHaveBeenCalledWith(
        'security_violation',
        expect.objectContaining({
          violation: 'Unauthorized access attempt',
          ...details,
          timestamp: expect.any(String),
          userAgent: 'Mozilla/5.0 Test Browser'
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'High severity security violation detected:',
        'Unauthorized access attempt'
      );

      consoleSpy.mockRestore();
    });

    test('should not log to console for low severity', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      SignerAuditLogger.logSecurityViolation('Minor violation', {
        severity: 'low'
      });

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('logDataAccess', () => {
    test('should log data access events', () => {
      SignerAuditLogger.logDataAccess(
        'documents',
        'read',
        'signer-123',
        true,
        { documentId: 'doc-456' }
      );

      expect(mockSecurityUtils.logSecurityEvent).toHaveBeenCalledWith(
        'data_access',
        expect.objectContaining({
          resource: 'documents',
          action: 'read',
          userId: 'signer-123',
          success: true,
          details: { documentId: 'doc-456' },
          timestamp: expect.any(String)
        })
      );
    });
  });
});

describe('SignerSessionManager', () => {
  const testUser: User = {
    id: 'signer-123',
    role: 'signer',
    email: 'signer@example.com',
    name: 'Test Signer'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityUtils.setSecureItem.mockImplementation(() => {});
    mockSecurityUtils.getSecureItem.mockImplementation(() => null);
    mockSecurityUtils.removeSecureItem.mockImplementation(() => {});
  });

  describe('initializeSession', () => {
    test('should initialize session with user data', () => {
      SignerSessionManager.initializeSession(testUser);

      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'signer_session',
        expect.objectContaining({
          userId: 'signer-123',
          role: 'signer',
          startTime: expect.any(Number),
          lastActivity: expect.any(Number),
          activeDocuments: [],
          signatureCount: 0
        }),
        480
      );
    });
  });

  describe('updateActivity', () => {
    test('should update session activity', () => {
      const mockSession = {
        userId: 'signer-123',
        role: 'signer',
        startTime: Date.now(),
        lastActivity: Date.now() - 60000,
        activeDocuments: [],
        signatureCount: 0
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      SignerSessionManager.updateActivity('doc-456');

      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'signer_session',
        expect.objectContaining({
          ...mockSession,
          lastActivity: expect.any(Number),
          activeDocuments: ['doc-456']
        }),
        480
      );
    });

    test('should not duplicate document IDs', () => {
      const mockSession = {
        userId: 'signer-123',
        role: 'signer',
        startTime: Date.now(),
        lastActivity: Date.now() - 60000,
        activeDocuments: ['doc-456'],
        signatureCount: 0
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      SignerSessionManager.updateActivity('doc-456');

      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'signer_session',
        expect.objectContaining({
          activeDocuments: ['doc-456'] // Should not duplicate
        }),
        480
      );
    });
  });

  describe('incrementSignatureCount', () => {
    test('should increment signature count', () => {
      const mockSession = {
        userId: 'signer-123',
        role: 'signer',
        startTime: Date.now(),
        lastActivity: Date.now(),
        activeDocuments: [],
        signatureCount: 5
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      SignerSessionManager.incrementSignatureCount();

      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'signer_session',
        expect.objectContaining({
          signatureCount: 6
        }),
        480
      );
    });
  });

  describe('isSessionActive', () => {
    test('should return true for active session', () => {
      const mockSession = {
        userId: 'signer-123',
        role: 'signer',
        startTime: Date.now(),
        lastActivity: Date.now() - 1000, // 1 second ago
        activeDocuments: [],
        signatureCount: 0
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      expect(SignerSessionManager.isSessionActive()).toBe(true);
    });

    test('should return false for expired session', () => {
      const mockSession = {
        userId: 'signer-123',
        role: 'signer',
        startTime: Date.now(),
        lastActivity: Date.now() - 31 * 60 * 1000, // 31 minutes ago
        activeDocuments: [],
        signatureCount: 0
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      expect(SignerSessionManager.isSessionActive()).toBe(false);
    });

    test('should return false for no session', () => {
      mockSecurityUtils.getSecureItem.mockReturnValue(null);
      expect(SignerSessionManager.isSessionActive()).toBe(false);
    });
  });

  describe('getSessionStats', () => {
    test('should return session statistics', () => {
      const startTime = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
      const lastActivity = Date.now() - 5 * 60 * 1000; // 5 minutes ago

      const mockSession = {
        userId: 'signer-123',
        role: 'signer',
        startTime,
        lastActivity,
        activeDocuments: ['doc-1', 'doc-2', 'doc-3'],
        signatureCount: 15
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      const stats = SignerSessionManager.getSessionStats();

      expect(stats).toEqual({
        duration: expect.any(Number),
        documentsViewed: 3,
        signaturesCreated: 15,
        lastActivity: new Date(lastActivity)
      });
    });

    test('should return null for no session', () => {
      mockSecurityUtils.getSecureItem.mockReturnValue(null);
      expect(SignerSessionManager.getSessionStats()).toBeNull();
    });
  });

  describe('terminateSession', () => {
    test('should terminate session and log activity', () => {
      const startTime = Date.now() - 60000;
      const mockSession = {
        userId: 'signer-123',
        role: 'signer',
        startTime,
        lastActivity: Date.now(),
        activeDocuments: [],
        signatureCount: 5
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      SignerSessionManager.terminateSession();

      expect(mockSecurityUtils.removeSecureItem).toHaveBeenCalledWith('signer_session');
    });

    test('should handle termination with no session', () => {
      mockSecurityUtils.getSecureItem.mockReturnValue(null);

      expect(() => SignerSessionManager.terminateSession()).not.toThrow();
      expect(mockSecurityUtils.removeSecureItem).toHaveBeenCalledWith('signer_session');
    });
  });
});