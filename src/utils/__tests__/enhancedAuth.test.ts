import EnhancedAuthManager, { AuthSession, LoginAttempt, SecurityPolicy } from '../enhancedAuth';
import SecurityUtils from '../security';

// Mock SecurityUtils
jest.mock('../security');
const mockSecurityUtils = SecurityUtils as jest.Mocked<typeof SecurityUtils>;

// Mock crypto for device fingerprinting
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn(() => new Uint32Array([12345]))
  }
});

// Mock canvas for device fingerprinting
const mockCanvas = {
  getContext: jest.fn(() => ({
    textBaseline: '',
    font: '',
    fillText: jest.fn()
  })),
  toDataURL: jest.fn(() => 'mock-canvas-data')
};

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'canvas') return mockCanvas;
    return {};
  })
});

describe('EnhancedAuthManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityUtils.setSecureItem.mockImplementation(() => {});
    mockSecurityUtils.getSecureItem.mockImplementation(() => null);
    mockSecurityUtils.removeSecureItem.mockImplementation(() => {});
    mockSecurityUtils.generateSecureToken.mockImplementation(() => 'mock-token');
    mockSecurityUtils.generateHash.mockImplementation(() => 'mock-hash');
    mockSecurityUtils.logSecurityEvent.mockImplementation(() => {});
  });

  describe('Session Management', () => {
    const mockUser = {
      id: 'user-123',
      role: 'signer',
      email: 'test@example.com',
      name: 'Test User'
    };

    test('should create session successfully', () => {
      const session = EnhancedAuthManager.createSession(mockUser, true);

      expect(session).toMatchObject({
        userId: 'user-123',
        role: 'signer',
        mfaVerified: true
      });
      expect(session.permissions).toContain('documents:view');
      expect(session.permissions).toContain('documents:sign');
      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'enhanced_auth_session',
        expect.any(Object),
        480
      );
    });

    test('should validate session with correct fingerprint', () => {
      const mockSession: AuthSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-hash',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      const session = EnhancedAuthManager.getSession();
      expect(session).toEqual(mockSession);
    });

    test('should invalidate session with incorrect fingerprint', () => {
      const mockSession: AuthSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'different-hash',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      const session = EnhancedAuthManager.getSession();
      expect(session).toBeNull();
      expect(mockSecurityUtils.logSecurityEvent).toHaveBeenCalledWith(
        'session_hijack_attempt',
        expect.any(Object)
      );
    });

    test('should timeout expired session', () => {
      const mockSession: AuthSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view'],
        loginTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        lastActivity: Date.now() - 31 * 60 * 1000, // 31 minutes ago (expired)
        deviceFingerprint: 'mock-hash',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      const session = EnhancedAuthManager.getSession();
      expect(session).toBeNull();
    });
  });

  describe('Login Attempt Tracking', () => {
    test('should record login attempt', () => {
      const attempt: LoginAttempt = {
        email: 'test@example.com',
        timestamp: Date.now(),
        success: true,
        userAgent: 'Mozilla/5.0'
      };

      mockSecurityUtils.getSecureItem.mockReturnValue([]);

      EnhancedAuthManager.recordLoginAttempt(attempt);

      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'login_attempts',
        [attempt],
        24 * 60
      );
    });

    test('should detect account lockout', () => {
      const failedAttempts: LoginAttempt[] = Array(5).fill(null).map((_, i) => ({
        email: 'test@example.com',
        timestamp: Date.now() - i * 60000, // 1 minute apart
        success: false,
        userAgent: 'Mozilla/5.0',
        failureReason: 'invalid_credentials'
      }));

      mockSecurityUtils.getSecureItem.mockReturnValue(failedAttempts);

      const lockStatus = EnhancedAuthManager.isAccountLocked('test@example.com');
      expect(lockStatus.locked).toBe(true);
      expect(lockStatus.unlockTime).toBeDefined();
    });

    test('should not lock account with successful attempts', () => {
      const attempts: LoginAttempt[] = [
        {
          email: 'test@example.com',
          timestamp: Date.now(),
          success: true,
          userAgent: 'Mozilla/5.0'
        }
      ];

      mockSecurityUtils.getSecureItem.mockReturnValue(attempts);

      const lockStatus = EnhancedAuthManager.isAccountLocked('test@example.com');
      expect(lockStatus.locked).toBe(false);
    });
  });

  describe('Permission Management', () => {
    test('should return correct permissions for signer role', () => {
      const permissions = EnhancedAuthManager.getRolePermissions('signer');
      
      expect(permissions).toContain('documents:view');
      expect(permissions).toContain('documents:sign');
      expect(permissions).toContain('signatures:create');
      expect(permissions).toContain('analytics:view');
    });

    test('should return admin permissions', () => {
      const permissions = EnhancedAuthManager.getRolePermissions('admin');
      expect(permissions).toContain('*:*');
    });

    test('should validate permissions correctly', () => {
      const mockSession: AuthSession = {
        userId: 'user-123',
        role: 'signer',
        permissions: ['documents:view', 'documents:sign'],
        loginTime: Date.now(),
        lastActivity: Date.now(),
        deviceFingerprint: 'mock-hash',
        mfaVerified: true,
        sessionToken: 'mock-token'
      };

      mockSecurityUtils.getSecureItem.mockReturnValue(mockSession);

      expect(EnhancedAuthManager.hasPermission('documents:view')).toBe(true);
      expect(EnhancedAuthManager.hasPermission('documents:sign')).toBe(true);
      expect(EnhancedAuthManager.hasPermission('admin:delete')).toBe(false);
    });
  });

  describe('MFA Management', () => {
    test('should require MFA for signer role', () => {
      const user = { id: '123', role: 'signer', email: 'test@example.com', name: 'Test' };
      expect(EnhancedAuthManager.requiresMFA(user)).toBe(true);
    });

    test('should require MFA for admin role', () => {
      const user = { id: '123', role: 'admin', email: 'test@example.com', name: 'Test' };
      expect(EnhancedAuthManager.requiresMFA(user)).toBe(true);
    });

    test('should generate backup codes', () => {
      const codes = EnhancedAuthManager.generateBackupCodes();
      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });

    test('should verify TOTP code format', () => {
      expect(EnhancedAuthManager.verifyTOTP('123456', 'secret')).toBe(true);
      expect(EnhancedAuthManager.verifyTOTP('000000', 'secret')).toBe(false);
      expect(EnhancedAuthManager.verifyTOTP('12345', 'secret')).toBe(false);
      expect(EnhancedAuthManager.verifyTOTP('abcdef', 'secret')).toBe(false);
    });

    test('should verify backup codes', () => {
      const validCodes = ['ABCD1234', 'EFGH5678'];
      
      expect(EnhancedAuthManager.verifyBackupCode('ABCD1234', validCodes)).toBe(true);
      expect(EnhancedAuthManager.verifyBackupCode('abcd1234', validCodes)).toBe(true); // Case insensitive
      expect(EnhancedAuthManager.verifyBackupCode('INVALID1', validCodes)).toBe(false);
    });
  });

  describe('File Security Validation', () => {
    test('should validate allowed file types', () => {
      const validFile = new File(['content'], 'test.png', { type: 'image/png' });
      const result = EnhancedAuthManager.validateFileUpload(validFile);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid file types', () => {
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/exe' });
      const result = EnhancedAuthManager.validateFileUpload(invalidFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ไม่ได้รับอนุญาต'));
    });

    test('should reject oversized files', () => {
      // Create a mock file that's too large
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
      
      const result = EnhancedAuthManager.validateFileUpload(largeFile);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('ขนาดใหญ่เกินไป'));
    });
  });

  describe('Password Security', () => {
    test('should validate strong password', () => {
      const result = EnhancedAuthManager.validatePassword('StrongP@ss123');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'short',           // Too short
        'nouppercase123!', // No uppercase
        'NOLOWERCASE123!', // No lowercase
        'NoNumbers!',      // No numbers
        'NoSpecialChars123', // No special characters
        'password123!'     // Common weak password
      ];

      weakPasswords.forEach(password => {
        const result = EnhancedAuthManager.validatePassword(password);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Risk Assessment', () => {
    test('should assess low risk for normal login', () => {
      mockSecurityUtils.getSecureItem.mockReturnValue([
        {
          email: 'test@example.com',
          timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
          success: true,
          userAgent: 'Mozilla/5.0'
        }
      ]);

      const assessment = EnhancedAuthManager.assessLoginRisk('test@example.com');
      expect(assessment.risk).toBe('low');
    });

    test('should assess high risk for multiple failed attempts', () => {
      const failedAttempts = Array(5).fill(null).map(() => ({
        email: 'test@example.com',
        timestamp: Date.now() - 60000, // 1 minute ago
        success: false,
        userAgent: 'Mozilla/5.0',
        failureReason: 'invalid_credentials'
      }));

      mockSecurityUtils.getSecureItem.mockReturnValue(failedAttempts);

      const assessment = EnhancedAuthManager.assessLoginRisk('test@example.com');
      expect(assessment.risk).toBe('high');
      expect(assessment.factors).toContain(expect.stringContaining('ล็อกอินไม่สำเร็จ'));
    });

    test('should assess medium risk for unusual hours', () => {
      // Mock current time to be 3 AM
      const originalDate = Date;
      const mockDate = new Date('2023-01-01T03:00:00Z');
      global.Date = jest.fn(() => mockDate) as any;
      global.Date.now = jest.fn(() => mockDate.getTime());

      mockSecurityUtils.getSecureItem.mockReturnValue([]);

      const assessment = EnhancedAuthManager.assessLoginRisk('test@example.com');
      expect(assessment.factors).toContain(expect.stringContaining('เวลาที่ไม่ปกติ'));

      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('Security Health Check', () => {
    test('should return perfect score for secure setup', () => {
      // Mock secure context
      Object.defineProperty(window, 'isSecureContext', { value: true });
      
      // Mock secure policy
      mockSecurityUtils.getSecureItem.mockReturnValue({
        sessionTimeout: 30,
        requireMFA: true,
        passwordMinLength: 8
      });

      const health = EnhancedAuthManager.performSecurityHealthCheck();
      expect(health.score).toBe(100);
      expect(health.issues).toHaveLength(0);
    });

    test('should detect security issues', () => {
      // Mock insecure context
      Object.defineProperty(window, 'isSecureContext', { value: false });
      
      // Mock weak policy
      mockSecurityUtils.getSecureItem.mockReturnValue({
        sessionTimeout: 120, // Too long
        requireMFA: false,   // Not required
        passwordMinLength: 6 // Too short
      });

      const health = EnhancedAuthManager.performSecurityHealthCheck();
      expect(health.score).toBeLessThan(100);
      expect(health.issues.length).toBeGreaterThan(0);
      expect(health.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Device Fingerprinting', () => {
    test('should generate consistent fingerprint', () => {
      const fingerprint1 = EnhancedAuthManager.generateDeviceFingerprint();
      const fingerprint2 = EnhancedAuthManager.generateDeviceFingerprint();
      
      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toBe('mock-hash');
    });
  });

  describe('Security Policy Management', () => {
    test('should return default policy when none exists', () => {
      mockSecurityUtils.getSecureItem.mockReturnValue(null);
      
      const policy = EnhancedAuthManager.getSecurityPolicy();
      expect(policy.maxLoginAttempts).toBe(5);
      expect(policy.sessionTimeout).toBe(30);
      expect(policy.requireMFA).toBe(false);
    });

    test('should update security policy', () => {
      const updates: Partial<SecurityPolicy> = {
        maxLoginAttempts: 3,
        requireMFA: true
      };

      mockSecurityUtils.getSecureItem.mockReturnValue({
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        sessionTimeout: 30,
        requireMFA: false,
        passwordMinLength: 8,
        passwordRequireSpecialChars: true,
        allowedFileTypes: ['image/png'],
        maxFileSize: 5 * 1024 * 1024
      });

      EnhancedAuthManager.updateSecurityPolicy(updates);

      expect(mockSecurityUtils.setSecureItem).toHaveBeenCalledWith(
        'security_policy',
        expect.objectContaining(updates),
        24 * 60 * 7
      );
    });
  });
});