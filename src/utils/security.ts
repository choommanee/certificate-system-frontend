import CryptoJS from 'crypto-js';

export class SecurityUtils {
  private static readonly ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-change-in-production';

  // Content Security Policy helpers
  static generateNonce(): string {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);
  }

  // Data encryption/decryption
  static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Hash generation
  static generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
  }

  // Secure token generation
  static generateSecureToken(length = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
  }

  // File integrity verification
  static async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
          const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
          resolve(hash);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Secure session management
  static setSecureItem(key: string, value: any, expirationMinutes = 60): void {
    const item = {
      value: this.encrypt(JSON.stringify(value)),
      timestamp: Date.now(),
      expiration: Date.now() + (expirationMinutes * 60 * 1000)
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  static getSecureItem<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // Check expiration
      if (Date.now() > item.expiration) {
        localStorage.removeItem(key);
        return null;
      }

      const decryptedValue = this.decrypt(item.value);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      localStorage.removeItem(key);
      return null;
    }
  }

  static removeSecureItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Rate limiting
  private static rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  static checkRateLimit(key: string, maxRequests = 10, windowMinutes = 1): boolean {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    const record = this.rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }

  // Input sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  static isSafeUrl(url: string): boolean {
    if (!this.isValidUrl(url)) return false;
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.match(/^172\.(1[6-9]|2\d|3[01])\./)) {
        return false;
      }
    }
    
    return true;
  }

  // CSRF protection
  static generateCSRFToken(): string {
    const token = this.generateSecureToken();
    this.setSecureItem('csrf_token', token, 60); // 1 hour expiration
    return token;
  }

  static validateCSRFToken(token: string): boolean {
    const storedToken = this.getSecureItem<string>('csrf_token');
    return storedToken === token;
  }

  // Signature verification helpers
  static async verifySignatureIntegrity(
    originalFile: File, 
    signedFile: File
  ): Promise<boolean> {
    try {
      const originalHash = await this.calculateFileHash(originalFile);
      const signedHash = await this.calculateFileHash(signedFile);
      
      // In a real implementation, this would verify digital signatures
      // For now, we just check if the files are different (signed file should be different)
      return originalHash !== signedHash;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Audit logging
  static logSecurityEvent(event: string, details: any = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details: {
        ...details,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSecureItem('session_id')
      }
    };

    // In production, this would send to a secure logging service
    console.log('Security Event:', logEntry);
    
    // Store locally for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.push(logEntry);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      localStorage.setItem('security_logs', JSON.stringify(logs));
    }
  }

  // Session security
  static initializeSecureSession(): string {
    const sessionId = this.generateSecureToken();
    const sessionData = {
      id: sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      csrfToken: this.generateCSRFToken()
    };
    
    this.setSecureItem('session_data', sessionData, 480); // 8 hours
    this.logSecurityEvent('session_initialized', { sessionId });
    
    return sessionId;
  }

  static updateSessionActivity(): void {
    const sessionData = this.getSecureItem<any>('session_data');
    if (sessionData) {
      sessionData.lastActivity = Date.now();
      this.setSecureItem('session_data', sessionData, 480);
    }
  }

  static isSessionValid(): boolean {
    const sessionData = this.getSecureItem<any>('session_data');
    if (!sessionData) return false;
    
    const maxInactivity = 30 * 60 * 1000; // 30 minutes
    const timeSinceActivity = Date.now() - sessionData.lastActivity;
    
    if (timeSinceActivity > maxInactivity) {
      this.terminateSession();
      return false;
    }
    
    return true;
  }

  static terminateSession(): void {
    const sessionData = this.getSecureItem<any>('session_data');
    if (sessionData) {
      this.logSecurityEvent('session_terminated', { sessionId: sessionData.id });
    }
    
    this.removeSecureItem('session_data');
    this.removeSecureItem('csrf_token');
    localStorage.removeItem('token'); // Remove auth token
  }

  // Content validation
  static validateFileContent(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          
          // Check for malicious patterns
          const maliciousPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /eval\(/i,
            /document\.write/i
          ];
          
          const isSafe = !maliciousPatterns.some(pattern => pattern.test(content));
          resolve(isSafe);
        } catch (error) {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file.slice(0, 1024)); // Read first 1KB for validation
    });
  }

  // Environment checks
  static isSecureContext(): boolean {
    return window.isSecureContext || location.protocol === 'https:';
  }

  static checkBrowserSecurity(): { isSecure: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    if (!this.isSecureContext()) {
      warnings.push('การเชื่อมต่อไม่ปลอดภัย (ไม่ใช่ HTTPS)');
    }
    
    if (!window.crypto || !window.crypto.subtle) {
      warnings.push('เบราว์เซอร์ไม่รองรับ Web Crypto API');
    }
    
    if (document.cookie.includes('Secure=false')) {
      warnings.push('Cookie ไม่ได้ตั้งค่าให้ปลอดภัย');
    }
    
    return {
      isSecure: warnings.length === 0,
      warnings
    };
  }
}

// Security middleware for API calls
export const securityMiddleware = {
  beforeRequest: (config: any) => {
    // Add CSRF token
    const csrfToken = SecurityUtils.getSecureItem<string>('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Update session activity
    SecurityUtils.updateSessionActivity();
    
    // Check rate limiting
    const rateLimitKey = `api_${config.url}`;
    if (!SecurityUtils.checkRateLimit(rateLimitKey, 100, 1)) {
      throw new Error('Rate limit exceeded');
    }
    
    return config;
  },

  afterResponse: (response: any) => {
    // Log successful API calls
    SecurityUtils.logSecurityEvent('api_call_success', {
      url: response.config?.url,
      status: response.status
    });
    
    return response;
  },

  onError: (error: any) => {
    // Log API errors
    SecurityUtils.logSecurityEvent('api_call_error', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Handle security-related errors
    if (error.response?.status === 401) {
      SecurityUtils.terminateSession();
    }
    
    throw error;
  }
};

export default SecurityUtils;