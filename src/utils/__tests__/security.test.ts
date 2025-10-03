import SecurityUtils from '../security';

// Mock crypto-js
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn(() => ({ toString: () => 'encrypted-data' })),
    decrypt: jest.fn(() => ({ toString: () => 'decrypted-data' }))
  },
  SHA256: jest.fn(() => ({ toString: () => 'hashed-data' })),
  lib: {
    WordArray: {
      random: jest.fn(() => ({ toString: () => 'random-data' })),
      create: jest.fn(() => ({}))
    }
  },
  enc: {
    Utf8: {},
    Hex: {},
    Base64: {}
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock FileReader
const mockFileReader = {
  readAsArrayBuffer: jest.fn(),
  readAsText: jest.fn(),
  onload: null as any,
  onerror: null as any,
  result: null as any
};

global.FileReader = jest.fn(() => mockFileReader) as any;

describe('SecurityUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Encryption/Decryption', () => {
    test('should encrypt data successfully', () => {
      const result = SecurityUtils.encrypt('test data');
      expect(result).toBe('encrypted-data');
    });

    test('should decrypt data successfully', () => {
      const result = SecurityUtils.decrypt('encrypted-data');
      expect(result).toBe('decrypted-data');
    });

    test('should handle encryption errors', () => {
      const CryptoJS = require('crypto-js');
      CryptoJS.AES.encrypt.mockImplementationOnce(() => {
        throw new Error('Encryption failed');
      });

      expect(() => SecurityUtils.encrypt('test')).toThrow('Failed to encrypt data');
    });

    test('should handle decryption errors', () => {
      const CryptoJS = require('crypto-js');
      CryptoJS.AES.decrypt.mockImplementationOnce(() => {
        throw new Error('Decryption failed');
      });

      expect(() => SecurityUtils.decrypt('invalid')).toThrow('Failed to decrypt data');
    });
  });

  describe('Hash Generation', () => {
    test('should generate hash', () => {
      const result = SecurityUtils.generateHash('test data');
      expect(result).toBe('hashed-data');
    });

    test('should generate salt', () => {
      const result = SecurityUtils.generateSalt();
      expect(result).toBe('random-data');
    });

    test('should generate secure token', () => {
      const result = SecurityUtils.generateSecureToken();
      expect(result).toBe('random-data');
    });

    test('should generate secure token with custom length', () => {
      const result = SecurityUtils.generateSecureToken(64);
      expect(result).toBe('random-data');
    });
  });

  describe('File Hash Calculation', () => {
    test('should calculate file hash successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt');
      
      // Mock successful file reading
      setTimeout(() => {
        mockFileReader.result = new ArrayBuffer(8);
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: new ArrayBuffer(8) } });
        }
      }, 0);

      const promise = SecurityUtils.calculateFileHash(mockFile);
      
      // Trigger the onload callback
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result = await promise;
      expect(result).toBe('hashed-data');
    });

    test('should handle file reading errors', async () => {
      const mockFile = new File(['test content'], 'test.txt');
      
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror();
        }
      }, 0);

      await expect(SecurityUtils.calculateFileHash(mockFile)).rejects.toThrow('Failed to read file');
    });
  });

  describe('Secure Item Management', () => {
    test('should store secure item', () => {
      const testData = { test: 'data' };
      SecurityUtils.setSecureItem('test-key', testData, 60);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        expect.stringContaining('encrypted-data')
      );
    });

    test('should retrieve secure item', () => {
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now(),
        expiration: Date.now() + 60000
      });
      
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      const result = SecurityUtils.getSecureItem('test-key');
      expect(result).toEqual('decrypted-data');
    });

    test('should return null for expired item', () => {
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now() - 120000,
        expiration: Date.now() - 60000 // Expired
      });
      
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      const result = SecurityUtils.getSecureItem('test-key');
      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    test('should handle corrupted stored data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const result = SecurityUtils.getSecureItem('test-key');
      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    test('should remove secure item', () => {
      SecurityUtils.removeSecureItem('test-key');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('Rate Limiting', () => {
    test('should allow first request', () => {
      const result = SecurityUtils.checkRateLimit('test-key', 5, 1);
      expect(result).toBe(true);
    });

    test('should allow requests within limit', () => {
      // First request
      SecurityUtils.checkRateLimit('test-key', 5, 1);
      
      // Second request (should be allowed)
      const result = SecurityUtils.checkRateLimit('test-key', 5, 1);
      expect(result).toBe(true);
    });

    test('should block requests exceeding limit', () => {
      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        SecurityUtils.checkRateLimit('test-key', 5, 1);
      }
      
      // 6th request should be blocked
      const result = SecurityUtils.checkRateLimit('test-key', 5, 1);
      expect(result).toBe(false);
    });

    test('should reset after time window', () => {
      // Mock Date.now to control time
      const originalNow = Date.now;
      let mockTime = 1000000;
      Date.now = jest.fn(() => mockTime);

      // Make requests to hit limit
      for (let i = 0; i < 5; i++) {
        SecurityUtils.checkRateLimit('test-key', 5, 1);
      }
      
      // Should be blocked
      expect(SecurityUtils.checkRateLimit('test-key', 5, 1)).toBe(false);
      
      // Advance time past window (1 minute + 1ms)
      mockTime += 60001;
      
      // Should be allowed again
      expect(SecurityUtils.checkRateLimit('test-key', 5, 1)).toBe(true);

      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello<>';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe('alert("xss")Hello');
    });

    test('should remove javascript protocols', () => {
      const input = 'javascript:alert("xss")';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe('alert("xss")');
    });

    test('should remove event handlers', () => {
      const input = 'onclick=alert("xss") onload=malicious()';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe('malicious()');
    });

    test('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = SecurityUtils.sanitizeInput(input);
      expect(result).toBe('hello world');
    });
  });

  describe('URL Validation', () => {
    test('should validate HTTP URLs', () => {
      expect(SecurityUtils.isValidUrl('http://example.com')).toBe(true);
      expect(SecurityUtils.isValidUrl('https://example.com')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(SecurityUtils.isValidUrl('ftp://example.com')).toBe(false);
      expect(SecurityUtils.isValidUrl('javascript:alert(1)')).toBe(false);
      expect(SecurityUtils.isValidUrl('not-a-url')).toBe(false);
    });

    test('should validate safe URLs in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      expect(SecurityUtils.isSafeUrl('http://localhost:3000')).toBe(true);
      expect(SecurityUtils.isSafeUrl('http://192.168.1.1')).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    test('should block private IPs in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      expect(SecurityUtils.isSafeUrl('http://localhost:3000')).toBe(false);
      expect(SecurityUtils.isSafeUrl('http://192.168.1.1')).toBe(false);
      expect(SecurityUtils.isSafeUrl('http://10.0.0.1')).toBe(false);
      expect(SecurityUtils.isSafeUrl('http://172.16.0.1')).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('CSRF Protection', () => {
    test('should generate CSRF token', () => {
      const token = SecurityUtils.generateCSRFToken();
      expect(token).toBe('random-data');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('should validate correct CSRF token', () => {
      // Mock stored token
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now(),
        expiration: Date.now() + 60000
      });
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      const result = SecurityUtils.validateCSRFToken('decrypted-data');
      expect(result).toBe(true);
    });

    test('should reject incorrect CSRF token', () => {
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now(),
        expiration: Date.now() + 60000
      });
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      const result = SecurityUtils.validateCSRFToken('wrong-token');
      expect(result).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should initialize secure session', () => {
      const sessionId = SecurityUtils.initializeSecureSession();
      expect(sessionId).toBe('random-data');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('should update session activity', () => {
      // Mock existing session
      const mockSession = {
        id: 'session-123',
        createdAt: Date.now(),
        lastActivity: Date.now() - 60000,
        csrfToken: 'csrf-token'
      };
      
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now(),
        expiration: Date.now() + 60000
      });
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      // Mock decryption to return session data
      const CryptoJS = require('crypto-js');
      CryptoJS.AES.decrypt.mockReturnValueOnce({
        toString: () => JSON.stringify(mockSession)
      });

      SecurityUtils.updateSessionActivity();
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('should validate active session', () => {
      const mockSession = {
        id: 'session-123',
        createdAt: Date.now(),
        lastActivity: Date.now() - 1000, // 1 second ago
        csrfToken: 'csrf-token'
      };
      
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now(),
        expiration: Date.now() + 60000
      });
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      const CryptoJS = require('crypto-js');
      CryptoJS.AES.decrypt.mockReturnValueOnce({
        toString: () => JSON.stringify(mockSession)
      });

      const result = SecurityUtils.isSessionValid();
      expect(result).toBe(true);
    });

    test('should invalidate expired session', () => {
      const mockSession = {
        id: 'session-123',
        createdAt: Date.now(),
        lastActivity: Date.now() - 31 * 60 * 1000, // 31 minutes ago
        csrfToken: 'csrf-token'
      };
      
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now(),
        expiration: Date.now() + 60000
      });
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      const CryptoJS = require('crypto-js');
      CryptoJS.AES.decrypt.mockReturnValueOnce({
        toString: () => JSON.stringify(mockSession)
      });

      const result = SecurityUtils.isSessionValid();
      expect(result).toBe(false);
    });

    test('should terminate session', () => {
      const mockSession = {
        id: 'session-123',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        csrfToken: 'csrf-token'
      };
      
      const mockStoredItem = JSON.stringify({
        value: 'encrypted-data',
        timestamp: Date.now(),
        expiration: Date.now() + 60000
      });
      mockLocalStorage.getItem.mockReturnValue(mockStoredItem);

      const CryptoJS = require('crypto-js');
      CryptoJS.AES.decrypt.mockReturnValueOnce({
        toString: () => JSON.stringify(mockSession)
      });

      SecurityUtils.terminateSession();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('session_data');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('csrf_token');
    });
  });

  describe('File Content Validation', () => {
    test('should validate safe file content', async () => {
      const mockFile = new File(['safe content'], 'test.txt');
      
      setTimeout(() => {
        mockFileReader.result = 'safe content';
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: 'safe content' } });
        }
      }, 0);

      const promise = SecurityUtils.validateFileContent(mockFile);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result = await promise;
      expect(result).toBe(true);
    });

    test('should reject malicious file content', async () => {
      const mockFile = new File(['<script>alert("xss")</script>'], 'malicious.txt');
      
      setTimeout(() => {
        mockFileReader.result = '<script>alert("xss")</script>';
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: '<script>alert("xss")</script>' } });
        }
      }, 0);

      const promise = SecurityUtils.validateFileContent(mockFile);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const result = await promise;
      expect(result).toBe(false);
    });
  });

  describe('Environment Checks', () => {
    test('should detect secure context', () => {
      Object.defineProperty(window, 'isSecureContext', { value: true });
      expect(SecurityUtils.isSecureContext()).toBe(true);
    });

    test('should detect insecure context', () => {
      Object.defineProperty(window, 'isSecureContext', { value: false });
      Object.defineProperty(location, 'protocol', { value: 'http:' });
      expect(SecurityUtils.isSecureContext()).toBe(false);
    });

    test('should check browser security features', () => {
      // Mock secure browser
      Object.defineProperty(window, 'isSecureContext', { value: true });
      Object.defineProperty(window, 'crypto', { value: { subtle: {} } });
      Object.defineProperty(document, 'cookie', { value: 'session=abc; Secure=true' });

      const result = SecurityUtils.checkBrowserSecurity();
      expect(result.isSecure).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test('should detect browser security issues', () => {
      // Mock insecure browser
      Object.defineProperty(window, 'isSecureContext', { value: false });
      Object.defineProperty(window, 'crypto', { value: undefined });
      Object.defineProperty(document, 'cookie', { value: 'session=abc; Secure=false' });

      const result = SecurityUtils.checkBrowserSecurity();
      expect(result.isSecure).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Security Event Logging', () => {
    test('should log security events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      SecurityUtils.logSecurityEvent('test_event', { detail: 'test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Security Event:',
        expect.objectContaining({
          event: 'test_event',
          details: expect.objectContaining({ detail: 'test' })
        })
      );

      consoleSpy.mockRestore();
    });

    test('should store security logs in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockLocalStorage.getItem.mockReturnValue('[]');
      
      SecurityUtils.logSecurityEvent('test_event');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'security_logs',
        expect.stringContaining('test_event')
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});