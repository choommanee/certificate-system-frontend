import SecurityUtils from './security';
import { User } from '../types/signer';

// Enhanced Authentication and Authorization utilities
export interface AuthSession {
  userId: string;
  role: string;
  permissions: string[];
  loginTime: number;
  lastActivity: number;
  deviceFingerprint: string;
  ipAddress?: string;
  mfaVerified: boolean;
  sessionToken: string;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  userAgent: string;
  failureReason?: string;
}

export interface SecurityPolicy {
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sessionTimeout: number; // minutes
  requireMFA: boolean;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  allowedFileTypes: string[];
  maxFileSize: number; // bytes
}

export class EnhancedAuthManager {
  private static readonly SESSION_KEY = 'enhanced_auth_session';
  private static readonly LOGIN_ATTEMPTS_KEY = 'login_attempts';
  private static readonly SECURITY_POLICY_KEY = 'security_policy';

  // Default security policy
  private static readonly DEFAULT_POLICY: SecurityPolicy = {
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 30,
    requireMFA: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    allowedFileTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
    maxFileSize: 5 * 1024 * 1024 // 5MB
  };

  // Session Management
  static createSession(user: User, mfaVerified = false): AuthSession {
    const deviceFingerprint = this.generateDeviceFingerprint();
    const sessionToken = SecurityUtils.generateSecureToken(64);
    
    const session: AuthSession = {
      userId: user.id,
      role: user.role,
      permissions: this.getRolePermissions(user.role),
      loginTime: Date.now(),
      lastActivity: Date.now(),
      deviceFingerprint,
      mfaVerified,
      sessionToken
    };

    SecurityUtils.setSecureItem(this.SESSION_KEY, session, 480); // 8 hours
    this.logSecurityEvent('session_created', { 
      userId: user.id, 
      role: user.role,
      mfaVerified 
    });

    return session;
  }

  static getSession(): AuthSession | null {
    const session = SecurityUtils.getSecureItem<AuthSession>(this.SESSION_KEY);
    if (!session) return null;

    // Check session timeout
    const policy = this.getSecurityPolicy();
    const timeSinceActivity = Date.now() - session.lastActivity;
    
    if (timeSinceActivity > policy.sessionTimeout * 60 * 1000) {
      this.terminateSession('timeout');
      return null;
    }

    // Verify device fingerprint
    const currentFingerprint = this.generateDeviceFingerprint();
    if (session.deviceFingerprint !== currentFingerprint) {
      this.terminateSession('device_mismatch');
      this.logSecurityEvent('session_hijack_attempt', { 
        userId: session.userId,
        expectedFingerprint: session.deviceFingerprint,
        actualFingerprint: currentFingerprint
      });
      return null;
    }

    return session;
  }

  static updateSessionActivity(): void {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      SecurityUtils.setSecureItem(this.SESSION_KEY, session, 480);
    }
  }

  static terminateSession(reason = 'manual'): void {
    const session = this.getSession();
    if (session) {
      this.logSecurityEvent('session_terminated', { 
        userId: session.userId,
        reason,
        duration: Date.now() - session.loginTime
      });
    }
    
    SecurityUtils.removeSecureItem(this.SESSION_KEY);
    SecurityUtils.terminateSession();
  }

  // Login Attempt Tracking
  static recordLoginAttempt(attempt: LoginAttempt): void {
    const attempts = this.getLoginAttempts();
    attempts.push(attempt);
    
    // Keep only last 100 attempts
    if (attempts.length > 100) {
      attempts.splice(0, attempts.length - 100);
    }
    
    SecurityUtils.setSecureItem(this.LOGIN_ATTEMPTS_KEY, attempts, 24 * 60); // 24 hours
    
    this.logSecurityEvent('login_attempt', {
      email: attempt.email,
      success: attempt.success,
      failureReason: attempt.failureReason
    });
  }

  static getLoginAttempts(): LoginAttempt[] {
    return SecurityUtils.getSecureItem<LoginAttempt[]>(this.LOGIN_ATTEMPTS_KEY) || [];
  }

  static isAccountLocked(email: string): { locked: boolean; unlockTime?: number } {
    const policy = this.getSecurityPolicy();
    const attempts = this.getLoginAttempts();
    const recentAttempts = attempts.filter(attempt => 
      attempt.email === email && 
      !attempt.success &&
      Date.now() - attempt.timestamp < policy.lockoutDuration * 60 * 1000
    );

    if (recentAttempts.length >= policy.maxLoginAttempts) {
      const lastAttempt = recentAttempts[recentAttempts.length - 1];
      const unlockTime = lastAttempt.timestamp + (policy.lockoutDuration * 60 * 1000);
      
      return {
        locked: Date.now() < unlockTime,
        unlockTime
      };
    }

    return { locked: false };
  }

  // Permission Management
  static getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      student: [
        'certificates:view',
        'certificates:download',
        'profile:view',
        'profile:update'
      ],
      staff: [
        'certificates:view',
        'certificates:create',
        'certificates:update',
        'activities:view',
        'activities:create',
        'activities:update',
        'templates:view',
        'templates:create',
        'students:view'
      ],
      signer: [
        'documents:view',
        'documents:sign',
        'documents:reject',
        'signatures:view',
        'signatures:create',
        'signatures:update',
        'signatures:delete',
        'signing-history:view',
        'analytics:view',
        'notifications:view',
        'notifications:update',
        'reports:export'
      ],
      admin: [
        '*:*' // All permissions
      ]
    };

    return permissions[role] || permissions.student;
  }

  static hasPermission(permission: string): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Admin has all permissions
    if (session.permissions.includes('*:*')) return true;

    // Check exact permission
    if (session.permissions.includes(permission)) return true;

    // Check wildcard permissions
    const [resource, action] = permission.split(':');
    return session.permissions.some(p => {
      const [pResource, pAction] = p.split(':');
      return (pResource === resource && pAction === '*') ||
             (pResource === '*' && pAction === action);
    });
  }

  static hasRole(role: string): boolean {
    const session = this.getSession();
    return session?.role === role;
  }

  static hasAnyRole(roles: string[]): boolean {
    const session = this.getSession();
    return session ? roles.includes(session.role) : false;
  }

  // Multi-Factor Authentication
  static requiresMFA(user: User): boolean {
    const policy = this.getSecurityPolicy();
    return policy.requireMFA || user.role === 'admin' || user.role === 'signer';
  }

  static generateMFASecret(): string {
    return SecurityUtils.generateSecureToken(32);
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(SecurityUtils.generateSecureToken(8).toUpperCase());
    }
    return codes;
  }

  static verifyTOTP(code: string, secret: string): boolean {
    // This would typically use a TOTP library like 'otplib'
    // For now, basic validation
    return /^\d{6}$/.test(code) && code !== '000000';
  }

  static verifyBackupCode(code: string, validCodes: string[]): boolean {
    return validCodes.includes(code.toUpperCase());
  }

  // Device Fingerprinting
  static generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasFingerprint = '';
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test', 2, 2);
      canvasFingerprint = canvas.toDataURL();
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.languages?.join(',') || '',
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0,
      canvasFingerprint
    ].join('|');

    return SecurityUtils.generateHash(fingerprint);
  }

  // Security Policy Management
  static getSecurityPolicy(): SecurityPolicy {
    return SecurityUtils.getSecureItem<SecurityPolicy>(this.SECURITY_POLICY_KEY) || 
           this.DEFAULT_POLICY;
  }

  static updateSecurityPolicy(policy: Partial<SecurityPolicy>): void {
    const currentPolicy = this.getSecurityPolicy();
    const updatedPolicy = { ...currentPolicy, ...policy };
    
    SecurityUtils.setSecureItem(this.SECURITY_POLICY_KEY, updatedPolicy, 24 * 60 * 7); // 1 week
    
    this.logSecurityEvent('security_policy_updated', {
      updatedFields: Object.keys(policy)
    });
  }

  // File Security Validation
  static validateFileUpload(file: File): { valid: boolean; errors: string[] } {
    const policy = this.getSecurityPolicy();
    const errors: string[] = [];

    // Check file type
    if (!policy.allowedFileTypes.includes(file.type)) {
      errors.push(`ไฟล์ประเภท ${file.type} ไม่ได้รับอนุญาต`);
    }

    // Check file size
    if (file.size > policy.maxFileSize) {
      const maxSizeMB = policy.maxFileSize / (1024 * 1024);
      errors.push(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMB}MB)`);
    }

    // Check file name
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('ชื่อไฟล์มีอักขระที่ไม่ได้รับอนุญาต');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Password Security
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const policy = this.getSecurityPolicy();
    const errors: string[] = [];

    if (password.length < policy.passwordMinLength) {
      errors.push(`รหัสผ่านต้องมีความยาวอย่างน้อย ${policy.passwordMinLength} ตัวอักษร`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว');
    }

    if (!/\d/.test(password)) {
      errors.push('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');
    }

    if (policy.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว');
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'user'];
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
      errors.push('รหัสผ่านนี้ไม่ปลอดภัย');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Audit and Logging
  static logSecurityEvent(event: string, details: any = {}): void {
    const session = this.getSession();
    
    SecurityUtils.logSecurityEvent(event, {
      ...details,
      userId: session?.userId,
      sessionToken: session?.sessionToken,
      deviceFingerprint: this.generateDeviceFingerprint()
    });
  }

  static getSecurityLogs(): any[] {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    return logs.filter((log: any) => 
      log.event.includes('login') ||
      log.event.includes('session') ||
      log.event.includes('auth') ||
      log.event.includes('security')
    );
  }

  // Risk Assessment
  static assessLoginRisk(email: string): { risk: 'low' | 'medium' | 'high'; factors: string[] } {
    const factors: string[] = [];
    let riskScore = 0;

    // Check recent failed attempts
    const attempts = this.getLoginAttempts();
    const recentFailures = attempts.filter(attempt => 
      attempt.email === email && 
      !attempt.success &&
      Date.now() - attempt.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    if (recentFailures.length > 0) {
      factors.push(`${recentFailures.length} ครั้งที่ล็อกอินไม่สำเร็จใน 24 ชั่วโมงที่ผ่านมา`);
      riskScore += recentFailures.length * 10;
    }

    // Check device fingerprint changes
    const deviceFingerprint = this.generateDeviceFingerprint();
    const lastSuccessfulLogin = attempts
      .filter(attempt => attempt.email === email && attempt.success)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (lastSuccessfulLogin) {
      // In a real implementation, we'd store and compare device fingerprints
      // For now, we'll simulate this check
      const timeSinceLastLogin = Date.now() - lastSuccessfulLogin.timestamp;
      if (timeSinceLastLogin > 7 * 24 * 60 * 60 * 1000) { // More than 7 days
        factors.push('ไม่ได้ล็อกอินมานานกว่า 7 วัน');
        riskScore += 20;
      }
    }

    // Check time of day (unusual hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      factors.push('ล็อกอินในเวลาที่ไม่ปกติ');
      riskScore += 15;
    }

    // Determine risk level
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 50) {
      risk = 'high';
    } else if (riskScore >= 25) {
      risk = 'medium';
    }

    return { risk, factors };
  }

  // Session Monitoring
  static getActiveSessions(): AuthSession[] {
    // In a real implementation, this would query active sessions from the server
    const currentSession = this.getSession();
    return currentSession ? [currentSession] : [];
  }

  static terminateAllSessions(): void {
    this.terminateSession('terminate_all');
    this.logSecurityEvent('all_sessions_terminated');
  }

  // Security Health Check
  static performSecurityHealthCheck(): { 
    score: number; 
    issues: string[]; 
    recommendations: string[] 
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check HTTPS
    if (!SecurityUtils.isSecureContext()) {
      issues.push('การเชื่อมต่อไม่ปลอดภัย (ไม่ใช่ HTTPS)');
      recommendations.push('ใช้ HTTPS สำหรับการเชื่อมต่อที่ปลอดภัย');
      score -= 30;
    }

    // Check session timeout
    const policy = this.getSecurityPolicy();
    if (policy.sessionTimeout > 60) {
      issues.push('Session timeout ยาวเกินไป');
      recommendations.push('ตั้งค่า session timeout ไม่เกิน 60 นาที');
      score -= 10;
    }

    // Check MFA requirement
    if (!policy.requireMFA) {
      issues.push('ไม่ได้เปิดใช้งาน Multi-Factor Authentication');
      recommendations.push('เปิดใช้งาน MFA สำหรับความปลอดภัยเพิ่มเติม');
      score -= 20;
    }

    // Check password policy
    if (policy.passwordMinLength < 8) {
      issues.push('ความยาวรหัสผ่านขั้นต่ำไม่เพียงพอ');
      recommendations.push('ตั้งค่าความยาวรหัสผ่านขั้นต่ำอย่างน้อย 8 ตัวอักษร');
      score -= 15;
    }

    return { score: Math.max(0, score), issues, recommendations };
  }
}

export default EnhancedAuthManager;