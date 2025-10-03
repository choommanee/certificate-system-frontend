import { Permission } from '../contexts/EnhancedAuthContext';
import SecurityUtils from './security';
import { User } from '../types/signer';
import { useEnhancedAuth } from '../hooks/useEnhancedAuth';

// Signer-specific permissions
export const SIGNER_PERMISSIONS = {
  VIEW_DOCUMENTS: { resource: 'documents', action: 'view' },
  SIGN_DOCUMENTS: { resource: 'documents', action: 'sign' },
  REJECT_DOCUMENTS: { resource: 'documents', action: 'reject' },
  MANAGE_SIGNATURES: { resource: 'signatures', action: 'manage' },
  VIEW_HISTORY: { resource: 'signing-history', action: 'view' },
  VIEW_ANALYTICS: { resource: 'analytics', action: 'view' },
  EXPORT_REPORTS: { resource: 'reports', action: 'export' }
} as const;

// Signer role validation
export class SignerAuthValidator {
  static validateSignerAccess(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'signer' || user.role === 'admin';
  }

  static validateDocumentAccess(
    user: User | null, 
    documentId: string, 
    action: 'view' | 'sign' | 'reject'
  ): boolean {
    if (!this.validateSignerAccess(user)) return false;

    // Additional checks could be added here
    // For example, checking if the signer is assigned to this document
    return true;
  }

  static validateSignatureAccess(
    user: User | null, 
    signatureUserId: string, 
    action: 'view' | 'create' | 'update' | 'delete'
  ): boolean {
    if (!this.validateSignerAccess(user)) return false;

    // Users can only manage their own signatures (unless admin)
    if (user?.role !== 'admin' && user?.id !== signatureUserId) {
      return false;
    }

    return true;
  }

  static validateBatchSigning(
    user: User | null, 
    recipientCount: number
  ): { allowed: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (!this.validateSignerAccess(user)) {
      return { allowed: false, warnings: ['ไม่มีสิทธิ์ในการลงนาม'] };
    }

    // Warn for large batches
    if (recipientCount > 100) {
      warnings.push('จำนวนผู้รับมาก อาจใช้เวลานานในการประมวลผล');
    }

    if (recipientCount > 500) {
      warnings.push('จำนวนผู้รับมากเกินไป แนะนำให้แบ่งเป็นกลุ่มย่อย');
    }

    // Check rate limiting for batch operations
    const rateLimitKey = `batch_signing_${user?.id}`;
    if (!SecurityUtils.checkRateLimit(rateLimitKey, 5, 60)) {
      return { 
        allowed: false, 
        warnings: ['เกินขีดจำกัดการลงนามแบบกลุ่ม กรุณารอ 1 ชั่วโมง'] 
      };
    }

    return { allowed: true, warnings };
  }

  static validateSigningSession(user: User | null): boolean {
    if (!this.validateSignerAccess(user)) return false;

    // Check if session is still valid
    if (!SecurityUtils.isSessionValid()) {
      SecurityUtils.logSecurityEvent('invalid_signing_session', { 
        userId: user?.id 
      });
      return false;
    }

    return true;
  }
}

// Audit logging for signer actions
export class SignerAuditLogger {
  static logSigningAction(
    action: 'sign' | 'reject' | 'view' | 'upload_signature',
    details: {
      userId: string;
      documentId?: string;
      signatureId?: string;
      recipientCount?: number;
      processingTime?: number;
      reason?: string;
    }
  ): void {
    SecurityUtils.logSecurityEvent(`signer_${action}`, {
      ...details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'client-side' // Would be filled by backend
    });
  }

  static logSecurityViolation(
    violation: string,
    details: {
      userId?: string;
      attemptedAction?: string;
      resource?: string;
      severity: 'low' | 'medium' | 'high';
    }
  ): void {
    SecurityUtils.logSecurityEvent('security_violation', {
      violation,
      ...details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // In production, this would trigger alerts for high severity violations
    if (details.severity === 'high') {
      console.error('High severity security violation detected:', violation);
    }
  }

  static logDataAccess(
    resource: string,
    action: string,
    userId: string,
    success: boolean,
    details?: any
  ): void {
    SecurityUtils.logSecurityEvent('data_access', {
      resource,
      action,
      userId,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

// Session management for signers
export class SignerSessionManager {
  private static readonly SESSION_KEY = 'signer_session';
  private static readonly MAX_IDLE_TIME = 30 * 60 * 1000; // 30 minutes

  static initializeSession(user: User): void {
    const sessionData = {
      userId: user.id,
      role: user.role,
      startTime: Date.now(),
      lastActivity: Date.now(),
      activeDocuments: [],
      signatureCount: 0
    };

    SecurityUtils.setSecureItem(this.SESSION_KEY, sessionData, 480); // 8 hours
    SignerAuditLogger.logSigningAction('view', { userId: user.id });
  }

  static updateActivity(documentId?: string): void {
    const session = SecurityUtils.getSecureItem<any>(this.SESSION_KEY);
    if (session) {
      session.lastActivity = Date.now();
      
      if (documentId && !session.activeDocuments.includes(documentId)) {
        session.activeDocuments.push(documentId);
      }

      SecurityUtils.setSecureItem(this.SESSION_KEY, session, 480);
    }
  }

  static incrementSignatureCount(): void {
    const session = SecurityUtils.getSecureItem<any>(this.SESSION_KEY);
    if (session) {
      session.signatureCount++;
      SecurityUtils.setSecureItem(this.SESSION_KEY, session, 480);
    }
  }

  static isSessionActive(): boolean {
    const session = SecurityUtils.getSecureItem<any>(this.SESSION_KEY);
    if (!session) return false;

    const timeSinceActivity = Date.now() - session.lastActivity;
    return timeSinceActivity < this.MAX_IDLE_TIME;
  }

  static getSessionStats(): {
    duration: number;
    documentsViewed: number;
    signaturesCreated: number;
    lastActivity: Date;
  } | null {
    const session = SecurityUtils.getSecureItem<any>(this.SESSION_KEY);
    if (!session) return null;

    return {
      duration: Date.now() - session.startTime,
      documentsViewed: session.activeDocuments.length,
      signaturesCreated: session.signatureCount,
      lastActivity: new Date(session.lastActivity)
    };
  }

  static terminateSession(): void {
    const session = SecurityUtils.getSecureItem<any>(this.SESSION_KEY);
    if (session) {
      SignerAuditLogger.logSigningAction('view', {
        userId: session.userId,
        processingTime: Date.now() - session.startTime
      });
    }
    
    SecurityUtils.removeSecureItem(this.SESSION_KEY);
  }
}

// Hook for signer authentication
export function useSignerAuth() {
  const auth = useEnhancedAuth();

  const canSignDocuments = auth.hasPermission('documents:sign');
  const canManageSignatures = auth.hasPermission('signatures:manage');
  const canViewAnalytics = auth.hasPermission('analytics:view');
  const canExportReports = auth.hasPermission('reports:export');

  const validateDocumentAccess = (documentId: string, action: 'view' | 'sign' | 'reject') => {
    return SignerAuthValidator.validateDocumentAccess(auth.user, documentId, action);
  };

  const validateSignatureAccess = (signatureUserId: string, action: 'view' | 'create' | 'update' | 'delete') => {
    return SignerAuthValidator.validateSignatureAccess(auth.user, signatureUserId, action);
  };

  const validateBatchSigning = (recipientCount: number) => {
    return SignerAuthValidator.validateBatchSigning(auth.user, recipientCount);
  };

  const logSigningAction = (
    action: 'sign' | 'reject' | 'view' | 'upload_signature',
    details: any
  ) => {
    if (auth.user) {
      SignerAuditLogger.logSigningAction(action, {
        userId: auth.user.id,
        ...details
      });
    }
  };

  // Enhanced security features
  const checkSigningPermissions = (documentId: string) => {
    const session = auth.getSessionInfo();
    if (!session) return false;

    // Check if session is still valid
    if (!auth.session) return false;

    // Check specific document permissions
    return validateDocumentAccess(documentId, 'sign');
  };

  const validateSigningSession = () => {
    const session = auth.getSessionInfo();
    if (!session) return false;

    // Check MFA verification for sensitive operations
    if (!session.mfaVerified && auth.hasRole('signer')) {
      return false;
    }

    return true;
  };

  const getSigningRiskAssessment = (documentId: string, recipientCount: number) => {
    const risks: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check batch size
    if (recipientCount > 100) {
      risks.push('จำนวนผู้รับมาก');
      riskLevel = 'medium';
    }

    if (recipientCount > 500) {
      risks.push('จำนวนผู้รับมากเกินไป');
      riskLevel = 'high';
    }

    // Check session age
    const session = auth.getSessionInfo();
    if (session) {
      const sessionAge = Date.now() - session.loginTime;
      const fourHours = 4 * 60 * 60 * 1000;
      
      if (sessionAge > fourHours) {
        risks.push('เซสชันเก่า');
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }
    }

    return { riskLevel, risks };
  };

  return {
    ...auth,
    canSignDocuments,
    canManageSignatures,
    canViewAnalytics,
    canExportReports,
    validateDocumentAccess,
    validateSignatureAccess,
    validateBatchSigning,
    logSigningAction,
    isSigner: auth.hasRole('signer'),
    
    // Enhanced features
    checkSigningPermissions,
    validateSigningSession,
    getSigningRiskAssessment
  };
}

export default SignerAuthValidator;